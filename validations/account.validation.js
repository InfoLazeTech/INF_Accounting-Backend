const Joi = require("joi");

const parentTypeEnum = [
  "Capital/Equity",
  "Non-Current Liabilities",
  "Current Liabilities",
  "Fixed Assets",
  "Investments",
  "Non Current Assets",
  "Current Assets",
  "Purchase Account",
  "Direct Expense",
  "Indirect Expense",
  "Sales Account",
  "Direct Income",
  "Indirect Income",
  "other"
];

const createAccountValidation = Joi.object({
  companyId: Joi.string().trim().required().messages({
    "string.empty": "companyId is required",
  }),
  parenttype: Joi.string()
    .valid(...parentTypeEnum)
    .required()
    .messages({
      "any.only": "Invalid parenttype",
      "string.empty": "parenttype is required",
    }),
  accountname: Joi.string().trim().required().messages({
    "string.empty": "Account name is required",
  }),
  accountcode: Joi.string().trim().required().messages({
    "string.empty": "Account code is required",
  }),
  description: Joi.string().trim().optional().allow("").default(""),
}).unknown(false);
const listAccountsValidation = Joi.object({
  companyId: Joi.string().trim().required().messages({
    "string.empty": "companyId is required",
  }),
  search: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).unknown(false);

const getAccountByIdValidation = Joi.object({
  companyId: Joi.string().trim().required().messages({
    "string.empty": "companyId is required",
  }),
}).unknown(false);


module.exports = {
  createAccountValidation,
  listAccountsValidation,
  getAccountByIdValidation,
};