import AppError from "../utils/appError-util.js";

// 1. Fixed handleCastError to use err properties correctly
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  let value;

  // 1. Check if keyValue exists (Modern Mongoose)
  if (err.keyValue) {
    value = Object.values(err.keyValue)[0];
  }
  // 2. Fallback to parsing errmsg string (Driver level)
  else if (err.errmsg) {
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
    value = match ? match[0] : "unknown";
  }

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};


const sendErrorProduction = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

const globalErrorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // FIX: Manually ensure 'name' and 'message' are copied
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // Handle specific Mongoose/MongoDB errors
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);

    sendErrorProduction(error, res);
  }
};

export default globalErrorController;
