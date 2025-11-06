const Joi = require("joi");

const createBankAccountValidation = Joi.object({
  bankName: Joi.string().required(),
  accountNumber: Joi.string().required(),
});

module.exports = {
  createBankAccountSchema,
};
