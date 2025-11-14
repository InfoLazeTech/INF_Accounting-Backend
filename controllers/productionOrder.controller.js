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
    const { companyId, page, limit } = req.query;

    const orders = await ProductionOrderService.fetchProductionOrders({
      companyId,
      page,
      limit,
    });

    return successResponse(
      res,
      orders.data,
      "Production orders fetched successfully",
      200,
      orders.pagination
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Error while fetching production orders",
      400
    );
  }
};

const deleteProductionOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await ProductionOrderService.deleteProductionOrder(orderId);
    return successResponse(res, null, "ProductionOrder Deleted successFully", 200)
  } catch (error) {
    return errorResponse(res, error.message || "Error while Deleting ProductionOrder", 400);
  }
};

const getProductionOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await ProductionOrderService.fetchProductionOrder(orderId);
    return successResponse(res, order, "ProductionOrder Fetched successFully", 200)
  } catch (error) {
    return errorResponse(res, error.message || "Error while Fetching ProductionOrder", 400);
  }
};

module.exports = {
  createProductionOrder,
  getProductionOrders,
  deleteProductionOrder,
  getProductionOrder
};