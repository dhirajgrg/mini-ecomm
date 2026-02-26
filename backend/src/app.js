//CORE MODULES
import express from "express";
const app = express();

//THIR-PARTY-MODULES
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

//CUSTOM MODULES
import AppError from "./utils/appError-util.js";
import globalErrorHandler from "./controllers/globalError-controller.js";
// import esewaRoutes from "./routes/esewa-route.js";
import authRoutes from "./routes/auth-route.js";
import storeRoutes from "./routes/store-route.js";
import productRoutes from "./routes/product-route.js"
import cartRoutes from './routes/cart-routes.js'

//MIDDLEWARES
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//CHECK ROUTES
app.get("/", (req, res) => {
  console.log(`Route is healthy`);
});

//MAIN ROUTES
app.use("/api/v1/auths", authRoutes);
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart",cartRoutes)

// app.use("/api/v1/esewa", esewaRoutes);


//UNHANDLED ROUTES
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


//GLOBAL ERROR ERRORS MIDDLEWARES
app.use(globalErrorHandler);

export default app;
