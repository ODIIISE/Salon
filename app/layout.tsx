import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "فورهند | رزرو آرام و مطمئن",
  description: "رزرو آنلاین خدمات ناخن با زمان‌بندی دقیق",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
