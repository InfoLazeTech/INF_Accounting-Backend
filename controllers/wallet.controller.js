const { successResponse, errorResponse } = require("../utils/response");
const walletService = require("../services/wallet.service");
const catchAsync = require("../utils/catchAsync");

const createDefaultWallets = catchAsync(async (req, res) => {
  try {
    const userId = req.user.userId;
    const wallets = await walletService.createDefaultWalletsForUser(userId);
    const CreatedWallets = wallets.map((w) => ({
      _id: w._id,
      walletAddress: w.walletAddress, // handle whichever field exists
      networkKey: w.networkKey,
    }));
    return successResponse(res, CreatedWallets, "Created default wallets", 200);
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Failed to create wallets",
      500,
      error
    );
  }
});

const createWallet = catchAsync(async (req, res) => {
  try {
    const userId = req.user.userId;
    const { networkKey } = req.body;
    if (!networkKey) return error(res, "networkKey is required", 400);

    const wallet = await walletService.createWalletForUser(userId, networkKey);
    const CreatedWallet = {
      _id: wallet._id,
      walletAddress: wallet.walletAddress,
      networkKey: wallet.networkKey,
    };
    return successResponse(res, CreatedWallet, "Wallet created successfully", 200);
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Failed to create wallet",
      500,
      error
    );
  }
});

const list = catchAsync(async (req, res) => {
  try {
    const userId = req.user.userId;
    const wallets = await walletService.listUserWallets(userId);
    return successResponse(res, wallets, "Wallets of user retrieved", 200);
  } catch (error) {
    return errorResponse(
      res,
      error.message || "Failed to retrieve wallets",
      500,
      error
    );
  }
});

module.exports = { createDefaultWallets, list, createWallet };
