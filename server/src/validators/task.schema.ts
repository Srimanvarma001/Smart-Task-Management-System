import { z } from "zod";

const isoDateString = z.string().refine(
  (value) =>
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(value) &&
    !Number.isNaN(new Date(value).getTime()),
  { message: "Must be a valid ISO 8601 date string" },
);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: isoDateString.optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  dueDate: isoDateString.optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const querySchema = z.object({
  status: z.enum(["pending", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["createdAt", "dueDate", "priority"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof querySchema>;