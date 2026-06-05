const mongoose = require("mongoose");

const Program = require("../models/Program");
const Student = require("../models/Student");
const HttpError = require("../utils/httpError");

async function buildProgramRecommendations(studentId) {
  if (!mongoose.isValidObjectId(studentId)) {
    throw new HttpError(400, "Invalid student id.");
  }

  const student = await Student.findById(studentId).lean();

  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  const targetCountries = student.targetCountries || [];
  const interestedFields = student.interestedFields || [];
  const preferredIntake = student.preferredIntake || "";
  const maxBudgetUsd = student.maxBudgetUsd || 0;
  const ieltsScore = (student.englishTest && student.englishTest.score) || 0;

  const fieldRegexes = interestedFields.map(
    (field) => new RegExp(field, "i")
  );

  const recommendations = await Program.aggregate([
    {
      $match: {
        $or: [
          { country: { $in: targetCountries } },
          { field: { $in: fieldRegexes } },
        ],
      },
    },
    {
      $addFields: {
        countryMatch: { $in: ["$country", targetCountries] },
        fieldMatch: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: interestedFields,
                  as: "interest",
                  cond: {
                    $regexMatch: {
                      input: "$field",
                      regex: "$$interest",
                      options: "i",
                    },
                  },
                },
              },
            },
            0,
          ],
        },
        withinBudget: {
          $cond: [
            { $gt: [maxBudgetUsd, 0] },
            { $lte: ["$tuitionFeeUsd", maxBudgetUsd] },
            false,
          ],
        },
        intakeMatch: {
          $cond: [
            { $gt: [{ $strLenCP: preferredIntake }, 0] },
            { $in: [preferredIntake, "$intakes"] },
            false,
          ],
        },
        ieltsMatch: { $gte: [ieltsScore, "$minimumIelts"] },
      },
    },
    {
      $addFields: {
        matchScore: {
          $add: [
            { $cond: ["$countryMatch", 35, 0] },
            { $cond: ["$fieldMatch", 30, 0] },
            { $cond: ["$withinBudget", 20, 0] },
            { $cond: ["$intakeMatch", 10, 0] },
            { $cond: ["$ieltsMatch", 5, 0] },
          ],
        },
        reasons: {
          $filter: {
            input: [
              {
                $cond: [
                  "$countryMatch",
                  { $concat: ["Preferred country match: ", "$country"] },
                  null,
                ],
              },
              {
                $cond: [
                  "$fieldMatch",
                  { $concat: ["Field alignment: ", "$field"] },
                  null,
                ],
              },
              { $cond: ["$withinBudget", "Within budget range", null] },
              {
                $cond: [
                  "$intakeMatch",
                  { $concat: ["Preferred intake available: ", preferredIntake] },
                  null,
                ],
              },
              {
                $cond: [
                  "$ieltsMatch",
                  "English test score meets requirement",
                  null,
                ],
              },
            ],
            as: "reason",
            cond: { $ne: ["$$reason", null] },
          },
        },
      },
    },
    { $match: { matchScore: { $gt: 0 } } },
    { $sort: { matchScore: -1, tuitionFeeUsd: 1 } },
    { $limit: 5 },
    {
      $project: {
        title: 1,
        universityName: 1,
        country: 1,
        city: 1,
        field: 1,
        degreeLevel: 1,
        tuitionFeeUsd: 1,
        intakes: 1,
        minimumIelts: 1,
        scholarshipAvailable: 1,
        stem: 1,
        matchScore: 1,
        reasons: 1,
      },
    },
  ]);

  return {
    data: {
      student: {
        id: student._id,
        fullName: student.fullName,
        targetCountries,
        interestedFields,
      },
      recommendations,
    },
    meta: {
      strategy: "mongodb-aggregation-weighted-score",
      count: recommendations.length,
    },
  };
}

module.exports = {
  buildProgramRecommendations,
};
