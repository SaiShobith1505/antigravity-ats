
export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AUD" | "CAD";
export type CountryCode = "IN" | "US" | "GB" | "EU" | "AU" | "CA";

export interface PricingGrid {
  exportPrice: number;       // Base Single Export (Flat rate, AI-Tailored tier removed)
  proPrice: number;          // Pro Subscription
  currencySymbol: string;
  currencyName: string;
}

export const LOCALIZED_PRICING: Record<CurrencyCode, PricingGrid> = {
  INR: {
    exportPrice: 99,
    proPrice: 299,
    currencySymbol: "₹",
    currencyName: "INR",
  },
  USD: {
    exportPrice: 3.99,
    proPrice: 9.99,
    currencySymbol: "$",
    currencyName: "USD",
  },
  GBP: {
    exportPrice: 3.49,
    proPrice: 8.99,
    currencySymbol: "£",
    currencyName: "GBP",
  },
  EUR: {
    exportPrice: 3.99,
    proPrice: 9.99,
    currencySymbol: "€",
    currencyName: "EUR",
  },
  AUD: {
    exportPrice: 5.99,
    proPrice: 12.99,
    currencySymbol: "A$",
    currencyName: "AUD",
  },
  CAD: {
    exportPrice: 4.99,
    proPrice: 11.99,
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

// Stable standard conversion rates to INR for Razorpay checkout processing
export const INR_CONVERSION_RATES: Record<CurrencyCode, number> = {
  INR: 1.0,
  USD: 83.5,
  GBP: 106.0,
  EUR: 90.5,
  AUD: 55.5,
  CAD: 61.5,
};


// Client-Side detection based on local settings and timezone offsets
export function detectUserCountryAndCurrency(): { country: CountryCode; currency: CurrencyCode } {
  if (typeof window === "undefined") {
    return { country: "US", currency: "USD" };
  }

  // Check manual selector preferences cache
  const cachedCountry = localStorage.getItem("cv_boost_selected_country") as CountryCode;
  const cachedCurrency = localStorage.getItem("cv_boost_selected_currency") as CurrencyCode;
  
  if (cachedCountry && cachedCurrency && LOCALIZED_PRICING[cachedCurrency]) {
    return { country: cachedCountry, currency: cachedCurrency };
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lowerTz = tz.toLowerCase();

    if (lowerTz.includes("calcutta") || lowerTz.includes("kolkata") || lowerTz.includes("asia/india") || lowerTz.includes("delhi")) {
      return { country: "IN", currency: "INR" };
    }
    if (lowerTz.includes("london") || lowerTz.includes("belfast") || lowerTz.includes("europe/dublin") || lowerTz.includes("gb")) {
      return { country: "GB", currency: "GBP" };
    }
    if (lowerTz.includes("sydney") || lowerTz.includes("melbourne") || lowerTz.includes("brisbane") || lowerTz.includes("adelaide") || lowerTz.includes("perth") || lowerTz.includes("australia")) {
      return { country: "AU", currency: "AUD" };
    }
    if (lowerTz.includes("toronto") || lowerTz.includes("vancouver") || lowerTz.includes("montreal") || lowerTz.includes("canada")) {
      return { country: "CA", currency: "CAD" };
    }
    const euroZones = ["paris", "berlin", "rome", "madrid", "amsterdam", "brussels", "vienna", "stockholm", "athens", "warsaw", "zurich", "copenhagen", "helsinki", "lisbon", "prague", "dublin"];
    if (euroZones.some(zone => lowerTz.includes(zone))) {
      return { country: "EU", currency: "EUR" };
    }
    if (lowerTz.includes("america") || lowerTz.includes("us/") || lowerTz.includes("pacific") || lowerTz.includes("eastern") || lowerTz.includes("central") || lowerTz.includes("mountain")) {
      return { country: "US", currency: "USD" };
    }
  } catch (err) {}

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

  return { country: "US", currency: "USD" };
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const grid = LOCALIZED_PRICING[currency] || LOCALIZED_PRICING.USD;
  return `${grid.currencySymbol}${amount.toFixed(2)}`;
}
