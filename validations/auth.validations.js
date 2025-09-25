const Joi = require("joi");

// Register validation
const registerValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
  name: Joi.string().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/) // adjust pattern as needed
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone must be a valid 10-digit number",
    }),
});

// Login validation
const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

module.exports = {
  registerValidation,
  loginValidation,
};
