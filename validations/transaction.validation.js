const Joi = require("joi");

const addTransactionValidation = Joi.object({
  bankId: Joi.string().required(),
  date: Joi.date().optional(),
  description: Joi.string().optional(),
  debit: Joi.number().min(0).optional(),
  credit: Joi.number().min(0).optional(),
}).or("debit", "credit");

module.exports = {
  addTransactionSchema,
};
