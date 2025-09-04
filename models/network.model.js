const mongoose = require('mongoose');

const NetworkSchema = new mongoose.Schema({
  key: { type: String, unique: true }, // 'bsc' | 'tron'
  name: String,
  chainId: Number,
  rpcUrl: String,
  meta: Object
});

module.exports = mongoose.model('Network', NetworkSchema);
