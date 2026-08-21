import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { oemCodeParamSchema } from "./cats.schema.js";
import { deleteCat } from "./cats.service.js";

const router = Router({ mergeParams: true });

router.delete(
  "/:oem_code",
  requireAdmin,
  validate(oemCodeParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const { oem_code: oemCode } = req.params as { oem_code: string };
    await deleteCat(oemCode);

    res.status(200).json({
      message: "Cat deleted successfully",
      deleted_oem: oemCode,
    });
  }),
);

export default router;
