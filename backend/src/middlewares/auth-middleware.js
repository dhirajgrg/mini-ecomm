import AppError from "../utils/appError-util.js";
import userModel from "../models/user-model.js";
import { tokenVerify } from "../utils/jwt-util.js";
import catchAsync from "../utils/catchAsync-util.js";

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
      next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
