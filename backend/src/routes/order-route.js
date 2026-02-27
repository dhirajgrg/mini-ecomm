import { Router } from "express";
import { protect, allowRoles } from "../middlewares/auth-middleware.js";
import {
  createOrder,
  getOrders,
  cancelOrder,
} from "../controllers/order-controller.js";

const router = Router();

// Customer routes
router.post("/", protect, allowRoles("customer"), createOrder);
router.get("/", protect, allowRoles("customer"), getOrders);
router.patch("/:orderId/cancel", protect, allowRoles("customer"), cancelOrder);


export default router;
