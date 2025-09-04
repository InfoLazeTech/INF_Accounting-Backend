const { mongoose } = require('../config/db');
const Wallet = require('../models/wallet.model');
const User = require('../models/user.model');
const Network = require('../models/network.model');
const { encrypt } = require('../utils/crypto');
const bsc = require('./bsc.service');
const tron = require('./tron.service');
const { ethers } = require('ethers');

const ensureNetworks = async () => {
  const defs = [
    { key: 'bsc', name: 'BNB Smart Chain', chainId: Number(process.env.BSC_CHAIN_ID || 56), rpcUrl: process.env.BSC_RPC },
    { key: 'tron', name: 'Tron Network', chainId: null, rpcUrl: process.env.TRON_FULL_NODE }
  ];
  for (const n of defs) {
    await Network.updateOne({ key: n.key }, { $setOnInsert: n }, { upsert: true });
  }
}

const createDefaultWalletsForUser = async (userId) => {
  await ensureNetworks();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // BSC
    const b = await bsc.createWallet();
    const netBsc = await Network.findOne({ key: 'bsc' }).session(session);
    const wBsc = await new Wallet({
      user: userId,
      network: netBsc._id,
      networkKey: 'bsc',
      address: b.address,
      encryptedPrivateKey: encrypt(b.privateKey),
      imported: false
    }).save({ session });

    // Tron
    const t = await tron.createWallet();
    const netTron = await Network.findOne({ key: 'tron' }).session(session);
    const wTron = await new Wallet({
      user: userId,
      network: netTron._id,
      networkKey: 'tron',
      address: t.address,
      publicKey: t.publicKey,
      encryptedPrivateKey: encrypt(t.privateKey),
      imported: false
    }).save({ session });

     await User.findByIdAndUpdate(
      userId,
      { $push: { wallets: { $each: [wBsc._id, wTron._id] } } },
      { session }
    );


    await session.commitTransaction();
    session.endSession();
    return [wBsc, wTron];
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }
}

const createWalletForUser = async (userId, networkKey) => {
  await ensureNetworks(); // make sure networks exist

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const net = await Network.findOne({ key: networkKey }).session(session);
    if (!net) throw new Error("Network not found");

    let walletData;

    if (networkKey === "bsc") {
      const b = await bsc.createWallet();
      walletData = {
        user: userId,
        network: net._id,
        networkKey: "bsc",
        address: b.address,
        encryptedPrivateKey: encrypt(b.privateKey),
        imported: false
      };
    } else if (networkKey === "tron") {
      const t = await tron.createWallet();
      walletData = {
        user: userId,
        network: net._id,
        networkKey: "tron",
        address: t.address,
        publicKey: t.publicKey,
        encryptedPrivateKey: encrypt(t.privateKey),
        imported: false
      };
    } else {
      throw new Error("Unsupported network");
    }

    const wallet = await new Wallet(walletData).save({ session });

    await User.findByIdAndUpdate(
      userId,
      { $push: { wallets: wallet._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return wallet;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

async function importWallet(userId, networkKey, payload) {
  await ensureNetworks();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const net = await Network.findOne({ key: networkKey }).session(session);
    if (!net) throw new Error('Unsupported network');

    let w;
    if (networkKey === 'bsc') {
      if (payload.mnemonic) {
        const data = await bsc.importFromMnemonic(payload.mnemonic, payload.path);
        w = await new Wallet({
          user: userId, network: net._id, networkKey,
          address: data.address, encryptedPrivateKey: encrypt(data.privateKey),
          imported: true, meta: { mnemonic: true, path: payload.path }
        }).save({ session });
      } else if (payload.privateKey) {
        const data = await bsc.importFromPrivateKey(payload.privateKey);
        w = await new Wallet({
          user: userId, network: net._id, networkKey,
          address: data.address, encryptedPrivateKey: encrypt(data.privateKey),
          imported: true
        }).save({ session });
      } else {
        throw new Error('Provide mnemonic or privateKey');
      }
    } else if (networkKey === 'tron') {
      if (!payload.privateKey) throw new Error('Tron import requires privateKey');
      const data = await tron.importFromPrivateKey(payload.privateKey);
      w = await new Wallet({
        user: userId, network: net._id, networkKey,
        address: data.addressBase58, encryptedPrivateKey: encrypt(payload.privateKey),
        imported: true
      }).save({ session });
    } else {
      throw new Error('Unsupported network');
    }

    await session.commitTransaction();
    session.endSession();
    return w;
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }
}


const listUserWallets = async (userId) => {
  const user = await User.findById(userId)
    .select('_id email') // select fields you want for user
    .populate({
      path: 'wallets',
      select: '_id address network imported', // only these wallet fields
      populate: { path: 'network', select: 'key name' } // optional: include network info
    })
    .lean();

  if (!user) throw new Error('User not found');

  return user;
}

module.exports = {
  ensureNetworks,
  createDefaultWalletsForUser,
  createWalletForUser,
  importWallet,
  listUserWallets
};
