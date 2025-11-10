const Joi = require("joi");

const addStockValidation = Joi.object({
  companyId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Company ID is required",
      "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    }),
  itemId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Item ID is required",
      "string.pattern.base": "Item ID must be a valid MongoDB ObjectId",
    }),
  quantity: Joi.number()
    .required()
    .min(0.01)
    .messages({
      "number.base": "Quantity must be a number",
      "number.min": "Quantity must be greater than 0",
      "any.required": "Quantity is required",
    }),
  reason: Joi.string().optional().allow(null, "").messages({
    "string.base": "Reason must be a string",
  }),
});

const removeStockValidation = Joi.object({
  companyId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Company ID is required",
      "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    }),
  itemId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Item ID is required",
      "string.pattern.base": "Item ID must be a valid MongoDB ObjectId",
    }),
  quantity: Joi.number()
    .required()
    .min(0.01)
    .messages({
      "number.base": "Quantity must be a number",
      "number.min": "Quantity must be greater than 0",
      "any.required": "Quantity is required",
    }),
  reason: Joi.string().optional().allow(null, "").messages({
    "string.base": "Reason must be a string",
  }),
});

const getAvailableStockValidation = Joi.object({
  companyId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Company ID is required",
      "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    }),
  itemId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Item ID is required",
      "string.pattern.base": "Item ID must be a valid MongoDB ObjectId",
    }),
});

const getItemSalesDetailsValidation = Joi.object({
  companyId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Company ID is required",
      "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    }),
  itemId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Item ID is required",
      "string.pattern.base": "Item ID must be a valid MongoDB ObjectId",
    }),
  customerId: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Customer ID must be a valid MongoDB ObjectId",
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
});

module.exports = {
  addStockValidation,
  removeStockValidation,
  getAvailableStockValidation,
  getItemSalesDetailsValidation,
};

