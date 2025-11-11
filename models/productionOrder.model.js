const mongoose = require("mongoose");
const CounterService = require("../services/counter.service");
const Item = require("./itemMaster.model");

const productionOrderSchema = new mongoose.Schema(
  {
    productionOrderNo: { type: String },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    date: { type: Date, default: Date.now },

    rawMaterials: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],

    finishedGoods: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Unique index per company
productionOrderSchema.index({ companyId: 1, productionOrderNo: 1 }, { unique: true });

// Auto-generate productionOrderNo before save
productionOrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      this.productionOrderNo = await CounterService.generateNextId(
        this.companyId.toString(),
        "PRODUCTION_ORDER",
        5
      );
    } catch (error) {
      return next(new Error(`Failed to generate production order number: ${error.message}`));
    }
  }
  next();
});

// After save — auto update stock
productionOrderSchema.post("save", async function (doc) {
  try {
    // Decrease stock of raw materials
    for (const material of doc.rawMaterials) {
      await Item.findByIdAndUpdate(
        material.itemId,
        { $inc: { availableStock: -material.quantity } },
        { new: true }
      );
    }

    // Increase stock of finished goods
    for (const fg of doc.finishedGoods) {
      await Item.findByIdAndUpdate(
        fg.itemId,
        { $inc: { availableStock: fg.quantity } },
        { new: true }
      );
    }
  } catch (error) {
    console.error("Error updating stock in production order:", error);
  }
});

module.exports = mongoose.model("ProductionOrder", productionOrderSchema);