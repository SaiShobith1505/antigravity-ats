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
      resumeId,
      userId,
      planId
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

    // 1. Check if the purchase is for the BOOSTCV Pro plan subscription
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    if (planId === "pro") {
      try {
        const userRef = doc(db, "users", userId);
        await setDoc(
          userRef,
          {
            isPro: true,
            proExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            exportsRemaining: 10,
            atsScansRemaining: 9999,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log(`[PAYMENT VERIFY] Successfully upgraded user ${userId} to BOOSTCV Pro (10 exports, unlimited scans).`);
      } catch (dbErr) {
        console.warn("[PAYMENT VERIFY] Firestore update failed for Pro profile:", dbErr);
      }
    } else {
      // 2. Single resume export flow (remains exactly as it is)
      try {
        const resumeRef = doc(db, "resumes", resumeId);
        await setDoc(
          resumeRef,
          {
            paymentStatus: "paid",
            downloadsRemaining: 2,
            downloadsUsed: 0,
            paymentDate: new Date().toISOString(),
            exportSession: {
              token: sessionToken,
              expiresAt,
              downloaded: false
            },
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log(`[PAYMENT VERIFY] Successfully created secure temporary export session (2 allowance) for resume ${resumeId}.`);
      } catch (dbErr) {
        console.warn("[PAYMENT VERIFY] Firestore update failed, relying on client-side sync fallback:", dbErr);
      }
    }

    // Verification successful (or skipped in local mock run)
    return NextResponse.json({
      success: true,
      message: "Payment successfully verified.",
      resumeId,
      exportSession: {
        token: sessionToken,
        expiresAt,
        downloaded: false
      }
    });

  } catch (err: any) {
    console.error("Razorpay signature verification crashed:", err);
    return NextResponse.json(
      { error: "Signature validation routine error." },
      { status: 500 }
    );
  }
}
