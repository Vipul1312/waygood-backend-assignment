const Student = require("../models/Student");
const HttpError = require("../utils/httpError");
const { signToken, sanitizeStudent } = require("../utils/token");

async function registerStudent(payload) {
  const existing = await Student.findOne({ email: payload.email });

  if (existing) {
    throw new HttpError(409, "An account with this email already exists.");
  }

  const student = await Student.create({
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    role: payload.role || "student",
    targetCountries: payload.targetCountries || [],
    interestedFields: payload.interestedFields || [],
    preferredIntake: payload.preferredIntake || "",
    maxBudgetUsd: payload.maxBudgetUsd || 0,
    englishTest: payload.englishTest || { exam: "IELTS", score: 0 },
  });

  return {
    token: signToken(student),
    user: sanitizeStudent(student),
  };
}

async function loginStudent(email, password) {
  const student = await Student.findOne({ email });

  if (!student) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const passwordMatches = await student.comparePassword(password);

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid email or password.");
  }

  return {
    token: signToken(student),
    user: sanitizeStudent(student),
  };
}

module.exports = {
  registerStudent,
  loginStudent,
};
