const { default: mongoose } = require("mongoose");
const ProductionOrder = require("../models/productionOrder.model");
const { removeStock, addStock } = require("./stock.service");

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

    // Adjust stock inside the same session
    for (const material of rawMaterials) {
      await removeStock({
        companyId,
        itemId: material.itemId,
        quantity: material.quantity,
        session, // pass the same session
      });
    }

    for (const fg of finishedGoods) {
      await addStock({
        companyId,
        itemId: fg.itemId,
        quantity: fg.quantity,
        session, // pass the same session
      });
    }

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const fetchProductionOrders = async ({ companyId, page = 1, limit = 10 }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const skip = (page - 1) * limit;

    // ✅ Apply filter by companyId
    const filter = { companyId };

    const orders = await ProductionOrder.find(filter)
      .populate("rawMaterials.itemId", "name sku availableStock")
      .populate("finishedGoods.itemId", "name sku availableStock")
      .skip(skip)
      .limit(limit)
      .session(session);

    // ✅ Also filter count by companyId
    const total = await ProductionOrder.countDocuments(filter).session(session);

    await session.commitTransaction();
    session.endSession();

    return {
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deleteProductionOrder = async (orderId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await ProductionOrder.findById(orderId).session(session);

    if (!order) {
      throw new Error("Production order not found");
    }

    for (const material of order.rawMaterials) {
      await addStock({
        companyId: order.companyId,
        itemId: material.itemId,
        quantity: material.quantity,
        session,
      });
    }

    for (const fg of order.finishedGoods) {
      await removeStock({
        companyId: order.companyId,
        itemId: fg.itemId,
        quantity: fg.quantity,
        session,
      });
    }

    await ProductionOrder.deleteOne({ _id: orderId }).session(session);

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const fetchProductionOrder = async (orderId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await ProductionOrder.findById(orderId)
      .session(session)
      .populate({
        path: "rawMaterials.itemId",
        select:
          "name sku availableStock description category unitOfMeasure purchasePrice salePrice taxRate openingStock reorderLevel itemId",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "finishedGoods.itemId",
        select:
          "name sku availableStock description category unitOfMeasure purchasePrice salePrice taxRate openingStock reorderLevel itemId",
        populate: {
          path: "category",
          select: "name",
        },
      });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  createProductionOrder,
  fetchProductionOrders,
  deleteProductionOrder,
  fetchProductionOrder
};
