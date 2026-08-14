import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import { config } from "./config/env";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { apiLimiter } from "./middleware/rateLimiter";
import { AppError } from "./utils/AppError";
import aiRoutes from "./routes/ai.routes";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new AppError(403, "Not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;