import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireUser } from "../../middleware/requireUser.js";
import { AppError } from "../../middleware/errorHandler.js";
import { catFaveSchema } from "./cat-fave.schema.js";
import { getTopFrequentOemCodes } from "./cat-fave.service.js";

const router = Router();

router.post(
  "/",
  requireUser,
  validate(catFaveSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError(401, "Authorization token is required", "MISSING_TOKEN");
    }

    if (req.body.username !== req.user.username) {
      throw new AppError(403, "You can only view your own favorites", "FORBIDDEN");
    }

    const oemCodes = await getTopFrequentOemCodes(req.body.username);

    res.status(200).json({
      success: true,
      data: oemCodes,
    });
  }),
);

export default router;
