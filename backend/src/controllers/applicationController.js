const Application = require("../models/Application");
const asyncHandler = require("../utils/asyncHandler");
const {
  createApplication: createApplicationService,
  updateApplicationStatus: updateApplicationStatusService,
} = require("../services/applicationService");

const listApplications = asyncHandler(async (req, res) => {
  const { studentId, status } = req.query;
  const filters = {};

  if (studentId) {
    filters.student = studentId;
  }

  if (status) {
    filters.status = status;
  }

  const applications = await Application.find(filters)
    .populate("student", "fullName email role")
    .populate("program", "title degreeLevel tuitionFeeUsd")
    .populate("university", "name country city")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: applications,
  });
});

const createApplication = asyncHandler(async (req, res) => {
  const { programId, intake, note } = req.body;

  const application = await createApplicationService({
    studentId: req.user._id,
    programId,
    intake,
    note,
  });

  res.status(201).json({
    success: true,
    data: application,
  });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const application = await updateApplicationStatusService({
    applicationId: req.params.id,
    nextStatus: status,
    note,
  });

  res.json({
    success: true,
    data: application,
  });
});

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
};
