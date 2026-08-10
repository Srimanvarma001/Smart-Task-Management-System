import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config/env";
import { UserModel, type IUser } from "../models/User";
import { AppError } from "../utils/AppError";

const BCRYPT_ROUNDS = 10;

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

function toPublicUser(user: IUser & { _id: { toString(): string } }): PublicUser {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const existing = await UserModel.findOne({ email });
    if (existing) {
      throw new AppError(409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await UserModel.create({ name, email, passwordHash });

    return { user: toPublicUser(user), token: signToken(user.id) };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await UserModel.findOne({ email }).select("+passwordHash");
    if (!user) {
      throw new AppError(401, "Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError(401, "Invalid credentials");
    }

    return { user: toPublicUser(user), token: signToken(user.id) };
  },

  async getMe(userId: string): Promise<PublicUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return toPublicUser(user);
  },
};