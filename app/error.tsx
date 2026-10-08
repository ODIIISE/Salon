"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f3eee8", color: "#171210", fontFamily: "system-ui" }}><section role="alert" style={{ maxWidth: 480, textAlign: "center" }}><p style={{ color: "#7e283b", letterSpacing: ".08em" }}>FOREHAND / RECOVERY</p><h1>اتصال لحظه‌ای برقرار نشد</h1><p>اطلاعات شما حذف نشده است. دوباره تلاش کنید یا چند لحظه بعد برگردید.</p><button onClick={reset} style={{ background: "#171210", color: "#f3eee8", border: 0, padding: "14px 20px", cursor: "pointer" }}>تلاش دوباره</button></section></main>;
}
