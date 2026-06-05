const express = require("express");
const { getOverview } = require("../controllers/dashboardController");
const router = express.Router();
router.get("/", getOverview);
router.get("/overview", getOverview);
module.exports = router;