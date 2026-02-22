import { body, validationResult } from "express-validator";
import AppError from "../utils/appError-util.js";
import userModel from "../models/user-model.js";
import { tokenVerify } from "../utils/jwt-util.js";
import catchAsync from "../utils/catchAsync-util.js";

//INPUT-VALIDATOR-AUTH
export const validateAuth = [
  // 1. Check Email
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  // 2. Check Password
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long"),

  // 3. Catch Errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Map through errors and send the first one to your AppError handler
      const firstError = errors.array()[0].msg;
      return next(new AppError(firstError, 400));
    }
    next();
  },
];

//PROTECTED ROUTE
export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401),
    );
  }

  const decoded = tokenVerify(token);

  const currentUser = await userModel.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  if (!currentUser.isActive) {
    return next(new AppError("This user account is deactivated.", 401));
  }

  req.user = currentUser;
  next();
});

//ROLE-BASED-ACCESS
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};