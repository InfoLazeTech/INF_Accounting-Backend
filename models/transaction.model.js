const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    date: { type: Date, default: Date.now },
    description: { type: String, trim: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transactions", transactionSchema);