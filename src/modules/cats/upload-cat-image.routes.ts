import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { handleMulterUpload, uploadSingleImage } from "../../middleware/upload.js";
import { AppError } from "../../middleware/errorHandler.js";
import { oemCodeParamSchema } from "./cats.schema.js";
import { uploadCatImage } from "./cats.service.js";

const router = Router({ mergeParams: true });

router.post(
  "/:oem_code/images",
  requireAdmin,
  handleMulterUpload(uploadSingleImage),
  validate(oemCodeParamSchema, "params"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError(400, "Image file is required", "MISSING_FILE");
    }

    const { oem_code: oemCode } = req.params as { oem_code: string };
    const image = await uploadCatImage(oemCode, req.file.buffer);

    res.status(201).json({
      success: true,
      data: image,
    });
  }),
);

export default router;
