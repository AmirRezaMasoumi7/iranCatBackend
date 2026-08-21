import { Router } from "express";
import listCatRoutes from "./list-cat.routes.js";
import deleteCatRoutes from "./delete-cat.routes.js";
import editCatRoutes from "./edit-cat.routes.js";
import uploadCatImageRoutes from "./upload-cat-image.routes.js";

const router = Router();

router.use("/", listCatRoutes);
router.use("/", deleteCatRoutes);
router.use("/", editCatRoutes);
router.use("/", uploadCatImageRoutes);

export default router;