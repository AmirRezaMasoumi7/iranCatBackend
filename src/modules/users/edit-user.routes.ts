import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { editUserSchema } from "./users.schema.js";
import { editUser } from "./users.service.js";

const router = Router();

router.post(
  "/",
  requireAdmin,
  validate(editUserSchema),
  asyncHandler(async (req, res) => {
    const user = await editUser(req.body);

    res.status(200).json({
      success: true,
      data: user,
    });
  }),
);

export default router;
