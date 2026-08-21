import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { listUsers } from "./users.service.js";

const router = Router();

router.get(
  "/",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const users = await listUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  }),
);

export default router;
