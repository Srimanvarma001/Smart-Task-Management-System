import request from "supertest";
import app from "../../src/app";
import { connectTestDB, disconnectTestDB } from "./setup";

beforeAll(connectTestDB);

afterAll(disconnectTestDB);

describe("POST /api/auth/register", () => {
  it("creates a user and returns a token (201)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ada Lovelace", email: "ada@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com" });
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("rejects a duplicate email with 409", async () => {
    const payload = { name: "Alan Turing", email: "alan@example.com", password: "password123" };
    await request(app).post("/api/auth/register").send(payload);

    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(409);
  });

  it("rejects an invalid payload (e.g. short password) with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "not-an-email", password: "short" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  const credentials = { email: "grace@example.com", password: "password123" };

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send({ name: "Grace Hopper", ...credentials });
  });

  it("returns a token on success (200)", async () => {
    const res = await request(app).post("/api/auth/login").send(credentials);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ name: "Grace Hopper", email: "grace@example.com" });
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("returns 401 with a generic message for a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: credentials.email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials" });
  });

  it("returns the same generic 401 message for a nonexistent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials" });
  });
});

describe("GET /api/auth/me", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Katherine Johnson", email: "katherine@example.com", password: "password123" });
    token = res.body.data.token;
  });

  it("returns the current user with a valid token (200)", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ name: "Katherine Johnson", email: "katherine@example.com" });
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("rejects requests without a token (401)", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });

  it("rejects a garbage token (401)", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
  });
});