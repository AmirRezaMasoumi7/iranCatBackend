import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { loginSchema } from "./auth.schema.js";
import { login } from "./auth.service.js";

const router = Router();

router.post(
  "/",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await login(req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

export default router;
