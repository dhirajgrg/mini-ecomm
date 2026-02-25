import express from "express";
import { protect, allowRoles } from "../middlewares/auth-middleware.js";
import { addToCart } from "../controllers/cart-controller.js";

const router = express.Router();

router.post("/", protect, allowRoles("customer"), addToCart);

export default router;
