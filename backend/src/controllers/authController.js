const asyncHandler = require("../utils/asyncHandler");
const { sanitizeStudent } = require("../utils/token");
const { registerStudent, loginStudent } = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const result = await registerStudent(req.body);

  res.status(201).json({
    success: true,
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginStudent(email, password);

  res.json({
    success: true,
    data: result,
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: sanitizeStudent(req.user),
  });
});

module.exports = {
  register,
  login,
  me,
};
