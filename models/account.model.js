const mongoose = require("mongoose");
const ParentTypeEnum = [
  "Capital/Equity",
  "Non-Current Liabilities",
  "Current Liabilities",
  "Fixed Assets",
  "Investments",
  "Non Current Assets",
  "Current Assets",
  "Purchase Account",
  "Direct Expense",
  "Indirect Expense",
  "Sales Account",
  "Direct Income",
  "Indirect Income",
  "other"
];

const accountSchema = new mongoose.Schema(
  {
    parenttype: {
      type: String,
      enum: ParentTypeEnum,
      required: true,
    },
    accountname: {        
      type: String,
      required: true,
      trim: true,
    },
    accountcode: {         
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
