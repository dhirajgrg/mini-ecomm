//CUSTOM MODULES
import userModel from "../models/user-model.js";
import catchAsync from "../utils/catchAsync-util.js";
import AppError from "../utils/appError-util.js";
import { tokenGenerator } from "../utils/jwt-util.js";


//REGISTER NEW-USER
export const signupUser = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password)
    next(new AppError(`Please provide email or password`, 400));

  //CHECK USER EXISTS
  const existingUser = await userModel.findOne({ email });
  if (existingUser)
    next(new AppError(`User already exists with this email `, 409));

  //CREATE NEW USER IN DB
  const newUser = await userModel.create({
    email,
    password,
    role: role || "USER",
  });

  //TOKEN GENERATE FROM JWT
  const token = tokenGenerator({ id: newUser._id, role });
  if (!token) next(new AppError(`unable to create token`, 401));

  //SEND TOKEN VIA COOKIE
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  });

  //SEND JSON AS RESPONS
  res.status(200).json({
    status: "success",
    message: "user registered successfully 😘",
    data: {
      newUser,
      token,
    },
  });
});


//LOGIN USER
export const signinUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    next(new AppError(`Please provide valid email or password`, 400));

  const user = await userModel.findOne({ email });

  if (!user)
    next(
      new AppError(`User not register with this email please register!!`, 400),
    );

    //TOKEN GENERATE FROM JWT
  const token = tokenGenerator({ id: user._id, role: user.role });
  if (!token) next(new AppError(`unable to create token`, 401));


  //SEND TOKEN VIA COOKIE
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  });

  //SEND RESPONSE AD JSON
  res.status(200).json({
    status: "success",
    message: "user login successfully😘",
    data: {
      user,
      token,
    },
  });
});


//LOGOUT USER
export const logoutUser = catchAsync(async (req, res, next) => {
  //FIND USER AS FROM PROTECT( req.user.id)
  await userModel.findByIdAndUpdate(req.user.id, { isActive: false });

  //CLEAR TOKEN  COOKIE
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });

  //SEND JSON AS REAPONSE
  res.status(200).json({
    status: "success",
    message: "Logged out successfully 👋",
  });
});
