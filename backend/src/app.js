import express from "express";

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitizer from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import AppError from "./utils/appError-util.js";
import globalErrorHandler from "./controllers/globalError-controller.js";
import authRoutes from "./routes/auth-route.js";
import storeRoutes from "./routes/store-route.js";
import productRoutes from "./routes/product-route.js";
import cartRoutes from "./routes/cart-routes.js";
import orderRoutes from "./routes/order-route.js";

const app = express();
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again!",
});

//MIDDLEWARES
app.use(helmet());
app.use(cors());
app.use("/api", limiter);
app.use(express.json({limit:'10kb'}));
app.use(mongoSanitizer())
app.use(xss())
app.use(hpp())

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cookieParser());

//CHECK ROUTES
app.get("/", (req, res) => {
  console.log(process.env.NODE_ENV)
});

//MAIN ROUTES
app.use("/api/v1/auths", authRoutes);
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);

//UNHANDLED ROUTES
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//GLOBAL ERROR ERRORS MIDDLEWARES
app.use(globalErrorHandler);

export default app;
