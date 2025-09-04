const { success } = require('../utils/response');
const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    res.json(success({user}, 'Registered. Check your email for OTP.'));
  } catch (e) { next(e); }
});

const verifyOtp = catchAsync(async (req, res, next) => {
    try {
    const { email, otp } = req.body;
    const token  = await authService.verifyOtp(email, otp);
    res.json(success({ token }, 'Email verified successfully'));
  } catch (e) { next(e); }
});

const login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token  = await authService.login(email, password);
    res.json(success({ token }, 'Logged in successfully'));
  } catch (e) { next(e); }
});

const logout = catchAsync(async (req, res) => {
  req.session.destroy(() => res.json(success(null, 'Logged out')));
});

module.exports = { register, login, logout, verifyOtp };
