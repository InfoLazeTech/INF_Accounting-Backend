const express = require("express");
const router = express.Router();
const productionOrderController = require("../controllers/productionOrder.controller");
const validate = require("../middlewares/validate");
const {createProductionOrderValidation} = require("../validations/productionOrder.validations");

router.post(
  "/createProductionOrder",
  validate(createProductionOrderValidation),
  productionOrderController.createProductionOrder
);
router.get(
  "/getProductionOrders",
  productionOrderController.getProductionOrders
);
router.delete(
  "/deleteProductionOrder/:orderId",
  productionOrderController.deleteProductionOrder
)
router.get(
  "/getProductionOrder/:orderId",
  productionOrderController.getProductionOrder
)

module.exports = router;
