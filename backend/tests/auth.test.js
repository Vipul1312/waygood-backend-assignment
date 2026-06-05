const request = require("supertest");

const app = require("../src/app");
const {
  connectTestDatabase,
  closeTestDatabase,
  clearCollections,
} = require("./setup");

beforeAll(connectTestDatabase);
afterEach(clearCollections);
afterAll(closeTestDatabase);

describe("Authentication flow", () => {
  const credentials = {
    fullName: "Test User",
    email: "test@example.com",
    password: "Candidate123!",
  };

  it("registers a new student and returns a token", async () => {
    const response = await request(app).post("/api/auth/register").send(credentials);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe(credentials.email);
  });

  it("rejects duplicate registration", async () => {
    await request(app).post("/api/auth/register").send(credentials);
    const response = await request(app).post("/api/auth/register").send(credentials);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("logs in with valid credentials and accesses a protected route", async () => {
    await request(app).post("/api/auth/register").send(credentials);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: credentials.password });

    expect(login.status).toBe(200);

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.data.token}`);

    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(credentials.email);
  });

  it("rejects login with a wrong password", async () => {
    await request(app).post("/api/auth/register").send(credentials);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "WrongPass123!" });

    expect(response.status).toBe(401);
  });
});
