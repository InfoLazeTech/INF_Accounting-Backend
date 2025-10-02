const Joi = require("joi");

const itemValidation = Joi.object({
  companyId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Company ID is required",
      "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    }),
  sku: Joi.string().required().messages({
    "string.empty": "SKU is required",
  }),
  name: Joi.string().required().messages({
    "string.empty": "Item name is required",
  }),
  description: Joi.string().optional().allow("").messages({
    "string.base": "Description must be a string",
  }),
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Category ID is required",
      "string.pattern.base": "Category ID must be a valid MongoDB ObjectId",
    }),
  unitOfMeasure: Joi.string()
    .valid("pcs", "kg", "liter", "box", "meter", "pack")
    .required()
    .messages({
      "any.only": "Unit of measure must be one of pcs, kg, liter, box, meter, pack",
      "string.empty": "Unit of measure is required",
    }),
  purchasePrice: Joi.number().min(0).required().messages({
    "number.base": "Purchase price must be a number",
    "number.min": "Purchase price cannot be negative",
    "any.required": "Purchase price is required",
  }),
  salePrice: Joi.number().min(0).required().messages({
    "number.base": "Sale price must be a number",
    "number.min": "Sale price cannot be negative",
    "any.required": "Sale price is required",
  }),
  taxRate: Joi.number().min(0).default(0).messages({
    "number.base": "Tax rate must be a number",
    "number.min": "Tax rate cannot be negative",
  }),
  openingStock: Joi.number().min(0).default(0).messages({
    "number.base": "Opening stock must be a number",
    "number.min": "Opening stock cannot be negative",
  }),
  availableStock: Joi.number().min(0).default(0).messages({
    "number.base": "Available stock must be a number",
    "number.min": "Available stock cannot be negative",
  }),
  reorderLevel: Joi.number().min(0).default(0).messages({
    "number.base": "Reorder level must be a number",
    "number.min": "Reorder level cannot be negative",
  }),
  isActive: Joi.boolean().default(true).messages({
    "boolean.base": "isActive must be a boolean",
  }),
});

const updateItemValidation = Joi.object({
  sku: Joi.string().optional().messages({
    "string.base": "SKU must be a string",
  }),
  name: Joi.string().optional().messages({
    "string.base": "Item name must be a string",
  }),
  description: Joi.string().optional().allow("").messages({
    "string.base": "Description must be a string",
  }),
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Category ID must be a valid MongoDB ObjectId",
    }),
  unitOfMeasure: Joi.string()
    .valid("pcs", "kg", "liter", "box", "meter", "pack")
    .optional()
    .messages({
      "any.only": "Unit of measure must be one of pcs, kg, liter, box, meter, pack",
    }),
  purchasePrice: Joi.number().min(0).optional().messages({
    "number.base": "Purchase price must be a number",
    "number.min": "Purchase price cannot be negative",
  }),
  salePrice: Joi.number().min(0).optional().messages({
    "number.base": "Sale price must be a number",
    "number.min": "Sale price cannot be negative",
  }),
  taxRate: Joi.number().min(0).optional().messages({
    "number.base": "Tax rate must be a number",
    "number.min": "Tax rate cannot be negative",
  }),
  openingStock: Joi.number().min(0).optional().messages({
    "number.base": "Opening stock must be a number",
    "number.min": "Opening stock cannot be negative",
  }),
  availableStock: Joi.number().min(0).optional().messages({
    "number.base": "Available stock must be a number",
    "number.min": "Available stock cannot be negative",
  }),
  reorderLevel: Joi.number().min(0).optional().messages({
    "number.base": "Reorder level must be a number",
    "number.min": "Reorder level cannot be negative",
  }),
  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean",
  }),
});

const getItemsValidation = Joi.object({
  companyId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Company ID is required",
      "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    }),
  page: Joi.number().integer().min(1).optional().messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
  search: Joi.string().optional().allow("").messages({
    "string.base": "Search must be a string",
  }),
});

const getItemValidation = Joi.object({
  companyId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Company ID is required",
      "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    }),
});

module.exports = { 
  itemValidation, 
  updateItemValidation, 
  getItemsValidation, 
  getItemValidation 
};
