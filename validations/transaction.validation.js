const Joi = require("joi");

const addTransactionValidation = Joi.object({
  bankId: Joi.string().trim().required().messages({
    "string.empty": "Bank ID is required",
  }),
  description: Joi.string().allow("").optional(),
  amount: Joi.number().min(0).required().messages({
    "number.base": "Amount must be a number",
    "number.min": "Amount cannot be negative",
    "any.required": "Amount is required",
  }),
  type: Joi.string().valid("credit", "debit").required().messages({
    "any.only": "Type must be either 'credit' or 'debit'",
  }),
  date: Joi.date().optional().messages({
    "date.base": "Date must be a valid date",
  }),
  companyId: Joi.string().trim().required().messages({
    "string.empty": "companyId is required",
  }),
  parentId: Joi.string().trim().optional(),
  childrenId: Joi.string().optional(),
  customerVendorId: Joi.string().trim().optional(),
}).unknown(false);

const updateTransactionValidation = Joi.object({
  description: Joi.string().max(255).optional(),
  amount: Joi.number().positive().optional(),
  type: Joi.string().valid("credit", "debit").optional(),
  date: Joi.date().optional(),
  parentId: Joi.string().optional(),
  childrenId: Joi.string().optional(),
  customerVendorId: Joi.string().optional(),
}).or("description", "amount", "type", "date", "parentId", "childrenId", "customerVendorId").unknown(false);; // must include at least one field


module.exports = {
  addTransactionValidation,
  updateTransactionValidation
};
