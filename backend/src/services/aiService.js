const OpenAI = require("openai");

const env = require("../config/env");

function buildLocalPlan(student, recommendations) {
  const top = recommendations.slice(0, 3).map((program, index) => {
    return `${index + 1}. ${program.title} at ${program.universityName} (${program.country}) - tuition ${program.tuitionFeeUsd} USD, intake options ${program.intakes.join(", ")}.`;
  });

  return [
    `Study plan for ${student.fullName}:`,
    `Preferred destinations: ${student.targetCountries.join(", ") || "not set"}.`,
    `Fields of interest: ${student.interestedFields.join(", ") || "not set"}.`,
    "Shortlisted programs:",
    ...top,
    "Next steps: confirm budget, prepare IELTS to meet the highest required band, and submit applications before the earliest intake deadline.",
  ].join("\n");
}

async function generateStudyPlan(student, recommendations) {
  if (!env.openaiApiKey) {
    return {
      provider: "local",
      plan: buildLocalPlan(student, recommendations),
    };
  }

  const client = new OpenAI({ apiKey: env.openaiApiKey });

  const prompt = `Create a concise study-abroad action plan for a student named ${student.fullName}. Preferred countries: ${student.targetCountries.join(", ")}. Interested fields: ${student.interestedFields.join(", ")}. Budget: ${student.maxBudgetUsd} USD. Top matched programs: ${recommendations
    .map((program) => `${program.title} (${program.universityName}, ${program.country})`)
    .join("; ")}.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful study-abroad counselor." },
      { role: "user", content: prompt },
    ],
  });

  return {
    provider: "openai",
    plan: completion.choices[0].message.content,
  };
}

module.exports = {
  generateStudyPlan,
};
