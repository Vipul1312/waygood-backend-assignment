const express = require("express");

const {
  getRecommendations,
  getStudyPlan,
} = require("../controllers/recommendationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/:studentId", getRecommendations);
router.get("/:studentId/study-plan", requireAuth, getStudyPlan);

module.exports = router;
