//CORE MODULE
import express from "express";
const router = express.Router();

//CUSTOM MODULE
import { validateAuth, protect } from "../middlewares/auth-middleware.js";
import {
  signupUser,
  signinUser,
  logoutUser,
  getMe,
} from "../controllers/auth-controller.js";

///api/v1/auth/
router.post("/signup", validateAuth, signupUser);
router.post("/signin", validateAuth, signinUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);

export default router;
