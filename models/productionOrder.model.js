const mongoose = require("mongoose");
const CounterService = require("../services/counter.service");

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

module.exports = mongoose.model("ProductionOrder", productionOrderSchema);