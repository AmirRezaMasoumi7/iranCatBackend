import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireUser } from "../../middleware/requireUser.js";
import { listOemByBrandSchema } from "./cat-lookup.schema.js";
import { listOemCodesByBrand } from "./cat-lookup.service.js";

const router = Router();

router.post(
  "/",
  requireUser,
  validate(listOemByBrandSchema),
  asyncHandler(async (req, res) => {
    const oemCodes = await listOemCodesByBrand(req.body.car_brand);

    res.status(200).json({
      success: true,
      data: oemCodes,
    });
  }),
);

export default router;
