const Joi = require("joi");

// Sales Report Validation
const salesReportValidation = Joi.object({
  companyId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Company ID must be a valid MongoDB ObjectId",
    "string.length": "Company ID must be exactly 24 characters",
    "any.required": "Company ID is required"
  }),
  startDate: Joi.date().iso().optional().messages({
    "date.format": "Start date must be in ISO format (YYYY-MM-DD)"
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    "date.format": "End date must be in ISO format (YYYY-MM-DD)",
    "date.min": "End date must be after start date"
  }),
  customerId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Customer ID must be a valid MongoDB ObjectId",
    "string.length": "Customer ID must be exactly 24 characters"
  }),
  status: Joi.string().valid("draft", "sent", "paid", "overdue", "cancelled").optional().messages({
    "any.only": "Status must be one of: draft, sent, paid, overdue, cancelled"
  })
});

// Purchase Report Validation
const purchaseReportValidation = Joi.object({
  companyId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Company ID must be a valid MongoDB ObjectId",
    "string.length": "Company ID must be exactly 24 characters",
    "any.required": "Company ID is required"
  }),
  startDate: Joi.date().iso().optional().messages({
    "date.format": "Start date must be in ISO format (YYYY-MM-DD)"
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    "date.format": "End date must be in ISO format (YYYY-MM-DD)",
    "date.min": "End date must be after start date"
  }),
  vendorId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Vendor ID must be a valid MongoDB ObjectId",
    "string.length": "Vendor ID must be exactly 24 characters"
  }),
  status: Joi.string().valid("draft", "sent", "paid", "overdue", "cancelled").optional().messages({
    "any.only": "Status must be one of: draft, sent, paid, overdue, cancelled"
  })
});

// Sales Summary Validation
const salesSummaryValidation = Joi.object({
  companyId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Company ID must be a valid MongoDB ObjectId",
    "string.length": "Company ID must be exactly 24 characters",
    "any.required": "Company ID is required"
  }),
  startDate: Joi.date().iso().optional().messages({
    "date.format": "Start date must be in ISO format (YYYY-MM-DD)"
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    "date.format": "End date must be in ISO format (YYYY-MM-DD)",
    "date.min": "End date must be after start date"
  }),
  customerId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Customer ID must be a valid MongoDB ObjectId",
    "string.length": "Customer ID must be exactly 24 characters"
  }),
  status: Joi.string().valid("draft", "sent", "paid", "overdue", "cancelled").optional().messages({
    "any.only": "Status must be one of: draft, sent, paid, overdue, cancelled"
  })
});

// Purchase Summary Validation
const purchaseSummaryValidation = Joi.object({
  companyId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Company ID must be a valid MongoDB ObjectId",
    "string.length": "Company ID must be exactly 24 characters",
    "any.required": "Company ID is required"
  }),
  startDate: Joi.date().iso().optional().messages({
    "date.format": "Start date must be in ISO format (YYYY-MM-DD)"
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    "date.format": "End date must be in ISO format (YYYY-MM-DD)",
    "date.min": "End date must be after start date"
  }),
  vendorId: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Vendor ID must be a valid MongoDB ObjectId",
    "string.length": "Vendor ID must be exactly 24 characters"
  }),
  status: Joi.string().valid("draft", "sent", "paid", "overdue", "cancelled").optional().messages({
    "any.only": "Status must be one of: draft, sent, paid, overdue, cancelled"
  })
});

module.exports = {
  salesReportValidation,
  purchaseReportValidation,
  salesSummaryValidation,
  purchaseSummaryValidation
};
