const { validationResult } = require("express-validator");

const HttpError = require("../utils/httpError");

function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const details = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  throw new HttpError(422, "Validation failed.", details);
}

module.exports = validate;
