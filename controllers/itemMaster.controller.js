const { successResponse, errorResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");
const Item = require("../models/itemMaster.model");
const ItemCategory = require("../models/itemCategory.model");
const Company = require("../models/company.model");
const itemService = require("../services/itemMaster.service");

const createItem = catchAsync(async (req, res) => {
  const data = req.body;

  const company = await Company.findById(data.companyId);
  if (!company) return errorResponse(res, "Company not found", 404);

  const category = await ItemCategory.findById(data.category);
  if (!category) return errorResponse(res, "Category not found", 404);

  const item = await itemService.createItem(data);
  return successResponse(res, item, "Item created successfully");
});

const getAllItems = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.companyId) filter.companyId = req.query.companyId;

  const items = await itemService.getAllItems(filter);
  return successResponse(res, items, "Items fetched successfully");
});

const getItemById = catchAsync(async (req, res) => {
  const item = await itemService.getItemById(req.params.id);
  if (!item) return errorResponse(res, "Item not found", 404);
  return successResponse(res, item, "Item fetched successfully");
});

const updateItem = catchAsync(async (req, res) => {
  const data = req.body;

  if (data.companyId) {
    const company = await Company.findById(data.companyId);
    if (!company) return errorResponse(res, "Company not found", 404);
  }

  if (data.category) {
    const category = await ItemCategory.findById(data.category);
    if (!category) return errorResponse(res, "Category not found", 404);
  }

  const item = await itemService.updateItem(req.params.id, data);
  if (!item) return errorResponse(res, "Item not found", 404);

  return successResponse(res, item, "Item updated successfully");
});

const deleteItem = catchAsync(async (req, res) => {
  const item = await itemService.deleteItem(req.params.id);
  if (!item) return errorResponse(res, "Item not found", 404);
  return successResponse(res, null, "Item deleted successfully");
});

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};
