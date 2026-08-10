import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { apiLimiter } from "./middleware/rateLimiter";
import aiRoutes from "./routes/ai.routes";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

const app = express();

app.use(helmet());
app.use(cors());
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