const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middlewares/authToken");
const validate = require("../middlewares/validate");
const {
  salesReportValidation,
  purchaseReportValidation,
  salesSummaryValidation,
  purchaseSummaryValidation
} = require("../validations/report.validation");

// Sales Report Routes
router.get(
  "/sales",
  authMiddleware,
  validate(salesReportValidation, "query"),
  reportController.generateSalesReport
);

router.get(
  "/sales/summary",
  authMiddleware,
  validate(salesSummaryValidation, "query"),
  reportController.getSalesSummary
);

// Purchase Report Routes
router.get(
  "/purchase",
  authMiddleware,
  validate(purchaseReportValidation, "query"),
  reportController.generatePurchaseReport
);

router.get(
  "/purchase/summary",
  authMiddleware,
  validate(purchaseSummaryValidation, "query"),
  reportController.getPurchaseSummary
);

module.exports = router;
