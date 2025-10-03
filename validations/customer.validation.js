const Joi = require("joi");

const addressValidation = Joi.object({
  street: Joi.string().required().messages({
    "string.empty": "Street is required",
  }),
  city: Joi.string().required().messages({
    "string.empty": "City is required",
  }),
  state: Joi.string().required().messages({
    "string.empty": "State is required",
  }),
  zip: Joi.string().required().messages({
    "string.empty": "ZIP code is required",
  }),
  country: Joi.string().required().messages({
    "string.empty": "Country is required",
  }),
})
  .required()
  .messages({
    "any.required": "Address is required",
  });

const customerVendorValidation = Joi.object({
  companyId: Joi.string()
  .required()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.empty": "Company ID is required",
    "string.pattern.base": "Company ID must be a valid MongoDB ObjectId",
  }),
  companyName: Joi.string().required().messages({
    "string.empty": "Company name is required",
  }),
  type: Joi.object({
    isCustomer: Joi.boolean().required(),
    isVendor: Joi.boolean().required(),
  })
    .required()
    .custom((value, helpers) => {
      if (
        (value.isCustomer && value.isVendor) ||
        (!value.isCustomer && !value.isVendor)
      ) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid":
        "You must select either Customer OR Vendor, not both or none.",
      "any.required": "Type is required",
    }),

  contactPerson: Joi.string().required().messages({
    "string.empty": "Contact person is required",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone is required",
      "string.pattern.base": "Phone must be a valid 10-digit number",
    }),

  billingAddress: addressValidation,
  shippingAddress: addressValidation,

  gstNumber: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .required()
    .messages({
      "string.empty": "GST Number is required",
      "string.pattern.base":
        "GST Number must be a valid 15-character GSTIN (e.g., 27ABCDE1234F1Z5)",
    }),

  creditLimit: Joi.number().min(0).required().messages({
    "number.base": "Credit limit must be a number",
    "number.min": "Credit limit cannot be negative",
    "any.required": "Credit limit is required",
  }),

  paymentTerms: Joi.string()
    .valid("Prepaid", "Net 15", "Net 30", "Custom")
    .required()
    .messages({
      "any.only":
        "Payment terms must be one of Prepaid, Net 15, Net 30, Custom",
      "any.required": "Payment terms are required",
    }),

  status: Joi.string()
    .valid("Active", "Inactive") // Blocked removed
    .required()
    .messages({
      "any.only": "Status must be Active or Inactive",
      "any.required": "Status is required",
    }),
});

module.exports = { customerVendorValidation };
