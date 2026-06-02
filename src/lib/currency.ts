export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AUD" | "CAD";
export type CountryCode = "IN" | "US" | "GB" | "EU" | "AU" | "CA";

export interface PricingGrid {
  exportPrice: number;       // Base Single Export
  tailorPrice: number;       // Tailored Single Export
  proPrice: number;          // Pro Subscription
  currencySymbol: string;
  currencyName: string;
}

export const LOCALIZED_PRICING: Record<CurrencyCode, PricingGrid> = {
  INR: {
    exportPrice: 99,
    tailorPrice: 149,
    proPrice: 299,
    currencySymbol: "₹",
    currencyName: "INR",
  },
  USD: {
    exportPrice: 1.49,
    tailorPrice: 2.29,
    proPrice: 4.99,
    currencySymbol: "$",
    currencyName: "USD",
  },
  GBP: {
    exportPrice: 1.29,
    tailorPrice: 1.99,
    proPrice: 3.99,
    currencySymbol: "£",
    currencyName: "GBP",
  },
  EUR: {
    exportPrice: 1.39,
    tailorPrice: 2.09,
    proPrice: 4.49,
    currencySymbol: "€",
    currencyName: "EUR",
  },
  AUD: {
    exportPrice: 2.29,
    tailorPrice: 3.29,
    proPrice: 6.99,
    currencySymbol: "A$",
    currencyName: "AUD",
  },
  CAD: {
    exportPrice: 1.99,
    tailorPrice: 2.99,
    proPrice: 5.99,
    currencySymbol: "C$",
    currencyName: "CAD",
  },
};

export const COUNTRY_TO_CURRENCY: Record<CountryCode, CurrencyCode> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  EU: "EUR",
  AU: "AUD",
  CA: "CAD",
};

export const CURRENCY_TO_COUNTRY: Record<CurrencyCode, CountryCode> = {
  INR: "IN",
  USD: "US",
  GBP: "GB",
  EUR: "EU",
  AUD: "AU",
  CAD: "CA",
};

// Auto-detect visitor's country and preferred currency based on browser properties
export function detectUserCountryAndCurrency(): { country: CountryCode; currency: CurrencyCode } {
  if (typeof window === "undefined") {
    return { country: "US", currency: "USD" }; // Server-side default
  }

  // Check cached preferences
  const cachedCountry = localStorage.getItem("cv_boost_selected_country") as CountryCode;
  const cachedCurrency = localStorage.getItem("cv_boost_selected_currency") as CurrencyCode;
  
  if (cachedCountry && cachedCurrency && LOCALIZED_PRICING[cachedCurrency]) {
    return { country: cachedCountry, currency: cachedCurrency };
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lowerTz = tz.toLowerCase();

    // 1. India check
    if (lowerTz.includes("calcutta") || lowerTz.includes("kolkata") || lowerTz.includes("asia/india") || lowerTz.includes("delhi")) {
      return { country: "IN", currency: "INR" };
    }

    // 2. United Kingdom check
    if (lowerTz.includes("london") || lowerTz.includes("belfast") || lowerTz.includes("europe/dublin") || lowerTz.includes("gb")) {
      return { country: "GB", currency: "GBP" };
    }

    // 3. Australia check
    if (lowerTz.includes("sydney") || lowerTz.includes("melbourne") || lowerTz.includes("brisbane") || lowerTz.includes("adelaide") || lowerTz.includes("perth") || lowerTz.includes("hobart") || lowerTz.includes("darwin") || lowerTz.includes("australia")) {
      return { country: "AU", currency: "AUD" };
    }

    // 4. Canada check
    if (lowerTz.includes("toronto") || lowerTz.includes("vancouver") || lowerTz.includes("montreal") || lowerTz.includes("edmonton") || lowerTz.includes("calgary") || lowerTz.includes("halifax") || lowerTz.includes("winnipeg") || lowerTz.includes("canada")) {
      return { country: "CA", currency: "CAD" };
    }

    // 5. Europe zone checks
    const euroZones = ["paris", "berlin", "rome", "madrid", "amsterdam", "brussels", "vienna", "stockholm", "athens", "warsaw", "zurich", "copenhagen", "helsinki", "lisbon", "prague", "dublin"];
    if (euroZones.some(zone => lowerTz.includes(zone))) {
      return { country: "EU", currency: "EUR" };
    }

    // 6. US check as default backup for standard western timezones
    if (lowerTz.includes("america") || lowerTz.includes("us/") || lowerTz.includes("pacific") || lowerTz.includes("eastern") || lowerTz.includes("central") || lowerTz.includes("mountain")) {
      return { country: "US", currency: "USD" };
    }

  } catch (err) {
    console.warn("Timezone resolution failed, falling back to browser language locale:", err);
  }

  // Fallback to language locales
  try {
    const lang = navigator.language || "";
    if (lang.startsWith("en-IN") || lang.startsWith("hi-")) {
      return { country: "IN", currency: "INR" };
    }
    if (lang.startsWith("en-GB")) {
      return { country: "GB", currency: "GBP" };
    }
    if (lang.startsWith("en-AU")) {
      return { country: "AU", currency: "AUD" };
    }
    if (lang.startsWith("en-CA") || lang.startsWith("fr-CA")) {
      return { country: "CA", currency: "CAD" };
    }
    const euroLangs = ["fr-", "de-", "it-", "es-", "nl-", "pt-", "pl-", "el-", "fi-", "sv-"];
    if (euroLangs.some(el => lang.startsWith(el))) {
      return { country: "EU", currency: "EUR" };
    }
  } catch (_) {}

  // Standard global default is United States
  return { country: "US", currency: "USD" };
}

// Utility to display nicely formatted localized price strings
export function formatPrice(amount: number, currency: CurrencyCode): string {
  const grid = LOCALIZED_PRICING[currency] || LOCALIZED_PRICING.USD;
  return `${grid.currencySymbol}${amount.toFixed(2)}`;
}
