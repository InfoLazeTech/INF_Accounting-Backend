const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");
const validate = require("../middlewares/validate");
const authToken = require("../middlewares/authToken");
const {
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
} = require("../validations/invoice.validation");

// Create a new invoice
router.post("/", authToken, validate(createInvoiceValidation), invoiceController.createInvoice);

// Get all invoices with filters and pagination
router.get("/", authToken, validate(getInvoicesValidation), invoiceController.getAllInvoices);

// Get invoice by ID
router.get("/:id", authToken, validate(getInvoiceValidation), invoiceController.getInvoiceById);

// Update invoice
router.put("/:id", authToken, validate(updateInvoiceValidation), invoiceController.updateInvoice);

// Delete invoice (soft delete)
router.delete("/:id", authToken, invoiceController.deleteInvoice);

// Get invoices by status
router.get("/status/list", authToken, validate(getInvoicesByStatusValidation), invoiceController.getInvoicesByStatus);

// Get overdue invoices
router.get("/overdue/list", authToken, invoiceController.getOverdueInvoices);

// Get invoices by customer
router.get("/customer/list", authToken, validate(getInvoicesByCustomerValidation), invoiceController.getInvoicesByCustomer);

// Update invoice status
router.patch("/:id/status", authToken, validate(updateInvoiceStatusValidation), invoiceController.updateInvoiceStatus);

// Record payment
router.patch("/:id/payment", authToken, validate(recordPaymentValidation), invoiceController.recordPayment);

// Get revenue summary
router.get("/summary/revenue", authToken, validate(getRevenueSummaryValidation), invoiceController.getRevenueSummary);

// Get invoices by date range
router.get("/date-range/list", authToken, validate(getInvoicesByDateRangeValidation), invoiceController.getInvoicesByDateRange);

// Get top customers by revenue
router.get("/analytics/top-customers", authToken, validate(getTopCustomersValidation), invoiceController.getTopCustomersByRevenue);

// Get monthly revenue trend
router.get("/analytics/revenue-trend", authToken, validate(getMonthlyRevenueTrendValidation), invoiceController.getMonthlyRevenueTrend);

module.exports = router;
