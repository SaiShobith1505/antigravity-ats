import { headers } from "next/headers";
import { CountryCode, CurrencyCode, COUNTRY_TO_CURRENCY } from "./pricing";

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
