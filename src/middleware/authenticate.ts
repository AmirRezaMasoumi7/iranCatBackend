import type { Request } from "express";
import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../lib/jwt.js";
import { AppError } from "./errorHandler.js";

export function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function authenticateUser(req: Request): Promise<User> {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw new AppError(401, "Authorization token is required", "MISSING_TOKEN");
  }

  const user = await prisma.user.findFirst({
    where: { jwtToken: token },
  });

  if (!user) {
    throw new AppError(401, "Invalid or expired token", "INVALID_TOKEN");
  }

  try {
    const payload = verifyToken(token);

    if (payload.sub !== user.id || payload.username !== user.username) {
      throw new AppError(401, "Invalid or expired token", "INVALID_TOKEN");
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, "Invalid or expired token", "INVALID_TOKEN");
  }

  return user;
}
