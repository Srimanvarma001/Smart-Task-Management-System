import { Schema, Types, model } from "mongoose";

export interface Task {
  userId: Types.ObjectId;
  title: string;
}

const taskSchema = new Schema<Task>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
  },
  { timestamps: true },
);

taskSchema.index({ userId: 1, status: 1, dueDate: 1 });

export const TaskModel = model<Task>("Task", taskSchema);