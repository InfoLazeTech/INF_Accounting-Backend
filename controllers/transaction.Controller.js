const { success } = require('../utils/response');
const txService = require('../services/transaction.service');
const catchAsync = require('../utils/catchAsync');

const transfer =  catchAsync(async (req, res, next) => {
  try {
    const { networkKey, walletId, to, tokenAddress, amount } = req.body;
    const tx = await txService.transferToken(req.session.userId, { networkKey, walletId, to, tokenAddress, amount });
    res.json(success(tx, 'Transfer submitted'));
  } catch (e) { next(e); }
});

module.exports = { transfer };
