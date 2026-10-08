export const apiErrors = {
  UNAUTHENTICATED: "برای ادامه وارد شوید.",
  FORBIDDEN: "دسترسی لازم برای این عملیات را ندارید.",
  SLOT_CONFLICT: "این ساعت دیگر در دسترس نیست.",
  HOLD_EXPIRED: "زمان انتخابی منقضی شد؛ دوباره انتخاب کنید.",
  RATE_LIMITED: "تعداد تلاش‌ها زیاد است؛ چند دقیقه بعد دوباره امتحان کنید.",
  SMS_UNAVAILABLE: "ارسال پیامک موقتاً در دسترس نیست.",
  AVAILABILITY_UNAVAILABLE: "زمان‌بندی موقتاً در دسترس نیست.",
  PAYMENT_UNAVAILABLE: "پرداخت موقتاً در دسترس نیست.",
} as const;

export type ApiErrorCode = keyof typeof apiErrors;

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === "string" && value in apiErrors;
}
