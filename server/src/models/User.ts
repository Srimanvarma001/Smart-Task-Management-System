import { Schema, model } from "mongoose";

export interface User {
  name: string;
  email: string;
  passwordHash: string;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const UserModel = model<User>("User", userSchema);