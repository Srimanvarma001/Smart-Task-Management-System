import mongoose from "mongoose";
import { config } from "./env";
import { logger } from "../utils/logger";

export async function connectDB(): Promise<void> {
  if (!config.mongoUri) {
    logger.warn("MONGO_URI is not set; skipping database connection");
    return;
  }
  await mongoose.connect(config.mongoUri);
  logger.info("Connected to MongoDB");
}