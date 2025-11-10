const express = require("express");
const router = express.Router();
const itemConfigurationController = require("../controllers/itemConfiguration.controller");
const authToken = require("../middlewares/authToken");
const {
  addStockValidation,
  removeStockValidation,
  getAvailableStockValidation,
  getItemSalesDetailsValidation,
} = require("../validations/itemConfiguration.validation");
const validate = require("../middlewares/validate");

// Manual stock adjustment routes
router.post(
  "/add-stock",
  authToken,
  validate(addStockValidation),
  itemConfigurationController.addStock
);

router.post(
  "/remove-stock",
  authToken,
  validate(removeStockValidation),
  itemConfigurationController.removeStock
);

router.get(
  "/available-stock",
  authToken,
  validate(getAvailableStockValidation),
  itemConfigurationController.getAvailableStock
);

router.get(
  "/item-sales-details",
  authToken,
  validate(getItemSalesDetailsValidation),
  itemConfigurationController.getItemSalesDetails
);

module.exports = router;

