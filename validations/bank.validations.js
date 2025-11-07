const Joi = require("joi");

const createBankAccountValidation = Joi.object({
  bankName: Joi.string().trim().required().messages({
    "string.empty": "Bank name is required",
  }),
  accountNumber: Joi.number().required().messages({
    "string.empty": "Account number is required",
  }),
  companyId: Joi.string().trim().required().messages({
    "string.empty": "companyId is required",
  }),
  openingBalance: Joi.number().min(0).default(0).required().messages({
    "number.min": "Opening balance cannot be negative",
  }),
});

const updateBankAccountValidation = Joi.object({
  bankName: Joi.string().optional(),
  accountNumber: Joi.number().optional(),
  openingBalance: Joi.number()
    .min(0)
    .optional()
}).or("bankName", "accountNumber", "openingBalance"); 

module.exports = {
  createBankAccountValidation,
  updateBankAccountValidation
};
