const express = require("express");
const router = express.Router();
const productionOrderController = require("../controllers/productionOrder.controller");

router.post(
  "/createProductionOrder",
  productionOrderController.createProductionOrder
);
router.get(
  "/getProductionOrders",
  productionOrderController.getProductionOrders
);
router.get(
  "/getProductionOrder/:orderId",
  productionOrderController.getProductionOrderById
);

module.exports = router;
