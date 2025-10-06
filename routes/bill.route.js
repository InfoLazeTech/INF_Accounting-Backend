const express = require("express");
const router = express.Router();
const billController = require("../controllers/bill.controller");
const validate = require("../middlewares/validate");
const authToken = require("../middlewares/authToken");
const {
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
} = require("../validations/bill.validation");

// Create a new bill
router.post("/", authToken, validate(createBillValidation), billController.createBill);

// Get all bills with filters and pagination
router.get("/", authToken, validate(getBillsValidation), billController.getAllBills);

// Get bill by ID
router.get("/:id", authToken, validate(getBillValidation), billController.getBillById);

// Update bill
router.put("/:id", authToken, validate(updateBillValidation), billController.updateBill);

// Delete bill (soft delete)
router.delete("/:id", authToken, billController.deleteBill);

// Get bills by status
router.get("/status/list", authToken, validate(getBillsByStatusValidation), billController.getBillsByStatus);

// Get overdue bills
router.get("/overdue/list", authToken, billController.getOverdueBills);

// Get bills by vendor
router.get("/vendor/list", authToken, validate(getBillsByVendorValidation), billController.getBillsByVendor);

// Update bill status
router.patch("/:id/status", authToken, validate(updateBillStatusValidation), billController.updateBillStatus);

// Record payment
router.patch("/:id/payment", authToken, validate(recordPaymentValidation), billController.recordPayment);

// Get bill summary
router.get("/summary/stats", authToken, validate(getBillSummaryValidation), billController.getBillSummary);

// Get bills by date range
router.get("/date-range/list", authToken, validate(getBillsByDateRangeValidation), billController.getBillsByDateRange);

module.exports = router;
