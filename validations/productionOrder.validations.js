const Joi = require("joi");

const createProductionOrderValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "any.required": "companyId is required",
    "string.empty": "companyId cannot be empty",
  }),

  date: Joi.date().optional().messages({
    "any.required": "date is required",
    "date.base": "date must be a valid date",
  }),

  rawMaterials: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().required().messages({
          "any.required": "rawMaterial.itemId is required",
        }),
        quantity: Joi.number().positive().required().messages({
          "number.base": "rawMaterial.quantity must be a number",
          "number.positive": "rawMaterial.quantity must be positive",
          "any.required": "rawMaterial.quantity is required",
        }),
      })
    )
    .required()
    .messages({
      "array.base": "rawMaterials must be an array",
      "any.required": "rawMaterials are required",
    }),

  finishedGoods: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().required().messages({
          "any.required": "finishedGood.itemId is required",
        }),
        quantity: Joi.number().positive().required().messages({
          "number.base": "finishedGood.quantity must be a number",
          "number.positive": "finishedGood.quantity must be positive",
          "any.required": "finishedGood.quantity is required",
        }),
      })
    )
    .required()
    .messages({
      "array.base": "finishedGoods must be an array",
      "any.required": "finishedGoods are required",
    }),
}).unknown(false);

module.exports = {createProductionOrderValidation}