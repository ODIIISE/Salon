import { NextResponse } from "next/server";
import { sql, noStoreHeaders } from "@/lib/db";
import { currentUser } from "@/lib/auth/session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser(); if (!user) return NextResponse.json({ ok:false, code:"UNAUTHENTICATED" }, {status:401,headers:noStoreHeaders()});
  const {id}=await context.params;
  try {
    const body=await request.json(); const action=String(body.action??"");
    const booking=await sql`SELECT b.id,b.salon_id,b.artist_id,b.service_id,b.status,b.starts_at,u.phone_e164 FROM bookings b JOIN users u ON u.id=b.customer_id WHERE b.id=${id} AND b.customer_id=${user.id} LIMIT 1`;
    if(!booking.rows.length)return NextResponse.json({ok:false,code:"BOOKING_NOT_FOUND"},{status:404,headers:noStoreHeaders()});
    const current=booking.rows[0]; if(!["reserved","confirmed"].includes(current.status))return NextResponse.json({ok:false,code:"BOOKING_NOT_MODIFIABLE"},{status:409,headers:noStoreHeaders()}); if(new Date(current.starts_at).getTime()<=Date.now())return NextResponse.json({ok:false,code:"BOOKING_STARTED"},{status:409,headers:noStoreHeaders()});
    if(action==="cancel"){
      const updated=await sql`UPDATE bookings SET status='cancelled',updated_at=now() WHERE id=${id} AND customer_id=${user.id} AND status IN('reserved','confirmed') RETURNING id,status`;
      await sql`INSERT INTO booking_events(salon_id,booking_id,actor_id,event_type,metadata) VALUES(${current.salon_id},${id},${user.id},'cancelled_by_customer',${JSON.stringify({reason:body.reason??"customer_request"})})`;
      await sql`INSERT INTO notification_jobs(salon_id,booking_id,channel,kind,recipient,payload) VALUES(${current.salon_id},${id},'sms','cancellation',${current.phone_e164},${JSON.stringify({reason:body.reason??"customer_request"})})`;
      return NextResponse.json({ok:true,booking:updated.rows[0]},{headers:noStoreHeaders()});
    }
    if(action==="reschedule"){
      const startsAt=new Date(String(body.startsAt??"")); const endsAt=new Date(String(body.endsAt??"")); if(Number.isNaN(startsAt.valueOf())||Number.isNaN(endsAt.valueOf())||startsAt>=endsAt)return NextResponse.json({ok:false,code:"INVALID_TIME"},{status:400,headers:noStoreHeaders()});
      const conflict=await sql`SELECT id FROM bookings WHERE salon_id=${current.salon_id} AND artist_id=${current.artist_id} AND id<>${id} AND status IN('reserved','confirmed','checked_in') AND starts_at<${endsAt.toISOString()} AND ends_at>${startsAt.toISOString()} LIMIT 1`; if(conflict.rows.length)return NextResponse.json({ok:false,code:"SLOT_CONFLICT"},{status:409,headers:noStoreHeaders()});
      const updated=await sql`UPDATE bookings SET starts_at=${startsAt.toISOString()},ends_at=${endsAt.toISOString()},updated_at=now() WHERE id=${id} AND customer_id=${user.id} AND status IN('reserved','confirmed') RETURNING id,status,starts_at,ends_at`;
      await sql`INSERT INTO booking_events(salon_id,booking_id,actor_id,event_type,metadata) VALUES(${current.salon_id},${id},${user.id},'rescheduled_by_customer',${JSON.stringify({startsAt:startsAt.toISOString(),endsAt:endsAt.toISOString()})})`;
      await sql`INSERT INTO notification_jobs(salon_id,booking_id,channel,kind,recipient,payload) VALUES(${current.salon_id},${id},'sms','reschedule',${current.phone_e164},${JSON.stringify({startsAt:startsAt.toISOString(),endsAt:endsAt.toISOString()})})`;
      return NextResponse.json({ok:true,booking:updated.rows[0]},{headers:noStoreHeaders()});
    }
    return NextResponse.json({ok:false,code:"UNSUPPORTED_ACTION"},{status:400,headers:noStoreHeaders()});
  } catch{return NextResponse.json({ok:false,code:"BOOKING_UPDATE_FAILED"},{status:503,headers:noStoreHeaders()});}
}
