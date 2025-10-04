const { successResponse, errorResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");
const itemCategoryService = require("../services/itemCategory.service");
const Company = require("../models/company.model");

const createCategory = catchAsync(async (req, res) => {
  const { name, companyId } = req.body;

  const company = await Company.findById(companyId);
  if (!company) return errorResponse(res, "Company not found", 404);

  const category = await itemCategoryService.createItemCategory({ name, companyId });
  return successResponse(res, category, "Item category created successfully", 201);
});

const getCategories = catchAsync(async (req, res) => {
  const { companyId } = req.query;
  
  if (!companyId) {
    return errorResponse(res, "Company ID is required", 400);
  }

  const categories = await itemCategoryService.getAllItemCategories({ companyId });
  return successResponse(res, categories, "Item categories fetched successfully");
});

const getCategoryById = catchAsync(async (req, res) => {
  const category = await itemCategoryService.getItemCategoryById(req.params.id);
  if (!category) return errorResponse(res, "Category not found", 404);

  return successResponse(res, category, "Item category fetched successfully");
});

const updateCategory = catchAsync(async (req, res) => {
  const { name, companyId } = req.body;

  if (companyId) {
    const company = await Company.findById(companyId);
    if (!company) return errorResponse(res, "Company not found", 404);
  }

  const updated = await itemCategoryService.updateItemCategory(req.params.id, { name, companyId });
  if (!updated) return errorResponse(res, "Category not found", 404);

  return successResponse(res, updated, "Item category updated successfully");
});

const deleteCategory = catchAsync(async (req, res) => {
  const deleted = await itemCategoryService.deleteItemCategory(req.params.id);
  if (!deleted) return errorResponse(res, "Category not found", 404);

  return successResponse(res, null, "Item category deleted successfully");
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
