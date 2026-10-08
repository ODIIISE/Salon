import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) { const salonId=new URL(request.url).searchParams.get("salonId"); if(!salonId)return NextResponse.json({ok:false,code:"INVALID_REQUEST"},{status:400}); const result=await sql`SELECT mode,deposit_percent,cancellation_hours,no_show_percent FROM payment_policies WHERE salon_id=${salonId} LIMIT 1`; return NextResponse.json({ok:true,policy:result.rows[0]??{mode:"pay_at_salon",deposit_percent:0,cancellation_hours:24,no_show_percent:0}},{headers:{"Cache-Control":"public,max-age=60,stale-while-revalidate=300"}}); }
