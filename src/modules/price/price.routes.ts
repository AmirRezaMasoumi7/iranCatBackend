import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middleware/validate.js";
import { requireUser } from "../../middleware/requireUser.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import {
  addPriceSchema,
  bulkEditPriceSchema,
  editPriceSchema,
  nameParamSchema,
} from "./price.schema.js";
import {
  addPrice,
  editPrice,
  editPrices,
  listPrices,
} from "./price.service.js";

const router = Router();

router.get(
  "/",
  requireUser,
  asyncHandler(async (_req, res) => {
    const prices = await listPrices();

    res.status(200).json({ prices });
  }),
);

router.post(
  "/",
  requireAdmin,
  validate(addPriceSchema),
  asyncHandler(async (req, res) => {
    const price = await addPrice(req.body);

    res.status(201).json({
      success: true,
      data: price,
    });
  }),
);

router.put(
  "/",
  requireAdmin,
  validate(bulkEditPriceSchema),
  asyncHandler(async (req, res) => {
    const prices = await editPrices(req.body);

    res.status(200).json({
      success: true,
      data: prices,
    });
  }),
);

router.put(
  "/:name",
  requireAdmin,
  validate(nameParamSchema, "params"),
  validate(editPriceSchema),
  asyncHandler(async (req, res) => {
    const { name } = req.params as { name: string };
    const price = await editPrice(name, req.body);

    res.status(200).json({
      success: true,
      data: price,
    });
  }),
);

export default router;
