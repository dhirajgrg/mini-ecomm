import crypto from "crypto";

//CUSTOM MODULES
import userModel from "../models/user-model.js";
import catchAsync from "../utils/catchAsync-util.js";
import AppError from "../utils/appError-util.js";
import { tokenGenerator } from "../utils/jwt-util.js";
import sendEmail from "../utils/email-util.js";

//REGISTER NEW-USER
export const signupUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!email || !password)
    next(new AppError(`Please provide email or password`, 400));

  //CHECK USER EXISTS
  const existingUser = await userModel.findOne({ email });
  if (existingUser)
    next(new AppError(`User already exists with this email `, 409));

  //CREATE NEW USER IN DB
  const newUser = await userModel.create({
    name,
    email,
    password,
    role: role || "customer",
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

  user.isActive = true;
  await user.save();

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

//GET USER CURRENTLY LOGGED IN
export const getMe = catchAsync(async (req, res, next) => {
  const currentUser = await userModel.findById(req.user.id);

  if (!currentUser) next(new AppError(`User not found with this id`, 404));

  res.status(200).json({
    status: "success",
    message: "User details fetched successfully",
    data: {
      user: currentUser,
    },
  });
});

export const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) next(new AppError(`user not found with this email`));

  //generate reset token
  const resetToken = user.generatePasswordResetToken();
  user.save({ validateBeforeSave: false });

  //reset url
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auths/reset-Password/${resetToken}`;

  //message to send client for guiding reset password
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    // call sendEmail utility
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 5 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    // If email fails, reset the fields on the user
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500,
      ),
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError(`Invalid token or token expires , try again!`, 401),
    );
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

await user.save();

const token = tokenGenerator({ id: user._id, role: user.role });


  res.status(200).json({
    status: "success",
    message: "user password reset successfully!",
    token
  });
});
