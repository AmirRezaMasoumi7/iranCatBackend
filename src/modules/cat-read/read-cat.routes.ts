import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireUser } from "../../middleware/requireUser.js";
import { AppError } from "../../middleware/errorHandler.js";
import { readCatSchema } from "./cat-read.schema.js";
import { readCat } from "./cat-read.service.js";

const router = Router();

router.post(
  "/",
  requireUser,
  validate(readCatSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError(401, "Authorization token is required", "MISSING_TOKEN");
    }

    const cat = await readCat(req.user.username, req.body.oem_code);

    res.status(200).json({
      success: true,
      data: cat,
    });
  }),
);

export default router;
