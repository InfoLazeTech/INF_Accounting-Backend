const { successResponse, errorResponse } = require("../utils/response");
const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await authService.register(email, password, name);
    return successResponse(
      res,
      null,
      "Registered. Check your email for OTP.",
      200
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Registration failed",
      500,
      error
    );
  }
});

const verifyOtp = catchAsync(async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userData = await authService.verifyOtp(email, otp);
    return successResponse(res, userData, "Email verified successfully", 200);
  } catch (error) {
    return errorResponse(
      res,
      error.message || "OTP verification failed",
      500,
      error
    );
  }
});

const login = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await authService.login(email, password);
    return successResponse(res, userData, "Logged in successfully", 200);
  } catch (error) {
    return errorResponse(res, error.message || "Login failed", 500, error);
  }
});

const forgotPassword = catchAsync(async (req, res) => {
  try {
    const { email } = req.body;
    const user = await authService.forgotPassword(email);
    return successResponse(
      res,
      null,
      "Password reset request successful. Please check your email for the OTP.",
      200
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Failed to process password reset request.",
      500,
      error
    );
  }
});

const verifyOtpforPasswordforgot = catchAsync(async (req, res) => {
  try {
    const { email, otp } = req.body;
    const token = await authService.verifyOtpforPasswordforgot(email, otp);
    return successResponse(res, token, "OTP verified successfully.", 200);
  } catch (error) {
    return errorResponse(
      res,
      error.message || "OTP verification failed.",
      500,
      error
    );
  }
});

const resetPassword = catchAsync(async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newPassword } = req.body;
    const user = await authService.resetPassword(userId, newPassword);
    return successResponse(
      res,
      null,
      "Password has been reset successfully.",
      200
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Password reset failed.",
      500,
      error
    );
  }
});

module.exports = {
  register,
  login,
  verifyOtp,
  forgotPassword,
  verifyOtpforPasswordforgot,
  resetPassword,
};
