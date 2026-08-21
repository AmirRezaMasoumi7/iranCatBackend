import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import {
  getActivityTrend,
  getDashboardOverview,
} from "./dashboard.service.js";

const router = Router();

router.get(
  "/overview",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const overview = await getDashboardOverview();

    res.status(200).json({
      success: true,
      data: overview,
    });
  }),
);

router.get(
  "/activity-trend",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const activityTrend = await getActivityTrend();

    res.status(200).json({
      success: true,
      data: activityTrend,
    });
  }),
);

export default router;
