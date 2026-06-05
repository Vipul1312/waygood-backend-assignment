const request = require("supertest");

const app = require("../src/app");
const Program = require("../src/models/Program");
const University = require("../src/models/University");
const {
  connectTestDatabase,
  closeTestDatabase,
  clearCollections,
} = require("./setup");

beforeAll(connectTestDatabase);
afterEach(clearCollections);
afterAll(closeTestDatabase);

async function setupStudentAndProgram() {
  const register = await request(app).post("/api/auth/register").send({
    fullName: "Applicant One",
    email: "applicant@example.com",
    password: "Candidate123!",
  });

  const token = register.body.data.token;

  const university = await University.create({
    name: "Test University",
    country: "Canada",
    city: "Toronto",
  });

  const program = await Program.create({
    university: university._id,
    universityName: "Test University",
    country: "Canada",
    city: "Toronto",
    title: "MSc Testing",
    field: "Computer Science",
    degreeLevel: "master",
    tuitionFeeUsd: 20000,
    intakes: ["September"],
    minimumIelts: 6.5,
  });

  return { token, program };
}

describe("Application workflow", () => {
  it("creates an application and prevents duplicates", async () => {
    const { token, program } = await setupStudentAndProgram();

    const first = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ programId: program._id, intake: "September" });

    expect(first.status).toBe(201);
    expect(first.body.data.status).toBe("draft");

    const duplicate = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ programId: program._id, intake: "September" });

    expect(duplicate.status).toBe(409);
  });

  it("enforces valid status transitions and rejects invalid ones", async () => {
    const { token, program } = await setupStudentAndProgram();

    const created = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ programId: program._id, intake: "September" });

    const applicationId = created.body.data._id;

    const valid = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "submitted" });

    expect(valid.status).toBe(200);
    expect(valid.body.data.timeline).toHaveLength(2);

    const invalid = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "enrolled" });

    expect(invalid.status).toBe(422);
  });

  it("rejects an intake that the program does not offer", async () => {
    const { token, program } = await setupStudentAndProgram();

    const response = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ programId: program._id, intake: "December" });

    expect(response.status).toBe(422);
  });
});
