import { body, validationResult } from "express-validator";
import AppError from "../utils/appError-util.js";

// VALIDATION MIDDLEWARES FOR REGISTER
export const validateSignup = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),
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
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        // If they don't match, throw an error
        throw new Error("Passwords do not match");
      }
      // If they match, return true
      return true;
    }),
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

//VALIDATION MIDDLEWARES FOR SIGNIN
    export const validateSignin = [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 4 })
      .withMessage("Password must be at least 4 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return next(new AppError(firstError, 400));
    }
    next();
  },
];

// VALIDATION MIDDLEWARES FOR PRODUCT
export const validateProduct = [
  body("title").trim().notEmpty().withMessage("Product title is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required"),
  body("price").isNumeric().withMessage("Product price must be a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return next(new AppError(firstError, 400));
    }
    next();
  },
];

// VALIDATION MIDDLEWARES FOR STORE
export const validateStore = [
  body("storeName").trim().notEmpty().withMessage("Store name is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Store description is required"),
  body("address").trim().notEmpty().withMessage("Store address is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return next(new AppError(firstError, 400));
    }
    next();
  },
];
