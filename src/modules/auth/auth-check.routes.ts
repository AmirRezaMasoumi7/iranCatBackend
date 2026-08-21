import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { authCheckSchema } from "./auth.schema.js";
import { authCheck } from "./auth.service.js";

const router = Router();

router.post(
  "/",
  validate(authCheckSchema),
  asyncHandler(async (req, res) => {
    const result = await authCheck(req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

export default router;
