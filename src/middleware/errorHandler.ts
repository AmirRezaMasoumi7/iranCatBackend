import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "../lib/logger.js";
import { env } from "../config/env.js";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { message: "Resource not found", code: "NOT_FOUND" },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = err;
    if (prismaError.code === "P2002") {
      res.status(409).json({
        success: false,
        error: { message: "Resource already exists", code: "CONFLICT" },
      });
      return;
    }
    if (prismaError.code === "P2025") {
      res.status(404).json({
        success: false,
        error: { message: "Resource not found", code: "NOT_FOUND" },
      });
      return;
    }
  }

  logger.error({ err }, "Unhandled error");

  res.status(500).json({
    success: false,
    error: {
      message: env.isProduction ? "Internal server error" : (err as Error).message,
      code: "INTERNAL_ERROR",
    },
  });
}
