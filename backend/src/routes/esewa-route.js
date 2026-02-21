import express from "express";
import axios from "axios";
import { checkout, failure, success } from "../controllers/esewa-controller.js";

const router = express.Router();

//PAYMENT
router.post("/checkout", checkout);

// SUCCESS CALLBACK
router.post("/success", success);

// FAILURE CALLBACK
router.post("/failure", failure);

export default router;
