import { z } from "zod";

const schema = z.object({
  POSTGRES_URL: z.string().min(1).optional(),
  OWNER_SESSION_SECRET: z.string().min(32).optional(),
  CUSTOMER_SESSION_SECRET: z.string().min(32).optional(),
  BOOTSTRAP_OWNER_SECRET: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_SALON_ID: z.string().min(1).optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SMS_PROVIDER: z.enum(["mock", "farazsms"]).default("mock"),
  SMS_API_KEY: z.string().min(1).optional(),
  SMS_LINE_NUMBER: z.string().min(1).optional(),
  SMS_PATTERN_CODE: z.string().min(1).optional(),
  PAYMENT_PROVIDER: z.enum(["manual"]).default("manual"),
});

export const env = schema.parse({
  POSTGRES_URL: process.env.POSTGRES_URL,
  OWNER_SESSION_SECRET: process.env.OWNER_SESSION_SECRET,
  CUSTOMER_SESSION_SECRET: process.env.CUSTOMER_SESSION_SECRET,
  BOOTSTRAP_OWNER_SECRET: process.env.BOOTSTRAP_OWNER_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,
  NEXT_PUBLIC_SALON_ID: process.env.NEXT_PUBLIC_SALON_ID,
  APP_URL: process.env.APP_URL,
  NODE_ENV: process.env.NODE_ENV,
  SMS_PROVIDER: process.env.SMS_PROVIDER,
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_LINE_NUMBER: process.env.SMS_LINE_NUMBER,
  SMS_PATTERN_CODE: process.env.SMS_PATTERN_CODE,
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
});

export function assertProductionEnvironment() {
  if (env.NODE_ENV !== "production") return;
  if (
    !env.POSTGRES_URL ||
    !env.OWNER_SESSION_SECRET ||
    !env.CUSTOMER_SESSION_SECRET ||
    !env.CRON_SECRET ||
    !env.NEXT_PUBLIC_SALON_ID ||
    env.SMS_PROVIDER !== "farazsms" ||
    !env.SMS_API_KEY ||
    !env.SMS_LINE_NUMBER ||
    !env.SMS_PATTERN_CODE ||
    env.PAYMENT_PROVIDER !== "manual"
  ) {
    throw new Error("Production environment is incomplete");
  }
}
