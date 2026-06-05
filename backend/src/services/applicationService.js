const mongoose = require("mongoose");

const Application = require("../models/Application");
const Program = require("../models/Program");
const HttpError = require("../utils/httpError");
const { validStatusTransitions } = require("../config/constants");
const cacheService = require("./cacheService");

async function createApplication({ studentId, programId, intake, note }) {
  if (!mongoose.isValidObjectId(programId)) {
    throw new HttpError(400, "Invalid program id.");
  }

  const program = await Program.findById(programId).lean();

  if (!program) {
    throw new HttpError(404, "Program not found.");
  }

  if (!program.intakes.includes(intake)) {
    throw new HttpError(422, `Intake "${intake}" is not offered for this program.`);
  }

  const duplicate = await Application.findOne({
    student: studentId,
    program: programId,
    intake,
  }).lean();

  if (duplicate) {
    throw new HttpError(409, "You have already applied to this program for this intake.");
  }

  const application = await Application.create({
    student: studentId,
    program: program._id,
    university: program.university,
    destinationCountry: program.country,
    intake,
    status: "draft",
    timeline: [{ status: "draft", note: note || "Application created." }],
  });

  cacheService.delete("dashboard-overview");

  return application;
}

async function updateApplicationStatus({ applicationId, nextStatus, note }) {
  if (!mongoose.isValidObjectId(applicationId)) {
    throw new HttpError(400, "Invalid application id.");
  }

  const application = await Application.findById(applicationId);

  if (!application) {
    throw new HttpError(404, "Application not found.");
  }

  const allowed = validStatusTransitions[application.status] || [];

  if (!allowed.includes(nextStatus)) {
    throw new HttpError(
      422,
      `Cannot move application from "${application.status}" to "${nextStatus}".`,
      { allowedTransitions: allowed }
    );
  }

  application.status = nextStatus;
  application.timeline.push({
    status: nextStatus,
    note: note || `Status changed to ${nextStatus}.`,
  });

  await application.save();

  cacheService.delete("dashboard-overview");

  return application;
}

module.exports = {
  createApplication,
  updateApplicationStatus,
};
