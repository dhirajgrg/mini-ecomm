import express from "express";
const router = express.Router();

import { validateProduct } from "../middlewares/validate-middleware.js";
import { protect, allowRoles } from "../middlewares/auth-middleware.js";
import {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProductInactive,
} from "../controllers/product-controller.js";

// Protected routes for vendors
router.post("/", protect, validateProduct, allowRoles("vendor"), createProduct);
router.get("/my-products", protect, allowRoles("vendor"), getMyProducts);
router.put("/:id", protect, allowRoles("vendor"), updateProduct);
router.delete("/:id", protect, allowRoles("admin", "vendor"), deleteProduct);

// Public routes
router.get("/all-products", getAllProducts);
router.get("/:id", getProductById);

router.put(
  "/:id/inactive",
  protect,
  allowRoles("admin,vendor"),
  updateProductInactive,
);

export default router;
