import type { Request, Response, NextFunction } from "express";
import { authenticateUser } from "./authenticate.js";

export async function requireUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    req.user = await authenticateUser(req);
    next();
  } catch (error) {
    next(error);
  }
}
