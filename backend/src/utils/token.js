const jwt = require("jsonwebtoken");

const env = require("../config/env");

function signToken(student) {
  return jwt.sign({ sub: student._id, role: student.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function sanitizeStudent(student) {
  return {
    id: student._id,
    fullName: student.fullName,
    email: student.email,
    role: student.role,
    targetCountries: student.targetCountries,
    interestedFields: student.interestedFields,
    preferredIntake: student.preferredIntake,
    maxBudgetUsd: student.maxBudgetUsd,
    englishTest: student.englishTest,
    profileComplete: student.profileComplete,
  };
}

module.exports = {
  signToken,
  sanitizeStudent,
};
