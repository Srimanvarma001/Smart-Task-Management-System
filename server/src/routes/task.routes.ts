import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  getTaskStats,
  listTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { createTaskSchema, querySchema, updateTaskSchema } from "../validators/task.schema";

const router = Router();

router.use(authenticate);

router.get("/", validate(querySchema, "query"), listTasks);
router.post("/", validate(createTaskSchema), createTask);
router.get("/stats", getTaskStats);
router.get("/:id", getTask);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;