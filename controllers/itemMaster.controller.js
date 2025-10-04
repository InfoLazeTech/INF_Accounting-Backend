const { successResponse, errorResponse } = require("../utils/response");
const httpStatus = require("http-status");
const Item = require("../models/itemMaster.model");
const ItemCategory = require("../models/itemCategory.model");
const Company = require("../models/company.model");
const itemService = require("../services/itemMaster.service");

const createItem = async (req, res) => {
  try {
    const data = req.body;

    const company = await Company.findById(data.companyId);
    if (!company) return errorResponse(res, "Company not found", 404);

    const category = await ItemCategory.findById(data.category);
    if (!category) return errorResponse(res, "Category not found", 404);

    const item = await itemService.createItem(data);
    return successResponse(res, item, "Item created successfully", httpStatus.CREATED);
  } catch (error) {
    const message = error.message || "Failed to create item";
    const statusCode = error.statusCode || httpStatus.BAD_REQUEST;
    
    return errorResponse(res, message, statusCode);
  }
};

const getAllItems = async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return errorResponse(res, "Company ID is required", 400);
    }

    const { page, limit, search } = req.query;
    const filter = { companyId };
    const options = { page, limit, search };

    const result = await itemService.getAllItems(filter, options);
    return successResponse(res, result.items, "Items fetched successfully", httpStatus.OK, {
      pagination: result.pagination,
      search: result.search
    });
  } catch (error) {
    const message = error.message || "Failed to fetch items";
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    
    return errorResponse(res, message, statusCode);
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
  //  const { companyId } = req.query;
    
    // if (!companyId) {
    //   return errorResponse(res, "Company ID is required", 400);
    // }

    const item = await itemService.getItemById(id);
    if (!item) return errorResponse(res, "Item not found", 404);
    
    return successResponse(res, item, "Item fetched successfully");
  } catch (error) {
    const message = error.message || "Failed to fetch item";
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    
    return errorResponse(res, message, statusCode);
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.category) {
      const category = await ItemCategory.findById(data.category);
      if (!category) return errorResponse(res, "Category not found", 404);
    }

    const item = await itemService.updateItem(id, data);
    if (!item) return errorResponse(res, "Item not found", 404);

    return successResponse(res, item, "Item updated successfully");
  } catch (error) {
    const message = error.message || "Failed to update item";
    const statusCode = error.statusCode || httpStatus.BAD_REQUEST;
    
    return errorResponse(res, message, statusCode);
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await itemService.deleteItem(id);
    if (!item) return errorResponse(res, "Item not found", 404);
    
    return successResponse(res, null, "Item deleted successfully");
  } catch (error) {
    const message = error.message || "Failed to delete item";
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    
    return errorResponse(res, message, statusCode);
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};
