const { errorResponse } = require("../utils/response");

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,  // show all validation errors, not just the first
    stripUnknown: true, // remove fields not defined in schema
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return errorResponse(res, "Validation failed", 400, errors);
  }

  // overwrite req.body with validated + sanitized values
  req.body = value;

  next();
};

module.exports = validate;
