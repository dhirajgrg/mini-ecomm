import express from "express";
import { protect, allowRoles } from "../middlewares/auth-middleware.js";
import { validateStore } from "../middlewares/validate-middleware.js";
import {
  createStore,
  getMyStore,
  getAllStores,
  approveStore,
  suspendStore,
  deleteStore
} from "../controllers/store-controller.js";

const router = express.Router();

// Vendor routes
router.post("/",  validateStore,protect, allowRoles("vendor"), createStore);
router.get("/", protect, allowRoles("vendor"), getMyStore);

// Admin routes
router.get("/admin", protect, allowRoles("admin"), getAllStores);
router.patch("/admin/:id/approve", protect, allowRoles("admin"), approveStore);
router.patch("/admin/:id/suspend", protect, allowRoles("admin"), suspendStore);
router.delete("/admin/:id", protect, allowRoles("admin"), deleteStore);

export default router;
