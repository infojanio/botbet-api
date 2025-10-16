import 'dotenv/config'

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  API_KEY: process.env.API_KEY!,
  API_HOST: process.env.API_HOST!,
  PORT: Number(process.env.PORT) || 3333,
}
