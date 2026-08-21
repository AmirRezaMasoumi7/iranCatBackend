import type { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { authenticateUser } from "./authenticate.js";
import { AppError } from "./errorHandler.js";

export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await authenticateUser(req);

    if (user.role !== UserRole.admin) {
      throw new AppError(403, "Admin access required", "FORBIDDEN");
    }

    next();
  } catch (error) {
    next(error);
  }
}
