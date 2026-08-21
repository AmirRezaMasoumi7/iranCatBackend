import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { handleMulterUpload, uploadMultipleImages } from "../../middleware/upload.js";
import { oemCodeParamSchema, editCatBodySchema } from "./cats.schema.js";
import { editCat } from "./cats.service.js";

const router = Router({ mergeParams: true });

router.post(
  "/:oem_code/edit",
  requireAdmin,
  handleMulterUpload(uploadMultipleImages),
  validate(oemCodeParamSchema, "params"),
  validate(editCatBodySchema),
  asyncHandler(async (req, res) => {
    const { oem_code: oemCode } = req.params as { oem_code: string };
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const imageBuffers = files.map((file) => file.buffer);

    const cat = await editCat(oemCode, req.body, imageBuffers);

    res.status(200).json({
      message: "Cat updated successfully",
      cat,
    });
  }),
);

export default router;
