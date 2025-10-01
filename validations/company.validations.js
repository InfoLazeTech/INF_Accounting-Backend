const Joi = require("joi");

const companyUpdateValidation = Joi.object({
  companyName: Joi.string().required().messages({
    "string.empty": "Company name is required and cannot be removed",
  }),
  gstNo: Joi.string().required().messages({
    "string.empty": "GST No is required and cannot be removed",
  }),
  panNo: Joi.string().required().messages({
    "string.empty": "PAN No is required and cannot be removed",
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
  logo: Joi.string().optional(),
  signature: Joi.string().optional(),
});

module.exports = { companyUpdateValidation };
