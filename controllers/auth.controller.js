const {successResponse , errorResponse } = require("../utils/response");
const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    return successResponse(res, { user }, "Registered. Check your email for OTP.", 200);
  } catch (error) {
    return errorResponse(res, error.message || 'Registration failed', 500, error);
  }
});

const verifyOtp = catchAsync(async (req, res) => {
  try {
    const { email, otp } = req.body;
    const token = await authService.verifyOtp(email, otp);
    return successResponse(res, { token }, 'Email verified successfully', 200);
  } catch (error) {
    return errorResponse(res, error.message || 'OTP verification failed', 500, error);
  }
});

const login = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
     return successResponse(res, { token }, 'Logged in successfully', 200);
  } catch (error) {
   return errorResponse(res, error.message || 'Login failed', 500, error);
  }
});


module.exports = { register, login, verifyOtp };
