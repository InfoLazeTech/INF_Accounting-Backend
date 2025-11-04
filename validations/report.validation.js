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
  customerId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Customer ID must be a valid MongoDB ObjectId",
    "string.length": "Customer ID must be exactly 24 characters",
    "any.required": "Customer ID is required for detailed report"
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
  vendorId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Vendor ID must be a valid MongoDB ObjectId",
    "string.length": "Vendor ID must be exactly 24 characters",
    "any.required": "Vendor ID is required for detailed report"
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
  }),
  page: Joi.number().integer().min(1).optional().default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1"
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit must not exceed 100"
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
  }),
  page: Joi.number().integer().min(1).optional().default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1"
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit must not exceed 100"
  })
});

// Dashboard Reporting Validation
const dashboardReportingValidation = Joi.object({
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
  })
});

module.exports = {
  salesReportValidation,
  purchaseReportValidation,
  salesSummaryValidation,
  purchaseSummaryValidation,
  dashboardReportingValidation
};
