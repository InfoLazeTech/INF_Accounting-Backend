const { success } = require('../utils/response');
const walletService = require('../services/wallet.service');
const catchAsync = require('../utils/catchAsync');

const createDefaultWallets = catchAsync(async (req, res,next) => {
  try {
    const userId = req.user.userId;
    const wallet  = await walletService.createDefaultWalletsForUser(userId);
    res.json(success(wallet , 'Created default wallets'));
  } catch (e) { next(e); }
});

const createWallet  = catchAsync(async (req, res,next) => {
  try {
    const userId = req.user.userId;
    const { networkKey } = req.body;
    if (!networkKey) return res.status(400).json({ success: false, message: "networkKey is required" });

    const wallet  = await walletService.createWalletForUser(userId, networkKey);
    res.json(success(wallet, 'Wallet created successfully'));
  } catch (e) { next(e); }
});

async function importWallet(req, res, next) {
  try {
    const { network, type, value, path } = req.body;

     const payload = {};
    if (type === 'phrase') payload.mnemonic = value;
    if (type === 'privateKey') payload.privateKey = value;
    if (path) payload.path = path;
    const out = await walletService.importWallet(req.session.userId, network, payload);
    res.json(success(out, 'Imported wallet'));
  } catch (e) { next(e); }
}

const list = catchAsync(async (req, res,next) => {
  try {
    const {userId} = req.query; 
    const wallet = await walletService.listUserWallets(userId);
    res.json(success(wallet, 'Wallets Of User retrived'));
  } catch (e) { next(e); }
});

module.exports = { createDefaultWallets, importWallet, list, createWallet };
