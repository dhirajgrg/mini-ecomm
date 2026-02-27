import express from "express";
import { protect, allowRoles } from "../middlewares/auth-middleware.js";
import {
  addToCart,
  getCart,
  updateCartItems,
  removeCartItems,
  deleteCart,
  getAllCarts,
  getSingleCart,
} from "../controllers/cart-controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer routes
router.get("/", allowRoles("customer"), getCart);
router.post("/", allowRoles("customer"), addToCart);
router.patch("/:productId", allowRoles("customer"), updateCartItems);
router.delete("/:productId", allowRoles("customer"), removeCartItems);
router.delete("/", allowRoles("customer"), deleteCart);

// Admin routes
router.get("/admin", allowRoles("admin"), getAllCarts);
router.get("/admin/:cartId", allowRoles("admin"), getSingleCart);

export default router;
