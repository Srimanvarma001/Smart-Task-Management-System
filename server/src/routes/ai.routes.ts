import { Router } from "express";
import { getSuggestions, getSummary, parseTask } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";
import { aiLimiter } from "../middleware/rateLimiter";

const router = Router();

router.use(authenticate);
router.use(aiLimiter);

router.post("/parse", parseTask);
router.get("/summary", getSummary);
router.get("/suggestions", getSuggestions);

export default router;