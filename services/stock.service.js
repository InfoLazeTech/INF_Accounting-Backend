const mongoose = require("mongoose");
const Item = require("../models/itemMaster.model");

// Basic stock operations
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

    // if (item.availableStock < quantity) {
    //   throw new Error("Not enough stock available");
    // }

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

// Handle bill stock updates (purchases - increase stock)
const updateStockForBill = async (billData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const stockUpdates = [];

  try {
    for (const item of billData.items) {
      const stockItem = await Item.findOne({
        _id: new mongoose.Types.ObjectId(item.itemId),
        companyId: new mongoose.Types.ObjectId(billData.companyId),
      }).session(session);

      if (!stockItem) throw new Error(`Item not found: ${item.itemId}`);

      stockItem.availableStock += item.quantity;
      await stockItem.save({ session });
      stockUpdates.push(stockItem);
    }

    await session.commitTransaction();
    session.endSession();
    return stockUpdates;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Handle invoice stock updates (sales - decrease stock)
const updateStockForInvoice = async (invoiceData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const stockUpdates = [];

  try {
    for (const item of invoiceData.items) {
      const stockItem = await Item.findOne({
        _id: new mongoose.Types.ObjectId(item.itemId),
        companyId: new mongoose.Types.ObjectId(invoiceData.companyId),
      }).session(session);

      if (!stockItem) throw new Error(`Item not found: ${item.itemId}`);

      if (stockItem.availableStock < item.quantity) {
        throw new Error(`Insufficient stock for item ${stockItem.name}. Available: ${stockItem.availableStock}, Required: ${item.quantity}`);
      }

      stockItem.availableStock -= item.quantity;
      await stockItem.save({ session });
      stockUpdates.push(stockItem);
    }

    await session.commitTransaction();
    session.endSession();
    return stockUpdates;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Handle bill edit scenarios
const handleBillEdit = async (oldItems, newItems, companyId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // First, reverse all old stock movements (remove stock)
    for (const oldItem of oldItems) {
      const stockItem = await Item.findOne({
        _id: new mongoose.Types.ObjectId(oldItem.itemId),
        companyId: new mongoose.Types.ObjectId(companyId),
      }).session(session);

      if (!stockItem) throw new Error(`Item not found: ${oldItem.itemId}`);

      if (stockItem.availableStock < oldItem.quantity) {
        throw new Error(`Insufficient stock to reverse for item ${stockItem.name}. Available: ${stockItem.availableStock}, Required: ${oldItem.quantity}`);
      }

      stockItem.availableStock -= oldItem.quantity;
      await stockItem.save({ session });
    }

    // Then, apply new stock movements (add stock)
    for (const newItem of newItems) {
      const stockItem = await Item.findOne({
        _id: new mongoose.Types.ObjectId(newItem.itemId),
        companyId: new mongoose.Types.ObjectId(companyId),
      }).session(session);

      if (!stockItem) throw new Error(`Item not found: ${newItem.itemId}`);

      stockItem.availableStock += newItem.quantity;
      await stockItem.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Handle invoice edit scenarios
const handleInvoiceEdit = async (oldItems, newItems, companyId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // First, reverse all old stock movements (add back the stock)
    for (const oldItem of oldItems) {
      const stockItem = await Item.findOne({
        _id: new mongoose.Types.ObjectId(oldItem.itemId),
        companyId: new mongoose.Types.ObjectId(companyId),
      }).session(session);

      if (!stockItem) throw new Error(`Item not found: ${oldItem.itemId}`);

      stockItem.availableStock += oldItem.quantity;
      await stockItem.save({ session });
    }

    // Then, apply new stock movements (remove stock for new items)
    for (const newItem of newItems) {
      const stockItem = await Item.findOne({
        _id: new mongoose.Types.ObjectId(newItem.itemId),
        companyId: new mongoose.Types.ObjectId(companyId),
      }).session(session);

      if (!stockItem) throw new Error(`Item not found: ${newItem.itemId}`);

      if (stockItem.availableStock < newItem.quantity) {
        throw new Error(`Insufficient stock for item ${stockItem.name}. Available: ${stockItem.availableStock}, Required: ${newItem.quantity}`);
      }

      stockItem.availableStock -= newItem.quantity;
      await stockItem.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Get low stock items
const getLowStockItems = async (companyId) => {
  return await Item.find({
    companyId,
    isActive: true,
    $expr: { $lte: ["$availableStock", "$reorderLevel"] }
  }).populate('category', 'name');
};

// Get stock summary for a company
const getStockSummary = async (companyId) => {
  return await Item.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), isActive: true } },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalStockValue: { $sum: { $multiply: ["$availableStock", "$purchasePrice"] } },
        lowStockItems: {
          $sum: {
            $cond: [{ $lte: ["$availableStock", "$reorderLevel"] }, 1, 0]
          }
        }
      }
    }
  ]);
};

module.exports = {
  addStock,
  removeStock,
  updateStockForBill,
  updateStockForInvoice,
  handleBillEdit,
  handleInvoiceEdit,
  getLowStockItems,
  getStockSummary
};
