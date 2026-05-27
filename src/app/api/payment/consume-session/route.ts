import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { resumeId } = await req.json();

    if (!resumeId) {
      return NextResponse.json(
        { error: "Missing resume identifier." },
        { status: 400 }
      );
    }

    // 1. Securely update Firestore state to consume/invalidate the token
    try {
      const resumeRef = doc(db, "resumes", resumeId);
      const docSnap = await getDoc(resumeRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const exportSession = data.exportSession || {};
        
        await setDoc(
          resumeRef,
          {
            paymentStatus: "unpaid",
            exportSession: {
              ...exportSession,
              downloaded: true,
              consumedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
        console.log(`[PAYMENT CONSUME] Successfully consumed session for resume ${resumeId}.`);
      }
    } catch (dbErr) {
      console.warn("[PAYMENT CONSUME] Firestore consumption failed:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Payment session successfully consumed and locked."
    });

  } catch (err: any) {
    console.error("Payment session consumption crashed:", err);
    return NextResponse.json(
      { error: "Session invalidation handler failure." },
      { status: 500 }
    );
  }
}
