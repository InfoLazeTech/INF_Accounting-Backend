const mongoose = require("mongoose");
const Item = require("../models/itemMaster.model");

const addStock = async ({ companyId, itemId, quantity }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const item = await Item.findOne({
      _id: new mongoose.Types.ObjectId(itemId),
      companyId: new mongoose.Types.ObjectId(companyId),
    }).session(session); 

    if (!item) throw new Error("Item not found for this company");

    item.availableStock += quantity;
    await item.save({ session }); 

    await session.commitTransaction();
    session.endSession();

    return item;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const removeStock = async ({ companyId, itemId, quantity }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const item = await Item.findOne({
      _id: new mongoose.Types.ObjectId(itemId),
      companyId: new mongoose.Types.ObjectId(companyId),
    }).session(session);

    if (!item) throw new Error("Item not found for this company");

    if (item.availableStock < quantity) {
      throw new Error("Not enough stock available");
    }

    item.availableStock -= quantity;
    await item.save({ session });

    await session.commitTransaction();
    session.endSession();

    return item;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  addStock,
  removeStock,
};
