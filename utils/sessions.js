const { default: mongoose } = require("mongoose");
const runWithRetry = async (fn, maxRetries = 5) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await fn(session);
      await session.commitTransaction();
      session.endSession();
      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      if (error.errorLabels && error.errorLabels.includes("TransientTransactionError")) {
        console.warn(`⚠️ Write conflict detected (attempt ${attempt}/${maxRetries}), retrying...`);
        await new Promise(r => setTimeout(r, 100 * attempt)); // small backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error("Transaction failed after max retries");
};

module.exports = {runWithRetry}