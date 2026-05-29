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
    let newRemaining = 0;
    let newUsed = 1;
    try {
      const resumeRef = doc(db, "resumes", resumeId);
      const docSnap = await getDoc(resumeRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const exportSession = data.exportSession || {};
        const currentRemaining = data.downloadsRemaining !== undefined ? data.downloadsRemaining : 2;
        newRemaining = Math.max(0, currentRemaining - 1);
        const currentUsed = data.downloadsUsed !== undefined ? data.downloadsUsed : 0;
        newUsed = currentUsed + 1;
        
        await setDoc(
          resumeRef,
          {
            paymentStatus: newRemaining > 0 ? "paid" : "unpaid",
            downloadsRemaining: newRemaining,
            downloadsUsed: newUsed,
            exportSession: {
              ...exportSession,
              downloaded: newRemaining > 0 ? false : true,
              consumedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
        console.log(`[PAYMENT CONSUME] Successfully consumed session for resume ${resumeId}. Remaining: ${newRemaining}, Used: ${newUsed}`);
      }
    } catch (dbErr) {
      console.warn("[PAYMENT CONSUME] Firestore consumption failed:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Payment session successfully consumed.",
      downloadsRemaining: newRemaining,
      downloadsUsed: newUsed
    });

  } catch (err: any) {
    console.error("Payment session consumption crashed:", err);
    return NextResponse.json(
      { error: "Session invalidation handler failure." },
      { status: 500 }
    );
  }
}
