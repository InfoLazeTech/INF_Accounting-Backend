const Joi = require("joi");

// Common validation schemas (reused from bill validation)
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

// Invoice validation schemas
const createInvoiceValidation = Joi.object({
  companyId: Joi.string().required(),
  customerId: Joi.string().required(),
  customerName: Joi.string().required(),
  // customerContact: contactValidation.required(),
  // customerAddress: addressValidation.required(),
  invoiceDate: Joi.date().default(Date.now),
  dueDate: Joi.date().required(),
  referenceNumber: Joi.string().allow(""),
  description: Joi.string().allow(""),
  items: Joi.array().items(itemLineValidation).min(1).required(),
  totals: totalsValidation.required(),
  paymentTerms: paymentTermsValidation.required(),
  status: Joi.string().valid("draft", "sent", "viewed", "paid", "overdue", "cancelled", "refunded").default("draft"),
  deliveryDate: Joi.date(),
  deliveryAddress: addressValidation,
  deliveryNotes: Joi.string().allow(""),
  notes: Joi.string().allow(""),
  termsAndConditions: Joi.string().allow(""),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string(),
    originalName: Joi.string(),
    url: Joi.string(),
    uploadedAt: Joi.date().default(Date.now)
  })).default([])
});

const updateInvoiceValidation = Joi.object({
  customerId: Joi.string(),
  customerName: Joi.string(),
  // customerContact: contactValidation,
  // customerAddress: addressValidation,
  invoiceDate: Joi.date(),
  dueDate: Joi.date(),
  referenceNumber: Joi.string().allow(""),
  description: Joi.string().allow(""),
  items: Joi.array().items(itemLineValidation).min(1),
  totals: totalsValidation,
  paymentTerms: paymentTermsValidation,
  status: Joi.string().valid("draft", "sent", "viewed", "paid", "overdue", "cancelled", "refunded"),
  deliveryDate: Joi.date(),
  deliveryAddress: addressValidation,
  deliveryNotes: Joi.string().allow(""),
  notes: Joi.string().allow(""),
  termsAndConditions: Joi.string().allow(""),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string(),
    originalName: Joi.string(),
    url: Joi.string(),
    uploadedAt: Joi.date().default(Date.now)
  }))
});

const getInvoicesValidation = Joi.object({
  companyId: Joi.string().required(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow(""),
  status: Joi.string().valid("draft", "sent", "viewed", "paid", "overdue", "cancelled", "refunded"),
  customerId: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date()
});

const getInvoiceValidation = Joi.object({
  companyId: Joi.string().required()
});

const updateInvoiceStatusValidation = Joi.object({
  status: Joi.string().valid("draft", "sent", "viewed", "paid", "overdue", "cancelled", "refunded").required()
});

const recordPaymentValidation = Joi.object({
  paymentAmount: Joi.number().min(0.01).required()
});

const getRevenueSummaryValidation = Joi.object({
  companyId: Joi.string().required(),
  startDate: Joi.date(),
  endDate: Joi.date()
});

const getInvoicesByDateRangeValidation = Joi.object({
  companyId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});

const getInvoicesByStatusValidation = Joi.object({
  companyId: Joi.string().required(),
  status: Joi.string().valid("draft", "sent", "viewed", "paid", "overdue", "cancelled", "refunded").required()
});

const getInvoicesByCustomerValidation = Joi.object({
  companyId: Joi.string().required(),
  customerId: Joi.string().required()
});

const getTopCustomersValidation = Joi.object({
  companyId: Joi.string().required(),
  limit: Joi.number().min(1).max(50).default(10)
});

const getMonthlyRevenueTrendValidation = Joi.object({
  companyId: Joi.string().required(),
  months: Joi.number().min(1).max(24).default(12)
});

module.exports = {
  createInvoiceValidation,
  updateInvoiceValidation,
  getInvoicesValidation,
  getInvoiceValidation,
  updateInvoiceStatusValidation,
  recordPaymentValidation,
  getRevenueSummaryValidation,
  getInvoicesByDateRangeValidation,
  getInvoicesByStatusValidation,
  getInvoicesByCustomerValidation,
  getTopCustomersValidation,
  getMonthlyRevenueTrendValidation
};
