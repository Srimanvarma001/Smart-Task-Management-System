import { Schema, Types, model } from "mongoose";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed";

export interface ITask {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  tags: string[];
  aiGenerated: boolean;
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "completed"], default: "pending", index: true },
    category: { type: String },
    tags: { type: [String], default: [] },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true },
);

taskSchema.index({ userId: 1, status: 1, dueDate: 1 });

export const TaskModel = model<ITask>("Task", taskSchema);