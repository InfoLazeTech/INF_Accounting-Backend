const ProductionOrderService = require("../services/productionOrder.service");
const { successResponse, errorResponse } = require("../utils/response");

const createProductionOrder = async (req, res) => {
  try {
    const { companyId, date, rawMaterials, finishedGoods } = req.body;
    const order = await ProductionOrderService.createProductionOrder(
      companyId,
      date,
      rawMaterials,
      finishedGoods
    );
    return successResponse(
      res,
      order,
      "production order created successFully",
      200
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "error while creating production order",
      400
    );
  }
};

const getProductionOrders = async (req, res) => {
  try {
    const { companyId } = req.query;
    const orders = await ProductionOrderService.fetchProductionOrders(
      companyId
    );
    return successResponse(
      res,
      orders,
      "production order fetched successFully",
      200
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "error while fetching production order",
      400
    );
  }
};

const getProductionOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await ProductionOrderService.fetchProductionOrderById(
      orderId
    );
    return successResponse(
      res,
      order,
      "production order get successFully",
      200
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "error while get production order",
      400
    );
  }
};

module.exports = {
  createProductionOrder,
  getProductionOrders,
  getProductionOrderById,
};