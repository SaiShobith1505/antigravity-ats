import { headers } from "next/headers";
import { CountryCode, CurrencyCode, COUNTRY_TO_CURRENCY, INR_CONVERSION_RATES } from "./pricing";

interface ExchangeRateCache {
  rates: Record<CurrencyCode, number>;
  lastUpdated: number;
}

// In-memory server-side cache
let rateCache: ExchangeRateCache | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function getLatestExchangeRates(): Promise<Record<CurrencyCode, number>> {
  // Check if cache is fresh
  if (rateCache && (Date.now() - rateCache.lastUpdated < CACHE_TTL)) {
    console.log("[PRICING SERVER] Utilizing fresh in-memory exchange rate cache.");
    return rateCache.rates;
  }

  try {
    console.log("[PRICING SERVER] Cache expired or missing. Fetching daily exchange rates from open.er-api.com...");
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000); // 5-second network timeout

    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: controller.signal,
      next: { revalidate: 3600 } // Next.js level caching (1 hour)
    });
    clearTimeout(id);

    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json();
    if (data && data.result === "success" && data.rates) {
      const apiRates = data.rates;
      const inrRate = apiRates.INR;

      if (inrRate) {
        const resolvedRates: Record<CurrencyCode, number> = {
          INR: 1.0,
          USD: inrRate / (apiRates.USD || 1.0),
          GBP: inrRate / (apiRates.GBP || 0.78),
          EUR: inrRate / (apiRates.EUR || 0.92),
          AUD: inrRate / (apiRates.AUD || 1.50),
          CAD: inrRate / (apiRates.CAD || 1.36)
        };

        // Standardize rate rounding for financial consistency
        for (const key in resolvedRates) {
          const k = key as CurrencyCode;
          resolvedRates[k] = parseFloat(resolvedRates[k].toFixed(4));
        }

        rateCache = {
          rates: resolvedRates,
          lastUpdated: Date.now()
        };

        console.log("[PRICING SERVER] Successfully updated daily exchange rates:", resolvedRates);
        return resolvedRates;
      }
    }
    throw new Error("Invalid API response format");

  } catch (err) {
    console.warn("[PRICING SERVER] Daily exchange rates fetch failed. Falling back to metrics:", err);
    
    // If we have an expired cache, use it as a higher-fidelity fallback than hardcoded rates
    if (rateCache) {
      console.log("[PRICING SERVER] Falling back to expired in-memory cache rates.");
      return rateCache.rates;
    }

    // Ultimate fallback: safe static rates
    console.log("[PRICING SERVER] Falling back to safe hardcoded static exchange rates.");
    return INR_CONVERSION_RATES;
  }
}

// Server-Side Geolocation detection leveraging Vercel Edge country header
export async function detectServerCountryAndCurrency(): Promise<{ country: CountryCode; currency: CurrencyCode }> {
  try {
    const reqHeaders = await headers();
    
    // 1. Vercel Edge Geolocation Header x-vercel-ip-country
    const vercelCountry = reqHeaders.get("x-vercel-ip-country");
    if (vercelCountry) {
      const cleaned = vercelCountry.toUpperCase() as CountryCode;
      if (COUNTRY_TO_CURRENCY[cleaned]) {
        return { country: cleaned, currency: COUNTRY_TO_CURRENCY[cleaned] };
      }
      // General European countries fallback to EU / EUR
      const euroCountries = ["FR", "DE", "IT", "ES", "NL", "PT", "PL", "IE", "FI", "SE", "DK", "AT", "BE", "GR"];
      if (euroCountries.includes(cleaned)) {
        return { country: "EU", currency: "EUR" };
      }
    }

    // 2. Accept-Language request header fallback
    const acceptLang = reqHeaders.get("accept-language") || "";
    const lowerLang = acceptLang.toLowerCase();
    if (lowerLang.includes("in") || lowerLang.includes("hi")) {
      return { country: "IN", currency: "INR" };
    }
    if (lowerLang.includes("gb") || lowerLang.includes("uk")) {
      return { country: "GB", currency: "GBP" };
    }
    if (lowerLang.includes("au")) {
      return { country: "AU", currency: "AUD" };
    }
    if (lowerLang.includes("ca")) {
      return { country: "CA", currency: "CAD" };
    }
    const euroLangs = ["fr", "de", "it", "es", "nl", "pt", "pl", "fi", "sv"];
    if (euroLangs.some(lang => lowerLang.includes(lang))) {
      return { country: "EU", currency: "EUR" };
    }
  } catch (err) {
    console.warn("Failed to read server headers for geolocating country:", err);
  }

  // Fallback to standard US/USD default
  return { country: "US", currency: "USD" };
}
