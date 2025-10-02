const express = require("express");
const router = express.Router();
const counterController = require("../controllers/counter.controller");
const authMiddleware = require("../middlewares/authToken");

// Get all counters for a company
router.get("/company", authMiddleware, counterController.getCompanyCounters);

// Get counter statistics for a company
router.get("/stats", authMiddleware, counterController.getCompanyStats);

// Get current sequence for a specific module
router.get("/current", authMiddleware, counterController.getCurrentSequence);

// Reset sequence for a specific module
router.post("/reset", authMiddleware, counterController.resetSequence);

// Bulk reset sequences for multiple modules
router.post("/bulk-reset", authMiddleware, counterController.bulkResetSequences);

module.exports = router;
