const { mongoose } = require('../config/db');
const Wallet = require('../models/wallet.model');
const Tx = require('../models/transaction.model');
const { decrypt } = require('../utils/crypto');
const bsc = require('./bsc.service');
const tron = require('./tron.service');

const transferToken = async (userId, { networkKey, walletId, to, tokenAddress, amount }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const wallet = await Wallet.findOne({ _id: walletId, user: userId }).session(session);
    if (!wallet) throw new Error('Wallet not found');

    const pk = decrypt(wallet.encryptedPrivateKey);
    let txHash, raw;

    if (networkKey === 'bsc') {
      const res = await bsc.sendToken(pk, tokenAddress, to, amount);
      txHash = res.txHash; raw = res.receipt;
    } else if (networkKey === 'tron') {
      const res = await tron.sendToken(pk, tokenAddress, to, amount);
      txHash = res.txHash; raw = res.raw;
    } else {
      throw new Error('Unsupported network');
    }

    const rec = await new Tx({
      user: userId,
      networkKey,
      from: wallet.address,
      to,
      tokenAddress,
      amount,
      txHash,
      status: 'submitted',
      meta: raw
    }).save({ session });

    await session.commitTransaction();
    session.endSession();
    return rec;
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }
}

module.exports = { transferToken };
