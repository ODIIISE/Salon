"use client";

import { useEffect, useState } from "react";

type Booking = { id: string; starts_at: string; ends_at: string; status: string; service_name_snapshot: string; customer_name: string | null; artist_name: string };
const salonId = process.env.NEXT_PUBLIC_SALON_ID ?? "";

export default function StudioPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("برای مشاهده برنامه امروز، سالن را پیکربندی کنید.");
  useEffect(() => {
    if (!salonId) return;
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date());
    fetch(`/api/owner/day?salonId=${encodeURIComponent(salonId)}&date=${date}`, { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.code);
      setBookings(data.bookings ?? []);
    }).catch(() => setMessage("ورود استودیو یا اتصال برنامه امروز در دسترس نیست."));
  }, []);
  return <main className="studio-shell" dir="rtl"><header className="studio-header"><div><p className="eyebrow">FOREHAND / STUDIO</p><h1>برنامه امروز</h1></div><span className="status-chip"><i /> تهران · زنده</span></header><section className="studio-summary"><strong>{bookings.length.toLocaleString("fa-IR")}</strong><span>رزرو امروز</span></section>{bookings.length ? <section className="timeline" aria-label="برنامه رزروها">{bookings.map((booking) => <article className="timeline-card" key={booking.id}><time>{new Date(booking.starts_at).toLocaleTimeString("fa-IR", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit" })}</time><div><strong>{booking.service_name_snapshot}</strong><span>{booking.customer_name ?? "رزرو دستی"} · {booking.artist_name}</span></div><b>{booking.status === "confirmed" ? "تأیید شده" : booking.status === "reserved" ? "رزرو شده" : booking.status}</b></article>)}</section> : <section className="studio-empty" role="status"><h2>{message}</h2><p>اطلاعات خصوصی فقط بعد از احراز هویت از سرور خوانده می‌شود.</p></section>}<a className="owner-link" href="/">بازگشت به رزرو مشتری</a></main>;
}
