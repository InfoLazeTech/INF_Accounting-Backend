const Joi = require("joi");

const companyValidation = Joi.object({
  companyName: Joi.string().required().messages({
    "string.empty": "Company name is required",
  }),
  gstNo: Joi.string().required().messages({
    "string.empty": "GST No is required",
  }),
  panNo: Joi.string().required().messages({
    "string.empty": "PAN No is required",
  }),
  user: Joi.string().required().messages({
    "string.empty": "User ID is required",
  }),
  termsAndConditions: Joi.string().optional(),
  address: Joi.object({
    street1: Joi.string().optional(),
    street2: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pinCode: Joi.string().optional(),
    faxNumber: Joi.string().optional(),
  }).optional(),
});

module.exports = { companyValidation };
