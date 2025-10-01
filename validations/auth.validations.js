const Joi = require("joi");

const registerValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email",
  }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters long",
    }),

  name: Joi.string().min(2).max(50).optional().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone must be a valid 10-digit number",
    }),

  companyName: Joi.string().required().messages({
    "string.empty": "Company name is required",
  }),

  gstNo: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .required()
    .messages({
      "string.empty": "GST number is required",
      "string.pattern.base": "GST number format is invalid",
    }),

  panNo: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.empty": "PAN number is required",
      "string.pattern.base": "PAN number format is invalid",
    }),
});

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
