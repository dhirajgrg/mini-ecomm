import express from "express";
import { protect, allowRoles } from "../middlewares/auth-middleware.js";
import {
  addToCart,
  getCart,
  updateCartItems,
  removeCartItems,
  deleteCart,
  getAllCarts,getSingleCart
} from "../controllers/cart-controller.js";

const router = express.Router();

router.post("/create", protect, allowRoles("customer"), addToCart);
router.get("/", protect, allowRoles("customer"), getCart);

router.patch("/:productId", protect, allowRoles("customer"), updateCartItems);
router.delete("/:productId", protect, allowRoles("customer"), removeCartItems);
router.delete("/", protect, allowRoles("customer"), deleteCart);

//admin
router.get("/all-carts",protect,allowRoles("admin"),getAllCarts)
router.get("/:cartId/single-cart",protect,allowRoles("admin"),getSingleCart)

export default router;
