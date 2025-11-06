const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    openingBalance : {type: Number, default: 0, required: true, },
    bankBalance: { type: Number, default: 0 , required: true,},
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bank", bankSchema);
