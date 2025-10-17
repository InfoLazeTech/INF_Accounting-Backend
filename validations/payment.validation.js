const Joi = require("joi");

const paymentValidation = Joi.object({
  // Basic Information
  companyId: Joi.string().required().messages({
    "any.required": "Company ID is required",
    "string.empty": "Company ID cannot be empty"
  }),
  
  // Payment Type
  paymentType: Joi.string()
    .valid("paymentMade", "paymentReceived")
    .required()
    .messages({
      "any.required": "Payment type is required",
      "any.only": "Payment type must be either 'paymentMade' or 'paymentReceived'"
    }),
  
  // Reference Information
  referenceNumber: Joi.string().allow("").optional(),
  
  // Party Information
  partyId: Joi.string().required().messages({
    "any.required": "Party ID is required",
    "string.empty": "Party ID cannot be empty"
  }),
  
  // Payment Details
  paymentDate: Joi.date().default(Date.now).messages({
    "date.base": "Payment date must be a valid date"
  }),
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      "any.required": "Amount is required",
      "number.positive": "Amount must be positive"
    }),
  charges: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.min": "Charges cannot be negative"
    }),
  
  // Payment Mode
  paymentMode: Joi.string()
    .valid("cash", "bank", "other")
    .required()
    .messages({
      "any.required": "Payment mode is required",
      "any.only": "Payment mode must be one of: cash, bank, other"
    }),
  
  // Additional Information
  notes: Joi.string().allow("").optional(),
  
  // Status
  status: Joi.string()
    .valid("pending", "completed", "failed", "cancelled")
    .default("completed")
    .messages({
      "any.only": "Status must be one of: pending, completed, failed, cancelled"
    }),
  
  // Audit Fields
  createdBy: Joi.string().optional(),
  updatedBy: Joi.string().optional()
});

// Validation for update (all fields optional except ID)
const updatePaymentValidation = Joi.object({
  // Payment Type
  paymentType: Joi.string()
    .valid("paymentMade", "paymentReceived")
    .optional()
    .messages({
      "any.only": "Payment type must be either 'paymentMade' or 'paymentReceived'"
    }),
  
  // Reference Information
  referenceNumber: Joi.string().allow("").optional(),
  
  // Party Information
  partyId: Joi.string().optional(),
  partyType: Joi.string()
    .valid("customer", "vendor")
    .optional()
    .messages({
      "any.only": "Party type must be either 'customer' or 'vendor'"
    }),
  
  // Payment Details
  paymentDate: Joi.date().optional().messages({
    "date.base": "Payment date must be a valid date"
  }),
  amount: Joi.number()
    .positive()
    .optional()
    .messages({
      "number.positive": "Amount must be positive"
    }),
  charges: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.min": "Charges cannot be negative"
    }),
  
  // Payment Mode
  paymentMode: Joi.string()
    .valid("cash", "bank", "other")
    .optional()
    .messages({
      "any.only": "Payment mode must be one of: cash, bank, other"
    }),
  
  // Additional Information
  notes: Joi.string().allow("").optional(),
  
  // Status
  status: Joi.string()
    .valid("pending", "completed", "failed", "cancelled")
    .optional()
    .messages({
      "any.only": "Status must be one of: pending, completed, failed, cancelled"
    }),
  
  // Audit Fields
  updatedBy: Joi.string().optional()
});

// Validation for payment type query
const paymentTypeValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "any.required": "Company ID is required"
  }),
  paymentType: Joi.string()
    .valid("paymentMade", "paymentReceived")
    .required()
    .messages({
      "any.required": "Payment type is required",
      "any.only": "Payment type must be either 'paymentMade' or 'paymentReceived'"
    }),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  partyId: Joi.string().optional(),
  status: Joi.string()
    .valid("pending", "completed", "failed", "cancelled")
    .optional()
});

// Validation for summary query
const summaryValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "any.required": "Company ID is required"
  }),
  startDate: Joi.date().required().messages({
    "any.required": "Start date is required"
  }),
  endDate: Joi.date().required().messages({
    "any.required": "End date is required"
  })
});

// Validation for party payments query
const partyPaymentsValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "any.required": "Company ID is required"
  }),
  partyId: Joi.string().required().messages({
    "any.required": "Party ID is required"
  }),
  paymentType: Joi.string()
    .valid("paymentMade", "paymentReceived")
    .optional()
});

// Validation for reference payments query
const referencePaymentsValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "any.required": "Company ID is required"
  }),
  referenceId: Joi.string().required().messages({
    "any.required": "Reference ID is required"
  }),
  referenceType: Joi.string()
    .valid("Bill", "Invoice")
    .required()
    .messages({
      "any.required": "Reference type is required"
    })
});

module.exports = {
  paymentValidation,
  updatePaymentValidation,
  paymentTypeValidation,
  summaryValidation,
  partyPaymentsValidation,
  referencePaymentsValidation,
};
