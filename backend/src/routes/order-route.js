import { Router } from "express";
const router = Router();

router.post("/create", protect, allowRoles("customer"), createOrder);
router.get("/", protect, allowRoles("customer"), getOrders);
router.patch("/:orderId", protect, allowRoles("customer"), updateOrder);
router.delete("/:orderId", protect, allowRoles("customer"), deleteOrder);

//order admin routes
router.get("/admin", protect, allowRoles("admin"), getOrders);
router.get("/admin/:id", protect, allowRoles("admin"), getOrderById);
router.patch("/admin/:id", protect, allowRoles("admin"), updateOrder);
router.delete("/admin/:id", protect, allowRoles("admin"), deleteOrder);

//set commission rate
router.patch("/commission-rate", protect, allowRoles("admin"), setCommissionRate);

export default router;
