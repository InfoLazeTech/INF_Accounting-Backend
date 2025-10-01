const Joi = require("joi");

const itemCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 2 characters",
    "string.max": "Category name cannot exceed 100 characters",
  }),
  companyId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "Company ID is required",
      "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
    }),
});

module.exports = { itemCategoryValidation };
