const { default: mongoose } = require("mongoose");
const ProductionOrder = require("../models/productionOrder.model");

const createProductionOrder = async (
  companyId,
  date,
  rawMaterials,
  finishedGoods
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = new ProductionOrder({
      companyId,
      date,
      rawMaterials,
      finishedGoods,
    });

    await order.save({ session });
    console.log("raw:",rawMaterials, '||', "fg:",finishedGoods);
    

    // for (const material of rawMaterials) {
    //   await removeStock({
    //     companyId,
    //     itemId: material.itemId,
    //     quantity: material.quantity,
    //     session,
    //   });
    // }

    // for (const fg of finishedGoods) {
    //   await addStock({
    //     companyId,
    //     itemId: fg.itemId,
    //     quantity: fg.quantity,
    //     session,
    //   });
    // }

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const fetchProductionOrders = async (companyId) => {
  try {
    const orders = await ProductionOrder.find(companyId)
      .populate("rawMaterials.itemId", "name sku availableStock")
      .populate("finishedGoods.itemId", "name sku availableStock");
    return orders;
  } catch (error) {
    throw error;
  }
};

const fetchProductionOrderById = async (orderId) => {
  try {
    const order = await ProductionOrder.findById(orderId)
      .populate("rawMaterials.itemId", "name sku availableStock")
      .populate("finishedGoods.itemId", "name sku availableStock");
    return order;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProductionOrder,
  fetchProductionOrders,
  fetchProductionOrderById,
};
