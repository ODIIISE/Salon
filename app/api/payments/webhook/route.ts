import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { paymentProvider } from "@/lib/providers/payment";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text(); const signature = request.headers.get("x-payment-signature") ?? undefined; const event = await paymentProvider().verifyWebhook({ rawBody, signature });
    const payment=await sql`UPDATE payments SET status=${event.status},provider_reference=${event.providerReference},updated_at=now() WHERE idempotency_key=${event.idempotencyKey} AND amount_irr=${event.amountIrr} RETURNING booking_id,status`; if(!payment.rows.length)return NextResponse.json({ok:false,code:"PAYMENT_NOT_FOUND"},{status:404});
    if(payment.rows[0].status==="paid")await sql`UPDATE bookings SET status='confirmed',updated_at=now() WHERE id=${payment.rows[0].booking_id} AND status='reserved'`;
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({ok:false,code:"WEBHOOK_REJECTED"},{status:400});}
}
