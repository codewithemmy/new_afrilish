import * as dotenv from "dotenv"
dotenv.config()

export interface IConfig {
  TERMII_BASE_URL: string
  TERMII_KEY: string
  SECRET_KEY: string
  REDIS_URL: string
  REDIS_TLS_URL: string
  PAYSTACK_URL: string
  PAYSTACK_KEY: string
  ENV: string
  STRIPE: string
  WEBHOOK_SECRET: string
}

const config = {
  TERMII_BASE_URL: process.env.TERMII_BASE_URL,
  TERMII_KEY: process.env.TERMII_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_TLS_URL: process.env.REDIS_TLS_URL,
  PAYSTACK_URL: process.env.PAYSTACK_BASE_URL,
  PAYSTACK_KEY: process.env.PAYSTACK_SK_KEY,
  ENV: process.env.ENVIRONMENT,
  STRIPE: process.env.STRIPE_KEY,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
}

export default config
