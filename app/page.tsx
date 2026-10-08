"use client";

import { useEffect, useMemo, useState } from "react";

type Service = { id: string; name: string; detail: string; duration_minutes: number; price_irr: number };
type Slot = { startsAtMinutes: number; endsAtMinutes: number; artistId: string; suggested: boolean };
const fallbackServices: Service[] = [
  { id: "", name: "مانیکور کلاسیک", detail: "پاکسازی، فرم‌دهی و مراقبت کامل", duration_minutes: 45, price_irr: 480000 },
  { id: "", name: "ژل پولیش", detail: "رنگ ماندگار با فینیش براق", duration_minutes: 60, price_irr: 720000 },
  { id: "", name: "طراحی اختصاصی", detail: "جزئیات دست‌ساز برای هر ناخن", duration_minutes: 90, price_irr: 1150000 },
];
const salonId = process.env.NEXT_PUBLIC_SALON_ID ?? "";
const toman = (value: number) => new Intl.NumberFormat("fa-IR").format(Math.round(value / 10)) + " تومان";
const faTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export default function Home() {
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [selectedService, setSelectedService] = useState<Service>(fallbackServices[1]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("برای نهایی‌کردن رزرو، زمان انتخابی روی سرور بررسی می‌شود.");

  useEffect(() => {
    if (!salonId) return;
    fetch(`/api/public/catalog?salonId=${encodeURIComponent(salonId)}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data.ok || !data.services?.length) throw new Error("catalog");
      setServices(data.services); setSelectedService(data.services[0]);
    }).catch(() => setNotice("اتصال کاتالوگ برقرار نشد؛ اطلاعات نمایشی است و رزوی ثبت نمی‌شود."));
  }, []);

  useEffect(() => {
    setSelectedSlot(null); setSlots([]);
    if (!salonId || !selectedService.id) return;
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date());
    fetch(`/api/availability?salonId=${encodeURIComponent(salonId)}&serviceId=${encodeURIComponent(selectedService.id)}&date=${date}`).then(async (response) => {
      const data = await response.json(); if (!response.ok || !data.ok) throw new Error("availability"); setSlots(data.slots ?? []);
    }).catch(() => setNotice("زمان‌بندی در دسترس نیست؛ بعداً دوباره تلاش کنید."));
  }, [selectedService]);

  const visibleSlots = useMemo(() => slots.length ? slots : [{ startsAtMinutes: 10 * 60, endsAtMinutes: 10 * 60 + selectedService.duration_minutes, artistId: "", suggested: true }, { startsAtMinutes: 13 * 60, endsAtMinutes: 13 * 60 + selectedService.duration_minutes, artistId: "", suggested: true }, { startsAtMinutes: 17 * 60, endsAtMinutes: 17 * 60 + selectedService.duration_minutes, artistId: "", suggested: false }], [slots, selectedService]);
  async function startBooking() {
    if (!selectedSlot) return setNotice("یک ساعت را انتخاب کنید تا امکان رزرو آن بررسی شود.");
    if (!salonId || !selectedService.id || !selectedSlot.artistId) return setNotice("این نسخه نمایشی هنوز به کاتالوگ و سالن متصل نیست؛ رزروی ذخیره نشد.");
    setBusy(true); setNotice("در حال بررسی و نگه‌داشتن این ساعت...");
    try {
      const starts = new Date(); starts.setHours(Math.floor(selectedSlot.startsAtMinutes / 60), selectedSlot.startsAtMinutes % 60, 0, 0);
      const ends = new Date(starts.getTime() + selectedService.duration_minutes * 60000);
      const hold = await fetch("/api/holds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ salonId, serviceId: selectedService.id, artistId: selectedSlot.artistId, startsAt: starts.toISOString(), endsAt: ends.toISOString() }) });
      const result = await hold.json();
      if (hold.status === 401) return setNotice("برای رزرو، ابتدا با شماره موبایل وارد شوید.");
      if (hold.status === 409) return setNotice("این ساعت همین حالا رزرو شد؛ یک زمان دیگر انتخاب کنید.");
      if (!hold.ok) throw new Error("hold");
      setNotice(`این ساعت تا ${new Date(result.hold.expires_at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })} برای شما نگه داشته شد. مرحله تأیید در حال آماده‌سازی است.`);
    } catch { setNotice("اتصال برقرار نشد. چیزی در مرورگر ذخیره نشده؛ دوباره تلاش کنید."); } finally { setBusy(false); }
  }

  return <main className="site-shell"><header className="topbar"><div className="brand-mark" aria-label="Forehand Nail Studio"><span>F</span><div>FOREHAND<small>NAIL STUDIO</small></div></div><a className="owner-link" href="#owner">ورود استودیو</a></header><section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow">استودیوی ناخن، با وقتِ خودت</p><h1 id="hero-title">آرامش،<br /><em>با دقت طراحی شده.</em></h1><p className="hero-lede">خدمات مراقبتی و طراحی ناخن با زمان‌بندی شفاف، فضای آرام و تأیید واقعی رزرو.</p><button className="primary-button" onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}>انتخاب وقت <span>←</span></button></div><div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="nail-silhouette"><span /></div><small>TEHRAN · ۱۴۰۵</small></div></section><section id="booking" className="booking-panel" aria-labelledby="booking-title"><div className="section-heading"><div><p className="eyebrow">رزرو آنلاین</p><h2 id="booking-title">خدمتت را انتخاب کن</h2></div><span className="status-chip"><i /> زمان‌بندی زنده</span></div><div className="service-grid" role="list" aria-label="خدمات">{services.map((service, i) => <button key={service.id || service.name} role="listitem" className={`service-card ${selectedService.name === service.name ? "selected" : ""}`} onClick={() => setSelectedService(service)} aria-pressed={selectedService.name === service.name}><span className="service-index">۰{i + ۱}</span><strong>{service.name}</strong><small>{service.detail}</small><div><span>{service.duration_minutes} دقیقه</span><b>{toman(service.price_irr)}</b></div></button>)}</div><div className="slot-section"><div className="slot-heading"><div><p className="eyebrow">امروز · تهران</p><h3>ساعت پیشنهادی</h3></div><span>Asia/Tehran</span></div><div className="slot-grid" role="radiogroup" aria-label="ساعت‌های در دسترس">{visibleSlots.map((slot) => <button key={`${slot.startsAtMinutes}-${slot.artistId}`} role="radio" aria-checked={selectedSlot?.startsAtMinutes === slot.startsAtMinutes} className={selectedSlot?.startsAtMinutes === slot.startsAtMinutes ? "slot selected" : "slot"} onClick={() => setSelectedSlot(slot)}>{faTime(slot.startsAtMinutes)}</button>)}</div></div><div className="booking-footer"><p role="status" aria-live="polite">{notice}</p><button className="primary-button" disabled={busy} onClick={startBooking}>{busy ? "در حال بررسی..." : "ادامه رزرو"} <span>←</span></button></div></section><footer><span>FOREHAND / ۰۰۱</span><span>زیبایی، بدون عجله</span><span>حریم خصوصی شما محفوظ است</span></footer></main>;
}
