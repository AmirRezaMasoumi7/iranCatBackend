import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireUser } from "../../middleware/requireUser.js";
import { searchOemSchema } from "./cat-lookup.schema.js";
import { searchOemCodes } from "./cat-lookup.service.js";

const router = Router();

router.post(
  "/",
  requireUser,
  validate(searchOemSchema),
  asyncHandler(async (req, res) => {
    const results = await searchOemCodes(req.body.oem_code);

    res.status(200).json({
      success: true,
      data: results,
    });
  }),
);

export default router;
