import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { LOCALIZED_PRICING, CurrencyCode } from "@/lib/currency";
import { getLatestExchangeRates } from "@/lib/pricing-server";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = keyId && keySecret ? new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
}) : null;

export async function POST(req: Request) {
  try {
    const { resumeId, userId, planId, currency: clientCurrency } = await req.json();

    const currency: CurrencyCode = clientCurrency || "INR";
    const pricing = LOCALIZED_PRICING[currency] || LOCALIZED_PRICING.INR;

    let baseAmount = pricing.exportPrice;

    if (planId === "pro") {
      baseAmount = pricing.proPrice;
      console.log(`[CREATE ORDER] Creating Pro plan subscription order of ${pricing.currencySymbol}${baseAmount} (${currency}) for user ${userId}.`);
    } else {
      console.log(`[CREATE ORDER] Creating standard flat-rate order of ${pricing.currencySymbol}${baseAmount} (${currency}) for ${resumeId}. (AI-Tailored pricing tier removed)`);
    }

    // Convert localized foreign currency price to its stable INR equivalent amount
    const rates = await getLatestExchangeRates();
    const conversionRate = rates[currency] || 1.0;
    const baseAmountInINR = baseAmount * conversionRate;

    // Razorpay processes payments in the smallest unit of currency (paise for INR)
    const amount = Math.round(baseAmountInINR * 100);
    const receipt = `rcpt_${resumeId.slice(0, 10)}_${Date.now().toString().slice(-6)}`;

    // If Razorpay SDK is configured, create live checkout order
    if (razorpay) {
      const order = await razorpay.orders.create({
        amount,
        currency: "INR", // Keep Razorpay calculations in INR
        receipt,
      });

      return NextResponse.json({
        id: order.id,
        amount: order.amount,
        currency: "INR",
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID,
        displayCurrency: currency, // Local currency for UI & analytics
        displayAmount: baseAmount, // Local price amount for UI & analytics
        conversionRate,
      });
    }

    // High-Fidelity Mock Order for offline sandboxed local runs
    return NextResponse.json({
      id: `order_mock_${Math.random().toString(36).substring(2, 12)}`,
      amount,
      currency: "INR",
      receipt,
      isMock: true,
      displayCurrency: currency,
      displayAmount: baseAmount,
      conversionRate,
    });

  } catch (err: any) {
    console.error("Razorpay order creation crashed:", err);
    return NextResponse.json(
      { error: "Failed to compile payment order ID." },
      { status: 500 }
    );
  }
}
