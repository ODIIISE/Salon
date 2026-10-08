import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { currentUser } from "@/lib/auth/session";
import { paymentProvider } from "@/lib/providers/payment";

export async function POST(request: Request) {
  const user = await currentUser(); if (!user) return NextResponse.json({ ok:false,code:"UNAUTHENTICATED" },{status:401,headers:noStoreHeaders()});
  try {
    const body=await request.json(); const bookingId=String(body.bookingId??""); const key=String(body.idempotencyKey??request.headers.get("Idempotency-Key")??""); if(!bookingId||!key) return NextResponse.json({ok:false,code:"INVALID_REQUEST"},{status:400});
    const booking=await sql`SELECT id,salon_id,price_irr_snapshot,status,customer_id FROM bookings WHERE id=${bookingId} AND customer_id=${user.id} LIMIT 1`; if(!booking.rows.length)return NextResponse.json({ok:false,code:"BOOKING_NOT_FOUND"},{status:404});
    const policy=await sql`SELECT mode,deposit_percent FROM payment_policies WHERE salon_id=${booking.rows[0].salon_id} LIMIT 1`; const percent=Number(policy.rows[0]?.deposit_percent??0); if(policy.rows[0]?.mode!=="deposit_required"||percent===0)return NextResponse.json({ok:false,code:"PAY_AT_SALON"},{status:409,headers:noStoreHeaders()});
    const amount=Math.ceil(Number(booking.rows[0].price_irr_snapshot)*percent/100); const intent=await paymentProvider().createIntent({amountIrr:amount,bookingId,idempotencyKey:key});
    await sql`INSERT INTO payments(salon_id,booking_id,provider,amount_irr,status,idempotency_key) VALUES(${booking.rows[0].salon_id},${bookingId},'manual',${amount},${intent.status},${key}) ON CONFLICT(idempotency_key) DO NOTHING`;
    return NextResponse.json({ok:true,intent,amountIrr:amount},{headers:noStoreHeaders()});
  } catch{return NextResponse.json({ok:false,code:"PAYMENT_UNAVAILABLE"},{status:503,headers:noStoreHeaders()});}
}
