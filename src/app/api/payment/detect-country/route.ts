import { NextResponse } from "next/server";
import { detectServerCountryAndCurrency } from "@/lib/pricing-server";

export async function GET() {
  try {
    const { country, currency } = await detectServerCountryAndCurrency();
    return NextResponse.json({ country, currency });
  } catch (err) {
    console.error("[DETECT COUNTRY API] Failed to resolve edge geolocation:", err);
    return NextResponse.json(
      { error: "Failed to resolve geolocation headers." },
      { status: 500 }
    );
  }
}
