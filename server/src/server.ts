import app from "./app";
import { connectDB } from "./config/db";
import { config } from "./config/env";
import { logger } from "./utils/logger";

const start = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
};

void start();