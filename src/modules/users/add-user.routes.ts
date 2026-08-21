import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { addUserSchema } from "./users.schema.js";
import { addUser } from "./users.service.js";

const router = Router();

router.post(
  "/",
  requireAdmin,
  validate(addUserSchema),
  asyncHandler(async (req, res) => {
    const user = await addUser(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  }),
);

export default router;
