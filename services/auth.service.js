const User = require("../models/user.model");
const { generateToken } = require("../config/jwt");
const crypto = require("crypto");
const { accountVerifyOtp, forgotPasswordOtp } = require("../utils/email");
const { mongoose } = require("../config/db");

const register = async (email, password) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existing = await User.findOne({ email }).session(session);
    if (existing) throw new Error("Email already registered");
    const hash = await User.hashPassword(password);

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    const user = new User({
      email,
      password: hash,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000, //5 Minutes
    });

    await user.save({ session });

    // Send email
    await accountVerifyOtp(email, otp);

    await session.commitTransaction();
    session.endSession();

    return user;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const verifyOtp = async (email, otp) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("Already verified");
    if (user.otp !== otp || user.otpExpires < Date.now())
      throw new Error("Invalid or expired OTP");

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return generateToken({ userId: user._id, email: user.email });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const login = async (email, password) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) throw new Error("User not found");
    if (!user.isVerified) throw new Error("Please verify email first");

    const ok = await user.verifyPassword(password);
    if (!ok) throw new Error("Invalid credentials");

    await session.commitTransaction();
    session.endSession();

    return generateToken({ userId: user._id, email: user.email });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const forgotPassword = async (email) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) throw new Error("User not found");

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; //5 Minutes

    await user.save({ session });

    // Send email
    await forgotPasswordOtp(email, otp);

    await session.commitTransaction();
    session.endSession();

    return user;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const verifyOtpforPasswordforgot = async (email, otp) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) throw new Error("User not found");
    if (user.otp !== otp || user.otpExpires < Date.now())
      throw new Error("Invalid or expired OTP");
    user.otp = null;
    user.otpExpires = null;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return generateToken({ userId: user._id, email: user.email });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const resetPassword = async (userId, newPassword) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ _id: userId }).session(session);
    if (!user) throw new Error("User not found");
    const hash = await User.hashPassword(newPassword);

    user.password = hash;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    return user;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

module.exports = {
  register,
  login,
  verifyOtp,
  forgotPassword,
  verifyOtpforPasswordforgot,
  resetPassword,
};
