import { Router } from "express";
import healthRoutes from "../modules/health/health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import authCheckRoutes from "../modules/auth/auth-check.routes.js";
import listUserRoutes from "../modules/users/list-user.routes.js";
import addUserRoutes from "../modules/users/add-user.routes.js";
import editUserRoutes from "../modules/users/edit-user.routes.js";
import listUserLogRoutes from "../modules/user-logs/list-user-log.routes.js";
import catsRoutes from "../modules/cats/cats.routes.js";
import addCatRoutes from "../modules/cats/add-cat.routes.js";
import searchOemRoutes from "../modules/cat-lookup/search-oem.routes.js";
import listCarBrandsRoutes from "../modules/cat-lookup/list-car-brands.routes.js";
import listOemByBrandRoutes from "../modules/cat-lookup/list-oem-by-brand.routes.js";
import readCatRoutes from "../modules/cat-read/read-cat.routes.js";
import catFaveRoutes from "../modules/cat-read/cat-fave.routes.js";
import priceRoutes from "../modules/price/price.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/login", authRoutes);
router.use("/auth-check", authCheckRoutes);
router.use("/listUser", listUserRoutes);
router.use("/addUser", addUserRoutes);
router.use("/editUser", editUserRoutes);
router.use("/listUserLog", listUserLogRoutes);
router.use("/addCat", addCatRoutes);
router.use("/cats", catsRoutes);
router.use("/searchOem", searchOemRoutes);
router.use("/listCarBrands", listCarBrandsRoutes);
router.use("/listOemByBrand", listOemByBrandRoutes);
router.use("/read", readCatRoutes);
router.use("/catFave", catFaveRoutes);
router.use("/price", priceRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
