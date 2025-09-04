const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  network: { type: mongoose.Schema.Types.ObjectId, ref: 'Network' },
  networkKey: { type: String, index: true }, // convenience: 'bsc' | 'tron'
  address: { type: String, required: true, index: true },
  publicKey: String,
  encryptedPrivateKey: { type: String, required: true },
  derivationPath: String,
  imported: { type: Boolean, default: false },
  meta: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wallet', WalletSchema);
