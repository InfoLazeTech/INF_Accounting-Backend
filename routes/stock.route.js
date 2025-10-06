const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock.controller");
const authToken = require("../middlewares/authToken");

// Basic stock operations
router.post("/add", authToken, stockController.addStock);
router.post("/remove", authToken, stockController.removeStock);

// Stock reporting
router.get("/low-stock", authToken, stockController.getLowStockItems);
router.get("/summary", authToken, stockController.getStockSummary);

module.exports = router;
