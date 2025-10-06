const Joi = require("joi");

// Common validation schemas
const addressValidation = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().required(),
  country: Joi.string().default("India")
});

const contactValidation = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  alternatePhone: Joi.string().allow("")
});

const itemLineValidation = Joi.object({
  itemId: Joi.string().required(),
  itemName: Joi.string().required(),
  hsnCode: Joi.string().required(),
  sku: Joi.string().required(),
  description: Joi.string().allow(""),
  quantity: Joi.number().min(0).required(),
  unitPrice: Joi.number().min(0).required(),
  discount: Joi.number().min(0).default(0),
  taxRate: Joi.number().min(0).default(0),
  lineTotal: Joi.number().min(0).required()
});

const paymentTermsValidation = Joi.object({
  dueDate: Joi.date().required(),
  paymentMethod: Joi.string().valid("cash", "bank_transfer", "cheque", "card", "upi", "other").default("cash"),
  paymentTerms: Joi.string().valid("Prepaid", "Net 15", "Net 30", "Custom"),
  notes: Joi.string().allow("")
});

const totalsValidation = Joi.object({
  subtotal: Joi.number().min(0).required(),
  totalDiscount: Joi.number().min(0).default(0),
  sgst: Joi.number().min(0).default(0),
  cgst: Joi.number().min(0).default(0),
  igst: Joi.number().min(0).default(0),
  totalTax: Joi.number().min(0).default(0),
  shippingCharges: Joi.number().min(0).default(0),
  otherCharges: Joi.number().min(0).default(0),
  grandTotal: Joi.number().min(0).required()
});

// Bill validation schemas
const createBillValidation = Joi.object({
  companyId: Joi.string().required(),
  vendorId: Joi.string().required(),
  vendorName: Joi.string().required(),
  billDate: Joi.date().default(Date.now),
  dueDate: Joi.date().required(),
  referenceNumber: Joi.string().allow(""),
  description: Joi.string().allow(""),
  items: Joi.array().items(itemLineValidation).min(1).required(),
  totals: totalsValidation.required(),
  paymentTerms: paymentTermsValidation.required(),
  status: Joi.string().valid("draft", "pending", "approved", "paid", "cancelled", "overdue").default("draft"),
  customerNotes: Joi.string().allow(""),
  termsAndConditions: Joi.string().allow(""),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string(),
    originalName: Joi.string(),
    url: Joi.string(),
    uploadedAt: Joi.date().default(Date.now)
  })).default([])
});

const updateBillValidation = Joi.object({
  vendorId: Joi.string(),
  vendorName: Joi.string(),
  billDate: Joi.date(),
  dueDate: Joi.date(),
  referenceNumber: Joi.string().allow(""),
  description: Joi.string().allow(""),
  items: Joi.array().items(itemLineValidation).min(1),
  totals: totalsValidation,
  paymentTerms: paymentTermsValidation,
  status: Joi.string().valid("draft", "pending", "approved", "paid", "cancelled", "overdue"),
  customerNotes: Joi.string().allow(""),
  termsAndConditions: Joi.string().allow(""),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string(),
    originalName: Joi.string(),
    url: Joi.string(),
    uploadedAt: Joi.date().default(Date.now)
  }))
});

const getBillsValidation = Joi.object({
  companyId: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow(""),
  status: Joi.string().valid("draft", "pending", "approved", "paid", "cancelled", "overdue"),
  vendorId: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date()
});

const getBillValidation = Joi.object({
  companyId: Joi.string().required()
});

const updateBillStatusValidation = Joi.object({
  status: Joi.string().valid("draft", "pending", "approved", "paid", "cancelled", "overdue").required()
});

const recordPaymentValidation = Joi.object({
  paymentAmount: Joi.number().min(0.01).required()
});

const getBillSummaryValidation = Joi.object({
  companyId: Joi.string().required(),
  startDate: Joi.date(),
  endDate: Joi.date()
});

const getBillsByDateRangeValidation = Joi.object({
  companyId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});

const getBillsByStatusValidation = Joi.object({
  companyId: Joi.string().required(),
  status: Joi.string().valid("draft", "pending", "approved", "paid", "cancelled", "overdue").required()
});

const getBillsByVendorValidation = Joi.object({
  companyId: Joi.string().required(),
  vendorId: Joi.string().required()
});

module.exports = {
  createBillValidation,
  updateBillValidation,
  getBillsValidation,
  getBillValidation,
  updateBillStatusValidation,
  recordPaymentValidation,
  getBillSummaryValidation,
  getBillsByDateRangeValidation,
  getBillsByStatusValidation,
  getBillsByVendorValidation
};
