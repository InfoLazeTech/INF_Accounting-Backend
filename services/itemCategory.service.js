const ItemCategory = require("../models/itemCategory.model");

const createItemCategory = async (data) => {
  const itemCategory = new ItemCategory(data);
  return await itemCategory.save();
};

const getAllItemCategories = async (filter = {}) => {
  return await ItemCategory.find(filter).populate(
    "companyId",
    "_id companyName"
  );
};

const getItemCategoryById = async (id) => {
  return await ItemCategory.findById(id).populate(
    "companyId",
    "_id companyName"
  );
};

const updateItemCategory = async (id, updateData) => {
  return await ItemCategory.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

const deleteItemCategory = async (id) => {
  return await ItemCategory.findByIdAndDelete(id);
};

module.exports = {
  createItemCategory,
  getAllItemCategories,
  getItemCategoryById,
  updateItemCategory,
  deleteItemCategory,
};
