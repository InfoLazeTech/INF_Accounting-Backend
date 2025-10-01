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

const updateItemold = async (id, data) => {
  const item = await Item.findById(id);
  if (!item) return null;
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== item[key]) {
      item[key] = data[key];
    }
  });
  return await item.save();
};

const updateItem = async (id, data) => {
  const item = await Item.findOneAndUpdate(
    { _id: id }, 
    { $set: data }, 
    { new: true, runValidators: true }
  );

  if (!item) {
    throw new Error("Item not found");
  }

  return item;
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
