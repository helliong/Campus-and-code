import { NextResponse } from "next/server";
import { syncYooKassaPayment } from "@/lib/payments/paymentSync";
import { getYooKassaPayment } from "@/lib/payments/yookassa";

export async function POST(request: Request) {
  try {
    const notification = await request.json();
    const paymentId = notification?.object?.id;
    if (typeof paymentId !== "string") {
      return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
    }

    const providerPayment = await getYooKassaPayment(paymentId);
    await syncYooKassaPayment(providerPayment);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("YooKassa webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
