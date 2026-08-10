import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from "../validators/task.schema";

const router = Router();

router.use(authenticate);

router.get("/", listTasks);
router.post("/", validate(createTaskSchema), createTask);
router.get("/:id", getTask);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.patch("/:id/status", validate(updateTaskStatusSchema), updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;