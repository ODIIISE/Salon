import { z } from "zod";

const envSchema = z.object({
  POSTGRES_URL: z.string().min(1).optional(),
  OWNER_SESSION_SECRET: z.string().min(32).optional(),
  CUSTOMER_SESSION_SECRET: z.string().min(32).optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse({
  POSTGRES_URL: process.env.POSTGRES_URL,
  OWNER_SESSION_SECRET: process.env.OWNER_SESSION_SECRET,
  CUSTOMER_SESSION_SECRET: process.env.CUSTOMER_SESSION_SECRET,
  APP_URL: process.env.APP_URL,
  NODE_ENV: process.env.NODE_ENV,
});

export function assertProductionEnvironment() {
  if (env.NODE_ENV !== "production") return;
  if (!env.POSTGRES_URL || !env.OWNER_SESSION_SECRET || !env.CUSTOMER_SESSION_SECRET) {
    throw new Error("Production environment is incomplete");
  }
}
