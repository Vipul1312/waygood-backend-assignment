const express = require("express");
const { body } = require("express-validator");

const { login, me, register } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
    body("role")
      .optional()
      .isIn(["student", "counselor"])
      .withMessage("Role must be student or counselor."),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  login
);

router.get("/me", requireAuth, me);

module.exports = router;
