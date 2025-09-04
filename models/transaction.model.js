const mongoose = require('mongoose');

const TxSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  networkKey: String,
  from: String,
  to: String,
  tokenAddress: String,
  amount: String,
  txHash: String,
  status: { type: String, default: 'pending' }, // pending|submitted|failed
  meta: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TxSchema);
