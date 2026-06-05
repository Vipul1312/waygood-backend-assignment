const asyncHandler = require("../utils/asyncHandler");
const Student = require("../models/Student");
const HttpError = require("../utils/httpError");
const { buildProgramRecommendations } = require("../services/recommendationService");
const { generateStudyPlan } = require("../services/aiService");

const getRecommendations = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const payload = await buildProgramRecommendations(studentId);

  res.json({
    success: true,
    ...payload,
  });
});

const getStudyPlan = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findById(studentId).lean();

  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  const { data } = await buildProgramRecommendations(studentId);
  const plan = await generateStudyPlan(student, data.recommendations);

  res.json({
    success: true,
    data: plan,
  });
});

module.exports = {
  getRecommendations,
  getStudyPlan,
};
