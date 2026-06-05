const express = require("express");
const { body } = require("express-validator");

const {
  createApplication,
  listApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { applicationStatuses } = require("../config/constants");

const router = express.Router();

router.get("/", listApplications);

router.post(
  "/",
  requireAuth,
  [
    body("programId").notEmpty().withMessage("programId is required."),
    body("intake").trim().notEmpty().withMessage("intake is required."),
  ],
  validate,
  createApplication
);

router.patch(
  "/:id/status",
  requireAuth,
  [
    body("status")
      .isIn(applicationStatuses)
      .withMessage("A valid status is required."),
  ],
  validate,
  updateApplicationStatus
);

module.exports = router;
