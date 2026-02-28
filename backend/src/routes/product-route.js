import express from "express";
import { validateProduct } from "../middlewares/validate-middleware.js";
import { protect, allowRoles } from "../middlewares/auth-middleware.js";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProductInactive,
} from "../controllers/product-controller.js";

const router = express.Router();

/* ---------- Public Routes ---------- */

router.get("/", getAllProducts);
router.get("/:id", getProductById);

/* ---------- Protected Routes ---------- */

router.use(protect);

// Vendor routes
router.post("/", allowRoles("vendor"), validateProduct, createProduct);
router.get("/", allowRoles("vendor"), getProducts);
router.patch("/:id", allowRoles("vendor"), updateProduct);
router.delete("/:id", allowRoles("vendor"), deleteProduct);

// Admin + Vendor
router.patch(
  "/:id/inactive",
  allowRoles("admin", "vendor"),
  updateProductInactive,
);

export default router;
