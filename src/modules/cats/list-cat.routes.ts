import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { listCats } from "./cats.service.js";

const router = Router();

router.get(
  "/",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const result = await listCats();

    res.status(200).json(result);
  }),
);

export default router;
