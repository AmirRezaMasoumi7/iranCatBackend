import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { handleMulterUpload, uploadMultipleImages } from "../../middleware/upload.js";
import { addCatBodySchema } from "./cats.schema.js";
import { addCat } from "./cats.service.js";

const router = Router();

router.post(
  "/",
  requireAdmin,
  handleMulterUpload(uploadMultipleImages),
  validate(addCatBodySchema),
  asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;
    const imageBuffers = files?.map((file) => file.buffer) ?? [];
    const cat = await addCat(req.body, imageBuffers);

    res.status(201).json({
      success: true,
      data: cat,
    });
  }),
);

export default router;
