import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: "1h",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
};