const Joi = require('joi');

const createWalletValidation= Joi.object({
  networkKey: Joi.string().valid('bsc', 'tron').required()
});

const listWalletsValidation = Joi.object({
  userId: Joi.string().hex().length(24).required() 
});

module.exports = {createWalletValidation,listWalletsValidation}