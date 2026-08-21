import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { signToken, verifyToken } from "../../lib/jwt.js";
import { AppError } from "../../middleware/errorHandler.js";
import { getRemainingSubscriptionDays } from "../users/subscription.utils.js";
import type { AuthCheckInput, LoginInput } from "./auth.schema.js";

export type AuthSessionResult = {
  username: string;
  remainingSubscriptionDays: number;
  role: string;
  jwtToken: string;
};

export type LoginResult = AuthSessionResult;

export async function login(input: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { username: input.username },
  });

  if (!user) {
    throw new AppError(401, "Invalid username or password", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid username or password", "INVALID_CREDENTIALS");
  }

  const jwtToken = signToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        jwtToken,
        device: input.device,
      },
    }),
    prisma.userLoginLog.create({
      data: {
        username: user.username,
        device: input.device,
      },
    }),
  ]);

  return {
    username: user.username,
    remainingSubscriptionDays: getRemainingSubscriptionDays(user.subscriptionExpiryDate),
    role: user.role,
    jwtToken,
  };
}

export async function authCheck(input: AuthCheckInput): Promise<AuthSessionResult> {
  const user = await prisma.user.findUnique({
    where: { username: input.username },
  });

  if (!user?.jwtToken) {
    throw new AppError(401, "Invalid auth credentials", "INVALID_AUTH");
  }

  if (user.jwtToken !== input.jwt || user.device !== input.device) {
    throw new AppError(401, "Invalid auth credentials", "INVALID_AUTH");
  }

  try {
    const payload = verifyToken(input.jwt);

    if (payload.sub !== user.id || payload.username !== user.username) {
      throw new AppError(401, "Invalid auth credentials", "INVALID_AUTH");
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, "Invalid auth credentials", "INVALID_AUTH");
  }

  return {
    username: user.username,
    remainingSubscriptionDays: getRemainingSubscriptionDays(user.subscriptionExpiryDate),
    role: user.role,
    jwtToken: user.jwtToken,
  };
}
