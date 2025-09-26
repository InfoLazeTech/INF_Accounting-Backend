const mongoose = require("mongoose");
const Counter = require("./counter.model");

const itemSchema = new mongoose.Schema(
  {
    itemId: { type: String, unique: true },
    sku: { type: String, unique: true, required: true },
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
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-increment itemId
itemSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "itemId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Zero-padded to 5 digits: I-00001, I-00002, ...
    this.itemId = `I-${String(counter.seq).padStart(5, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Item", itemSchema);
