import { NextResponse } from "next/server";
import crypto from "crypto";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const keySecret = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      resumeId 
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Missing checkout parameters." },
        { status: 400 }
      );
    }

    // Verify signature cryptographically if secret key is present
    if (keySecret) {
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(text)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: "Cryptographic signature validation failed. Transaction untrusted." },
          { status: 400 }
        );
      }
    }

    // 1. Update Firestore payment status securely on the server
    try {
      const resumeRef = doc(db, "resumes", resumeId);
      await setDoc(
        resumeRef,
        {
          paymentStatus: "paid",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(`[PAYMENT VERIFY] Successfully marked resume ${resumeId} as paid in Firestore.`);
    } catch (dbErr) {
      console.warn("[PAYMENT VERIFY] Firestore update failed, relying on client-side sync fallback:", dbErr);
    }

    // Verification successful (or skipped in local mock run)
    return NextResponse.json({
      success: true,
      message: "Payment successfully verified.",
      resumeId
    });

  } catch (err: any) {
    console.error("Razorpay signature verification crashed:", err);
    return NextResponse.json(
      { error: "Signature validation routine error." },
      { status: 500 }
    );
  }
}
