import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireUser } from "../../middleware/requireUser.js";
import { listCarBrandsDistinct } from "./cat-lookup.service.js";

const router = Router();

router.get(
  "/",
  requireUser,
  asyncHandler(async (_req, res) => {
    const carBrands = await listCarBrandsDistinct();

    res.status(200).json({
      success: true,
      data: carBrands,
    });
  }),
);

export default router;
