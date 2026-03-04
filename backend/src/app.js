import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";
import xss from "xss-clean";

import AppError from "./utils/appError-util.js";
import globalErrorHandler from "./controllers/globalError-controller.js";
import authRoutes from "./routes/auth-route.js";
import storeRoutes from "./routes/store-route.js";
import productRoutes from "./routes/product-route.js";
import cartRoutes from "./routes/cart-routes.js";
import orderRoutes from "./routes/order-route.js";

const app = express();

// Set up __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) GLOBAL MIDDLEWARES
app.use(cors());
app.use(helmet());
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(express.static(path.join(__dirname, "..", "public")));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "..", "views"));

// 2) ROUTES
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Hamro Mart API v1.0.0",
  });
});

app.use("/api/v1/auths", authRoutes);
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);

// Handling Unhandled Routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
