const mongoose = require("mongoose");
const CounterService = require("../services/counter.service");

const itemSchema = new mongoose.Schema(
  {
    itemId: { type: String }, // ITM-00001 (unique per company)
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ItemCategory" },
    unitOfMeasure: {
      type: String,
      enum: ["pcs", "kg", "liter", "box", "meter", "pack"],
      required: true,
    },
    purchasePrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    openingStock: { type: Number, default: 0 },
    availableStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound unique index for itemId per company
itemSchema.index({ companyId: 1, itemId: 1 }, { unique: true });

itemSchema.pre("save", async function (next) {
  if (this.isNew) {
    if (!this.companyId) {
      return next(new Error("Company ID is required for item"));
    }
    try {
      this.itemId = await CounterService.generateNextId(
        this.companyId.toString(),
        'ITEM',
        5
      );
      
      // Double-check for uniqueness within the company
      const existingItem = await this.constructor.findOne({
        companyId: this.companyId,
        itemId: this.itemId
      });
      
      if (existingItem) {
        this.itemId = await CounterService.generateNextId(
          this.companyId.toString(),
          'ITEM',
          5
        );
      }
    } catch (error) {
      return next(new Error(`Failed to generate item ID: ${error.message}`));
    }
  }
  next();
});

module.exports = mongoose.model("Item", itemSchema);
