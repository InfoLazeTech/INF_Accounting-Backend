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
  description: Joi.string().required().messages({
    "string.empty": "Description is required",
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
  taxRate: Joi.number().min(0).required().messages({
    "number.base": "Tax rate must be a number",
    "number.min": "Tax rate cannot be negative",
    "any.required": "Tax rate is required",
  }),
  openingStock: Joi.number().min(0).required().messages({
    "number.base": "Opening stock must be a number",
    "number.min": "Opening stock cannot be negative",
    "any.required": "Opening stock is required",
  }),
  availableStock: Joi.number().min(0).required().messages({
    "number.base": "Available stock must be a number",
    "number.min": "Available stock cannot be negative",
    "any.required": "Available stock is required",
  }),
  reorderLevel: Joi.number().min(0).required().messages({
    "number.base": "Reorder level must be a number",
    "number.min": "Reorder level cannot be negative",
    "any.required": "Reorder level is required",
  }),
  isActive: Joi.boolean().required().messages({
    "any.required": "isActive status is required",
  }),
});

module.exports = { itemValidation };
