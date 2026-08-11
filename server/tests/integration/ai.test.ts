import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../src/app";
import { TaskModel } from "../../src/models/Task";
import { callDeepSeek, DEEPSEEK_API_URL } from "../../src/config/deepseek";
import { config } from "../../src/config/env";
import { AppError } from "../../src/utils/AppError";

jest.mock("../../src/config/deepseek", () => ({
  callDeepSeek: jest.fn(),
  DEEPSEEK_API_URL: "https://api.deepseek.com/chat/completions",
  DEEPSEEK_MODEL: "deepseek-v4-flash",
  DEEPSEEK_MAX_TOKENS: 300,
  DEEPSEEK_TIMEOUT_MS: 15_000,
}));

const mockedCallDeepSeek = callDeepSeek as jest.MockedFunction<typeof callDeepSeek>;
const fetchSpy = jest.spyOn(globalThis, "fetch");

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  config.deepseekApiKey = "";
  delete process.env.DEEPSEEK_API_KEY;

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();

  const deepSeekCalls = fetchSpy.mock.calls.filter(
    ([url]) => typeof url === "string" && url.includes("deepseek.com"),
  );
  expect(deepSeekCalls).toHaveLength(0);
});

beforeEach(() => {
  mockedCallDeepSeek.mockReset();
});

