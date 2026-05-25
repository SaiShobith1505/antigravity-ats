import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = keyId && keySecret ? new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
}) : null;

export async function POST(req: Request) {
  try {
    const { resumeId, userId } = await req.json();

    const amount = 8000; // ₹80.00 in paise
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
