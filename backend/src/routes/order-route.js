import { Router } from "express";
import { protect, allowRoles } from "../middlewares/auth-middleware.js";
import {
  createOrder,
  getOrder,
  cancellOrder,
} from "../controllers/order-controller.js";

const router = Router();

router.post("/create", protect, allowRoles("customer"), createOrder);
router.get("/", protect, allowRoles("customer"), getOrder);
router.patch("/cancell", allowRoles("customer"), cancellOrder);

export default router;
