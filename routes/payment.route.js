const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middlewares/authToken");
const validate = require("../middlewares/validate");
const { 
  paymentValidation, 
  updatePaymentValidation,
  paymentTypeValidation,
  summaryValidation,
  partyPaymentsValidation,
  referencePaymentsValidation
} = require("../validations/payment.validation");

// Create payment
router.post("/create", authMiddleware, validate(paymentValidation), paymentController.createPayment);

// Get all payments
router.get("/get", authMiddleware, paymentController.getAllPayments);

// Get payment by ID
router.get("/:id", authMiddleware, paymentController.getPaymentById);

// Update payment
router.put("/:id", authMiddleware, validate(updatePaymentValidation), paymentController.updatePayment);

// Delete payment
router.delete("/:id", authMiddleware, paymentController.deletePayment);

// Get payments by type (paymentMade or paymentReceived)
router.get("/type/list", authMiddleware, validate(paymentTypeValidation, "query"), paymentController.getPaymentsByType);

// Get payment summary
router.get("/summary/stats", authMiddleware, validate(summaryValidation, "query"), paymentController.getPaymentSummary);

// Get payments by party
router.get("/party/list", authMiddleware, validate(partyPaymentsValidation, "query"), paymentController.getPaymentsByParty);

// Get payments by reference
router.get("/reference/list", authMiddleware, validate(referencePaymentsValidation, "query"), paymentController.getPaymentsByReference);

// Get recent payments
router.get("/recent/list", authMiddleware, paymentController.getRecentPayments);

// Get payment analytics
router.get("/analytics/stats", authMiddleware, validate(summaryValidation, "query"), paymentController.getPaymentAnalytics);

module.exports = router;
