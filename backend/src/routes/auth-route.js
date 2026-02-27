//CORE MODULE
import express from "express";
const router = express.Router();

//CUSTOM MODULE
import {
  validateSignup,
  validateSignin,
} from "../middlewares/validate-middleware.js";
import { protect } from "../middlewares/auth-middleware.js";
import {
  signupUser,
  signinUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  getMe,
} from "../controllers/auth-controller.js";

///api/v1/auth/
router.post("/signup", validateSignup, signupUser);
router.post("/signin", validateSignin, signinUser);
router.post("/logout", protect, logoutUser);
router.post("/forget-password",  forgetPassword);
router.patch("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);

export default router;