async function registerUser(name: string) {
  const unique = Math.random().toString(36).slice(2, 10);
  const res = await request(app).post("/api/auth/register").send({
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}.${unique}@example.com`,
    password: "password123",
  });
  expect(res.status).toBe(201);
  return { token: res.body.data.token as string, userId: res.body.data.user.id as string };
}

async function createOpenTask(userId: string, title: string) {
  await TaskModel.create({ userId: new mongoose.Types.ObjectId(userId), title });
}

describe("POST /api/ai/parse", () => {
  it("returns parsed fields from a mocked DeepSeek response (200)", async () => {
    const { token } = await registerUser("Parse Ada");
    mockedCallDeepSeek.mockResolvedValue(
      JSON.stringify({
        title: "Buy groceries",
        dueDate: "2026-08-15T10:00:00.000Z",
        priority: "high",
        category: "errands",
      }),
    );

    const res = await request(app)
      .post("/api/ai/parse")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Buy groceries tomorrow morning" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      title: "Buy groceries",
      dueDate: "2026-08-15T10:00:00.000Z",
      priority: "high",
      category: "errands",
    });
    expect(mockedCallDeepSeek).toHaveBeenCalledTimes(1);
    const [messages] = mockedCallDeepSeek.mock.calls[0];
    expect(messages[0].role).toBe("system");
    expect(messages[1]).toEqual({ role: "user", content: "Buy groceries tomorrow morning" });
  });

  it("returns a clean 502 (not a crash) when the model returns malformed JSON", async () => {
    const { token } = await registerUser("Parse Bjorne");
    mockedCallDeepSeek.mockResolvedValue("this is not json {");

    const res = await request(app)
      .post("/api/ai/parse")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Write a report" });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "AI returned malformed JSON" });
    expect(res.body.error).not.toBe("Internal server error");
  });

  it.each([{}, { text: "" }, { text: "   " }])("rejects missing/empty text with 400 for body %j", async (body) => {
    const { token } = await registerUser("Parse Empty");

    const res = await request(app)
      .post("/api/ai/parse")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "text is required" });
    expect(mockedCallDeepSeek).not.toHaveBeenCalled();
  });
});

describe("GET /api/ai/summary", () => {
  it("returns a summary from a mocked DeepSeek response (200)", async () => {
    const { token, userId } = await registerUser("Summary Ada");
    await createOpenTask(userId, "Finish report");
    mockedCallDeepSeek.mockResolvedValue(
      JSON.stringify({ summary: "You have 1 open task.", flags: ["Overdue"] }),
    );

    const res = await request(app)
      .get("/api/ai/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ summary: "You have 1 open task.", flags: ["Overdue"] });
    expect(mockedCallDeepSeek).toHaveBeenCalledTimes(1);
  });

  it("serves the second call from cache without calling the mock again", async () => {
    const { token, userId } = await registerUser("Summary Cache");
    await createOpenTask(userId, "Cache me");
    mockedCallDeepSeek.mockResolvedValue(JSON.stringify({ summary: "Cached summary.", flags: [] }));

    const first = await request(app).get("/api/ai/summary").set("Authorization", `Bearer ${token}`);
    expect(first.status).toBe(200);

    const second = await request(app).get("/api/ai/summary").set("Authorization", `Bearer ${token}`);

    expect(second.status).toBe(200);
    expect(second.body.data).toEqual({ summary: "Cached summary.", flags: [] });
    expect(mockedCallDeepSeek).toHaveBeenCalledTimes(1);
  });

  it("returns a graceful 502 (not 500) when the AI call fails", async () => {
    const { token, userId } = await registerUser("Summary Fail");
    await createOpenTask(userId, "Doomed task");
    mockedCallDeepSeek.mockRejectedValue(new AppError(502, "AI service unavailable: network down"));

    const res = await request(app)
      .get("/api/ai/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "AI service unavailable: network down" });
  });
});

describe("GET /api/ai/suggestions", () => {
  it("returns suggestions from a mocked DeepSeek response (200)", async () => {
    const { token, userId } = await registerUser("Suggest Ada");
    await createOpenTask(userId, "Ship feature");
    mockedCallDeepSeek.mockResolvedValue(
      JSON.stringify([{ title: "Ship feature", reason: "Due soon" }]),
    );

    const res = await request(app)
      .get("/api/ai/suggestions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([{ title: "Ship feature", reason: "Due soon" }]);
    expect(mockedCallDeepSeek).toHaveBeenCalledTimes(1);
  });

  it("serves the second call from cache without calling the mock again", async () => {
    const { token, userId } = await registerUser("Suggest Cache");
    await createOpenTask(userId, "Cache suggestion");
    mockedCallDeepSeek.mockResolvedValue(
      JSON.stringify([{ title: "Cache suggestion", reason: "Top priority" }]),
    );

    const first = await request(app).get("/api/ai/suggestions").set("Authorization", `Bearer ${token}`);
    expect(first.status).toBe(200);

    const second = await request(app)
      .get("/api/ai/suggestions")
      .set("Authorization", `Bearer ${token}`);

    expect(second.status).toBe(200);
    expect(second.body.data).toEqual([{ title: "Cache suggestion", reason: "Top priority" }]);
    expect(mockedCallDeepSeek).toHaveBeenCalledTimes(1);
  });

  it("returns a graceful 502 (not 500) when the AI call fails", async () => {
    const { token, userId } = await registerUser("Suggest Fail");
    await createOpenTask(userId, "Doomed suggestion");
    mockedCallDeepSeek.mockRejectedValue(new AppError(502, "AI service unavailable: timeout"));

    const res = await request(app)
      .get("/api/ai/suggestions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "AI service unavailable: timeout" });
  });
});

describe("authentication guard on AI routes", () => {
  it("POST /api/ai/parse returns 401 without a valid token", async () => {
    const res = await request(app).post("/api/ai/parse").send({ text: "ignored" });

    expect(res.status).toBe(401);
    expect(mockedCallDeepSeek).not.toHaveBeenCalled();
  });

  it("GET /api/ai/summary returns 401 without a valid token", async () => {
    const res = await request(app).get("/api/ai/summary");

    expect(res.status).toBe(401);
    expect(mockedCallDeepSeek).not.toHaveBeenCalled();
  });

  it("GET /api/ai/suggestions returns 401 without a valid token", async () => {
    const res = await request(app).get("/api/ai/suggestions");

    expect(res.status).toBe(401);
    expect(mockedCallDeepSeek).not.toHaveBeenCalled();
  });
});