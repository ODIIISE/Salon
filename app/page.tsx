"use client";

import { useState } from "react";

const services = [
  { name: "مانیکور کلاسیک", detail: "پاکسازی، فرم‌دهی و مراقبت کامل", duration: "۴۵ دقیقه", price: "۴۸۰٬۰۰۰ تومان" },
  { name: "ژل پولیش", detail: "رنگ ماندگار با فینیش براق", duration: "۶۰ دقیقه", price: "۷۲۰٬۰۰۰ تومان" },
  { name: "طراحی اختصاصی", detail: "جزئیات دست‌ساز برای هر ناخن", duration: "۹۰ دقیقه", price: "۱٬۱۵۰٬۰۰۰ تومان" },
];

const slots = ["۱۰:۰۰", "۱۱:۳۰", "۱۳:۰۰", "۱۵:۳۰", "۱۷:۰۰"];

export default function Home() {
  const [selectedService, setSelectedService] = useState(services[1].name);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notice, setNotice] = useState("برای نهایی‌کردن رزرو، زمان انتخابی روی سرور بررسی می‌شود.");

  function startBooking() {
    if (!selectedSlot) {
      setNotice("یک ساعت را انتخاب کنید تا امکان رزرو آن بررسی شود.");
      return;
    }
    setNotice("این نسخه به لایه رزرو سرور متصل می‌شود؛ هیچ رزروی در مرورگر ذخیره نمی‌شود.");
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand-mark" aria-label="Forehand Nail Studio"><span>F</span><div>FOREHAND<small>NAIL STUDIO</small></div></div>
        <a className="owner-link" href="#owner">ورود استودیو</a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">استودیوی ناخن، با وقتِ خودت</p>
          <h1 id="hero-title">آرامش،<br /><em>با دقت طراحی شده.</em></h1>
          <p className="hero-lede">خدمات مراقبتی و طراحی ناخن با زمان‌بندی شفاف، فضای آرام و تأیید واقعی رزرو.</p>
          <button className="primary-button" onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}>انتخاب وقت <span>←</span></button>
        </div>
        <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="nail-silhouette"><span /></div><small>TEHRAN · ۱۴۰۵</small></div>
      </section>

      <section id="booking" className="booking-panel" aria-labelledby="booking-title">
        <div className="section-heading"><div><p className="eyebrow">رزرو آنلاین</p><h2 id="booking-title">خدمتت را انتخاب کن</h2></div><span className="status-chip"><i /> زمان‌بندی زنده</span></div>
        <div className="service-grid" role="list" aria-label="خدمات">
          {services.map((service) => <button key={service.name} role="listitem" className={`service-card ${selectedService === service.name ? "selected" : ""}`} onClick={() => setSelectedService(service.name)} aria-pressed={selectedService === service.name}><span className="service-index">۰{services.indexOf(service) + ۱}</span><strong>{service.name}</strong><small>{service.detail}</small><div><span>{service.duration}</span><b>{service.price}</b></div></button>)}
        </div>
        <div className="slot-section"><div className="slot-heading"><div><p className="eyebrow">دوشنبه · ۲۱ مهر</p><h3>ساعت پیشنهادی</h3></div><span>Asia/Tehran</span></div><div className="slot-grid" role="radiogroup" aria-label="ساعت‌های در دسترس">{slots.map((slot) => <button key={slot} role="radio" aria-checked={selectedSlot === slot} className={selectedSlot === slot ? "slot selected" : "slot"} onClick={() => setSelectedSlot(slot)}>{slot}</button>)}</div></div>
        <div className="booking-footer"><p role="status" aria-live="polite">{notice}</p><button className="primary-button" onClick={startBooking}>ادامه رزرو <span>←</span></button></div>
      </section>

      <footer><span>FOREHAND / ۰۰۱</span><span>زیبایی، بدون عجله</span><span>حریم خصوصی شما محفوظ است</span></footer>
    </main>
  );
}
