import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LOCALIZED_PRICING, CurrencyCode } from "@/lib/currency";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = keyId && keySecret ? new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
}) : null;

export async function POST(req: Request) {
  try {
    const { resumeId, userId, usedAITailor, planId, currency: clientCurrency } = await req.json();

    const currency: CurrencyCode = clientCurrency || "INR";
    const pricing = LOCALIZED_PRICING[currency] || LOCALIZED_PRICING.INR;

    let baseAmount = pricing.exportPrice;

    if (planId === "pro") {
      baseAmount = pricing.proPrice;
      console.log(`[CREATE ORDER] Creating Pro plan subscription order of ${pricing.currencySymbol}${baseAmount} (${currency}) for user ${userId}.`);
    } else {
      // Verify tailored status directly from Firestore for secure billing check
      let tailored = usedAITailor === true;
      try {
        const resumeRef = doc(db, "resumes", resumeId);
        const resumeSnap = await getDoc(resumeRef);
        if (resumeSnap.exists()) {
          const resumeData = resumeSnap.data();
          if (resumeData.usedAITailor === true) {
            tailored = true;
          }
        }
      } catch (dbErr) {
        console.warn("[CREATE ORDER] Firestore read failed, relying on request context parameter fallback:", dbErr);
      }

      if (tailored) {
        baseAmount = pricing.tailorPrice;
        console.log(`[CREATE ORDER] Confirmed tailored status for ${resumeId}. Upgraded price to ${pricing.currencySymbol}${baseAmount} (${currency}).`);
      } else {
        console.log(`[CREATE ORDER] Creating standard order of ${pricing.currencySymbol}${baseAmount} (${currency}) for ${resumeId}.`);
      }
    }

    // Razorpay and common payment gateways expect amount in smallest unit of currency (paise/cents)
    const amount = Math.round(baseAmount * 100);
    const receipt = `rcpt_${resumeId.slice(0, 10)}_${Date.now().toString().slice(-6)}`;

    // If Razorpay SDK is configured, create live checkout order
    if (razorpay) {
      const order = await razorpay.orders.create({
        amount,
        currency,
        receipt,
      });

      return NextResponse.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    // High-Fidelity Mock Order for offline sandboxed local runs
    return NextResponse.json({
      id: `order_mock_${Math.random().toString(36).substring(2, 12)}`,
      amount,
      currency,
      receipt,
      isMock: true,
    });

  } catch (err: any) {
    console.error("Razorpay order creation crashed:", err);
    return NextResponse.json(
      { error: "Failed to compile payment order ID." },
      { status: 500 }
    );
  }
}
