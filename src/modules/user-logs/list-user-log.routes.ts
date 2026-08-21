import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { listUserLogSchema } from "./user-logs.schema.js";
import { listUserLoginLogs } from "./user-logs.service.js";

const router = Router();

router.post(
  "/",
  requireAdmin,
  validate(listUserLogSchema),
  asyncHandler(async (req, res) => {
    const logs = await listUserLoginLogs(req.body);

    res.status(200).json({
      success: true,
      data: logs,
    });
  }),
);

export default router;
