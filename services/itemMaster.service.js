const Item = require("../models/itemMaster.model");

const createItem = async (data) => {
  const item = new Item(data);
  return await item.save();
};

const getAllItems = async (filter = {}) => {
  return await Item.find(filter)
    .populate("category")
    .populate("addedBy", "name email")
    .populate("updatedBy", "name email")
    .sort({ createdAt: -1 });
};

const getItemById = async (id) => {
  return await Item.findById(id)
    .populate("category")
    .populate("addedBy", "name email")
    .populate("updatedBy", "name email");
};

const updateItem = async (id, data) => {
  return await Item.findByIdAndUpdate(id, data, { new: true });
};

const deleteItem = async (id) => {
  return await Item.findByIdAndDelete(id);
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};
