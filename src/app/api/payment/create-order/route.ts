import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = keyId && keySecret ? new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
}) : null;

export async function POST(req: Request) {
  try {
    const { resumeId, userId, usedAITailor, planId } = await req.json();

    let amount = 9900; // Default ₹99 in paise

    if (planId === "pro") {
      amount = 29900; // ₹299 for BOOSTCV Pro in paise
      console.log(`[CREATE ORDER] Creating Pro plan subscription order of ₹299 for user ${userId}.`);
    } else {
      // Verify tailored status directly from Firestore for secure billing check
      try {
        const resumeRef = doc(db, "resumes", resumeId);
        const resumeSnap = await getDoc(resumeRef);
        if (resumeSnap.exists()) {
          const resumeData = resumeSnap.data();
          if (resumeData.usedAITailor === true) {
            amount = 14900; // ₹149 in paise
            console.log(`[CREATE ORDER] Confirmed tailored status for ${resumeId}. Upgraded price to ₹149.`);
          }
        } else if (usedAITailor === true) {
          amount = 14900; // Mock fallback
        }
      } catch (dbErr) {
        console.warn("[CREATE ORDER] Firestore read failed, relying on request context parameter fallback:", dbErr);
        if (usedAITailor === true) {
          amount = 14900;
        }
      }
    }

    const receipt = `rcpt_${resumeId.slice(0, 10)}_${Date.now().toString().slice(-6)}`;

    // If Razorpay SDK is configured, create live checkout order
    if (razorpay) {
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
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
      currency: "INR",
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
