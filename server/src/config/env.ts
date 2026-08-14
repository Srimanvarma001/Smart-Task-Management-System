import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: isProduction ? required("MONGO_URI") : (process.env.MONGO_URI || ""),
  jwtSecret: isProduction ? required("JWT_SECRET") : (process.env.JWT_SECRET || "dev-secret"),
  jwtExpiresIn: "1h",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
