const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  module: { type: String, required: true }, // 'customer', 'item', 'invoice', etc.
  seq: { type: Number, default: 0 },
  prefix: { type: String, required: true }, // 'CUS', 'ITM', 'INV', etc.
  lastGenerated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound index for efficient queries
counterSchema.index({ companyId: 1, module: 1 }, { unique: true });

// Static method to get next sequence number
counterSchema.statics.getNextSequence = async function(companyId, module, prefix) {
  try {
    const counter = await this.findOneAndUpdate(
      { companyId, module },
      { 
        $inc: { seq: 1 },
        $set: { 
          prefix,
          lastGenerated: new Date()
        }
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    return counter.seq;
  } catch (error) {
    throw new Error(`Failed to generate sequence for ${module} in company ${companyId}: ${error.message}`);
  }
};

// Static method to get current sequence without incrementing
counterSchema.statics.getCurrentSequence = async function(companyId, module) {
  try {
    const counter = await this.findOne({ companyId, module });
    return counter ? counter.seq : 0;
  } catch (error) {
    throw new Error(`Failed to get current sequence for ${module} in company ${companyId}: ${error.message}`);
  }
};

// Static method to reset sequence (for testing/admin purposes)
counterSchema.statics.resetSequence = async function(companyId, module, newSeq = 0) {
  try {
    await this.findOneAndUpdate(
      { companyId, module },
      { 
        seq: newSeq,
        lastGenerated: new Date()
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    throw new Error(`Failed to reset sequence for ${module} in company ${companyId}: ${error.message}`);
  }
};

module.exports = mongoose.model("Counter", counterSchema);