const Joi = require('joi');

// Register validation
const registerValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
  }),
});

// Login validation
const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

// OTP verification validation
const verifyOtpValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email',
  }),
  otp: Joi.string().length(6).required().messages({
    'string.empty': 'OTP is required',
    'string.length': 'OTP must be 6 digits',
  }),
});

module.exports = { registerValidation, loginValidation, verifyOtpValidation };
