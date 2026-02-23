import express from "express";
import {
  createStore,
  getMyStores,
  getAllStores,
  approveStore,
  suspendStore,
} from "../controllers/store-controller.js";
import { protect, allowRoles } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Vendor routes
router.post("/", protect, allowRoles("vendor"), createStore);
router.get("/my", protect, allowRoles("vendor"), getMyStores);

// Admin routes
router.get("/", protect, allowRoles("admin"), getAllStores);
router.patch("/:id/approve", protect, allowRoles("admin"), approveStore);
router.patch("/:id/suspend", protect, allowRoles("admin"), suspendStore);

export default router;
