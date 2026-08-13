import request from "supertest";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import app from "../../src/app";
import { config } from "../../src/config/env";
import { callDeepSeek } from "../../src/config/deepseek";
import * as aiService from "../../src/services/ai.service";
import { TaskModel } from "../../src/models/Task";
import { UserModel } from "../../src/models/User";
import { connectTestDB, disconnectTestDB } from "./setup";

jest.mock("../../src/config/deepseek", () => ({
  callDeepSeek: jest.fn(),
  DEEPSEEK_API_URL: "https://api.deepseek.com/chat/completions",
  DEEPSEEK_MODEL: "deepseek-v4-flash",
  DEEPSEEK_MAX_TOKENS: 500,
  DEEPSEEK_TIMEOUT_MS: 15_000,
}));

const mockedCallDeepSeek = callDeepSeek as jest.MockedFunction<typeof callDeepSeek>;

beforeAll(connectTestDB);

afterAll(disconnectTestDB);

beforeEach(() => {
  mockedCallDeepSeek.mockReset();
  mockedCallDeepSeek.mockImplementation((messages) => {
    const system = typeof messages[0].content === "string" ? messages[0].content : "";
    const last = messages[messages.length - 1];
    const content = typeof last.content === "string" ? last.content.toLowerCase() : "";
    if (system.includes("prioritization")) {
      if (content.includes("high")) return Promise.resolve("High");
      if (content.includes("low")) return Promise.resolve("Low");
      return Promise.resolve("Medium");
    }
    return Promise.resolve(JSON.stringify(["work", "urgent-followup"]));
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const PASSWORD = "password123";
const NONEXISTENT_ID = new Types.ObjectId().toString();

let userSeq = 0;

interface TestUser {
  id: string;
  token: string;
}

interface TaskFixture {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  userId: string;
}

async function registerAndLogin(name: string): Promise<TestUser> {
  userSeq += 1;
  const email = `${name}-${userSeq}-${Date.now()}@task-test.com`;

  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ name, email, password: PASSWORD });
  expect(registerRes.status).toBe(201);

  const loginRes = await request(app).post("/api/auth/login").send({ email, password: PASSWORD });
  expect(loginRes.status).toBe(200);

  const { user, token } = loginRes.body.data as { user: { id: string }; token: string };
  return { id: user.id, token };
}

async function createTask(
  token: string,
  title: string,
  overrides: Record<string, unknown> = {},
): Promise<TaskFixture> {
  const res = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({ title, ...overrides });

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  return res.body.data as TaskFixture;
}

describe("POST /api/tasks", () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await registerAndLogin("post-owner");
  });

  it("creates a task for the authenticated user (201)", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        title: "Finish report",
        description: "Quarterly report",
        dueDate: "2026-09-01",
        priority: "high",
        category: "work",
        tags: ["report", "finance"],
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: "Finish report",
      description: "Quarterly report",
      status: "pending",
      priority: "medium",
      category: "work",
      tags: ["work", "urgent-followup"],
      aiGenerated: false,
      userId: user.id,
    });
  });

  it("rejects a request without a title with 400", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ priority: "high" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("infers a valid priority server-side when the client sends none", async () => {
    mockedCallDeepSeek.mockImplementationOnce(() => Promise.resolve("High"));

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Urgent deadline", description: "Ship the release before noon" });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ title: "Urgent deadline", priority: "high" });
  });

  it("still creates the task with Medium priority when the AI call fails", async () => {
    mockedCallDeepSeek.mockRejectedValueOnce(new Error("AI service unavailable: timeout"));

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Survives AI failure" });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ title: "Survives AI failure", priority: "medium" });
  });

  it("reuses the AI-parsed priority on create without a second inference call", async () => {
    const inferPrioritySpy = jest.spyOn(aiService, "inferPriority");

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Buy groceries", priority: "low", aiGenerated: true });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ title: "Buy groceries", priority: "low", aiGenerated: true });
    expect(inferPrioritySpy).not.toHaveBeenCalled();
  });

  it("re-infers priority server-side for a manual create even if a priority is sent", async () => {
    const inferPrioritySpy = jest.spyOn(aiService, "inferPriority");

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Manual entry task", priority: "high" });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ title: "Manual entry task", priority: "medium" });
    expect(inferPrioritySpy).toHaveBeenCalledTimes(1);
  });

  it("falls back to server inference when the AI-parse priority is missing", async () => {
    const inferPrioritySpy = jest.spyOn(aiService, "inferPriority");

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "High urgency cleanup", aiGenerated: true });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ title: "High urgency cleanup", priority: "high" });
    expect(inferPrioritySpy).toHaveBeenCalledTimes(1);
  });

  it("falls back to server inference when the AI-parse priority is invalid", async () => {
    const inferPrioritySpy = jest.spyOn(aiService, "inferPriority");

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Ambiguous errand", priority: "sometime", aiGenerated: true });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ title: "Ambiguous errand", priority: "medium" });
    expect(inferPrioritySpy).toHaveBeenCalledTimes(1);
  });

  it("uses server-inferred tags for a manual create, ignoring client-sent tags", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Buy groceries", tags: ["client-supplied"] });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: "Buy groceries",
      tags: ["work", "urgent-followup"],
    });
  });

  it("infers tags server-side for an AI-parsed create, ignoring client-sent tags", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Buy groceries", priority: "low", aiGenerated: true, tags: ["client-supplied"] });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      title: "Buy groceries",
      priority: "low",
      aiGenerated: true,
      tags: ["work", "urgent-followup"],
    });
  });

  it("still creates the task with empty tags when tag inference fails", async () => {
    mockedCallDeepSeek.mockImplementationOnce(() => Promise.resolve("High"));
    mockedCallDeepSeek.mockImplementationOnce(() =>
      Promise.reject(new Error("AI service unavailable: timeout")),
    );

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "No tags today" });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ title: "No tags today", tags: [] });
  });
});

describe("GET /api/tasks", () => {
  describe("user isolation", () => {
    let userA: TestUser;
    let userB: TestUser;

    beforeAll(async () => {
      userA = await registerAndLogin("isolation-a");
      userB = await registerAndLogin("isolation-b");

      await createTask(userA.token, "A task 1");
      await createTask(userA.token, "A task 2", { status: "completed" });
      await createTask(userB.token, "B task 1");
    });

    it("user A only sees their own tasks", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.tasks).toHaveLength(2);
      expect(res.body.data.tasks.every((task: TaskFixture) => task.userId === userA.id)).toBe(true);
      expect(
        res.body.data.tasks
          .map((task: TaskFixture) => task.title)
          .sort(),
      ).toEqual(["A task 1", "A task 2"]);
    });

    it("user B only sees their own tasks", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${userB.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.tasks).toHaveLength(1);
      expect(res.body.data.tasks[0]).toMatchObject({ title: "B task 1", userId: userB.id });
    });
  });

  describe("filters", () => {
    let user: TestUser;

    beforeAll(async () => {
      user = await registerAndLogin("filter-owner");
      await createTask(user.token, "Pending high", { status: "pending", priority: "high" });
      await createTask(user.token, "Pending low", { status: "pending", priority: "low" });
      const completed = await createTask(user.token, "Completed medium", {
        priority: "medium",
        category: "work",
      });
      await request(app)
        .patch(`/api/tasks/${completed._id}/status`)
        .set("Authorization", `Bearer ${user.token}`);
    });

    it("filters by status", async () => {
      const pending = await request(app)
        .get("/api/tasks")
        .query({ status: "pending" })
        .set("Authorization", `Bearer ${user.token}`);
      expect(pending.status).toBe(200);
      expect(pending.body.data.total).toBe(2);

      const completed = await request(app)
        .get("/api/tasks")
        .query({ status: "completed" })
        .set("Authorization", `Bearer ${user.token}`);
      expect(completed.status).toBe(200);
      expect(completed.body.data.total).toBe(1);
      expect(completed.body.data.tasks[0].title).toBe("Completed medium");
    });

    it("filters by priority", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .query({ priority: "high" })
        .set("Authorization", `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.tasks[0].title).toBe("Pending high");
    });
  });

  describe("search", () => {
    let user: TestUser;

    beforeAll(async () => {
      user = await registerAndLogin("search-owner");
      await createTask(user.token, "Buy groceries");
      await createTask(user.token, "Walk the dog");
      await createTask(user.token, "Read a book");
    });

    it("matches the title with a substring search", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .query({ search: "dog" })
        .set("Authorization", `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.tasks[0].title).toBe("Walk the dog");
    });

    it("returns nothing when no title matches", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .query({ search: "zebra" })
        .set("Authorization", `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.tasks).toHaveLength(0);
    });
  });

  describe("date range", () => {
    let user: TestUser;
    let otherId: string;

    beforeAll(async () => {
      const dbUser = await UserModel.create({
        name: "daterange-owner",
        email: `daterange-owner-${Date.now()}@task-test.com`,
        passwordHash: "not-used",
      });
      user = {
        id: dbUser.id,
        token: jwt.sign({ id: dbUser.id }, config.jwtSecret),
      };

      const otherUser = await UserModel.create({
        name: "daterange-other",
        email: `daterange-other-${Date.now()}@task-test.com`,
        passwordHash: "not-used",
      });
      otherId = otherUser.id;

      await createTask(user.token, "July task 1", { dueDate: "2026-07-05" });
      await createTask(user.token, "July task 2", { dueDate: "2026-07-20" });
      await createTask(user.token, "August task", { dueDate: "2026-08-10" });
      await createTask(user.token, "No due date");
      await TaskModel.create({
        userId: otherUser._id,
        title: "Other July task",
        dueDate: new Date("2026-07-15"),
        priority: "medium",
        status: "pending",
        tags: [],
      });
    });

    it("returns only tasks whose dueDate falls within the range", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .query({ dueDateFrom: "2026-07-01", dueDateTo: "2026-07-31" })
        .set("Authorization", `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(2);
      expect(
        res.body.data.tasks
          .map((task: TaskFixture) => task.title)
          .sort(),
      ).toEqual(["July task 1", "July task 2"]);
    });

    it("returns an empty array when no tasks fall within the range", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .query({ dueDateFrom: "2027-01-01", dueDateTo: "2027-01-31" })
        .set("Authorization", `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.tasks).toEqual([]);
    });

    it("does not leak other users' tasks in the same date range", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .query({ dueDateFrom: "2026-07-01", dueDateTo: "2026-07-31" })
        .set("Authorization", `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(
        res.body.data.tasks
          .map((task: TaskFixture) => task.title)
          .sort(),
      ).toEqual(["July task 1", "July task 2"]);
      expect(res.body.data.tasks.every((task: TaskFixture) => task.userId === user.id)).toBe(true);
      expect(res.body.data.tasks.some((task: TaskFixture) => task.userId === otherId)).toBe(false);
    });

    it("returns every match in one response when a date range is active", async () => {
      await TaskModel.insertMany(
        Array.from({ length: 12 }, (_, i) => ({
          userId: new Types.ObjectId(user.id),
          title: `September task ${i + 1}`,
          dueDate: new Date("2026-09-15"),
          priority: "medium" as const,
          status: "pending" as const,
          tags: [],
        })),
      );

      const res = await request(app)
        .get("/api/tasks")
        .query({ dueDateFrom: "2026-09-01", dueDateTo: "2026-09-30" })
        .set("Authorization", `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(12);
      expect(res.body.data.tasks).toHaveLength(12);
      expect(res.body.data.tasks.every((task: TaskFixture) => task.userId === user.id)).toBe(true);
    });
  });

  describe("pagination", () => {
    let user: TestUser;

    beforeAll(async () => {
      user = await registerAndLogin("pagination-owner");
      for (let i = 1; i <= 5; i += 1) {
        await createTask(user.token, `Page task ${i}`);
      }
    });

    it("returns the correct totals with defaults", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${user.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ total: 5, page: 1, totalPages: 1 });
      expect(res.body.data.tasks).toHaveLength(5);
    });

    it("paginates with limit and reports correct totals", async () => {
      const page1 = await request(app)
        .get("/api/tasks")
        .query({ page: 1, limit: 2 })
        .set("Authorization", `Bearer ${user.token}`);

      expect(page1.status).toBe(200);
      expect(page1.body.data).toMatchObject({ total: 5, page: 1, totalPages: 3 });
      expect(page1.body.data.tasks).toHaveLength(2);

      const page2 = await request(app)
        .get("/api/tasks")
        .query({ page: 2, limit: 2 })
        .set("Authorization", `Bearer ${user.token}`);

      expect(page2.status).toBe(200);
      expect(page2.body.data).toMatchObject({ total: 5, page: 2, totalPages: 3 });
      expect(page2.body.data.tasks).toHaveLength(2);

      const page3 = await request(app)
        .get("/api/tasks")
        .query({ page: 3, limit: 2 })
        .set("Authorization", `Bearer ${user.token}`);

      expect(page3.status).toBe(200);
      expect(page3.body.data).toMatchObject({ total: 5, page: 3, totalPages: 3 });
      expect(page3.body.data.tasks).toHaveLength(1);
    });
  });
});

describe("single task operations (GET/PUT/PATCH/DELETE /tasks/:id)", () => {
  let owner: TestUser;
  let other: TestUser;

  beforeAll(async () => {
    owner = await registerAndLogin("single-owner");
    other = await registerAndLogin("single-other");
  });

  describe("GET /api/tasks/:id", () => {
    let ownTask: TaskFixture;

    beforeAll(async () => {
      ownTask = await createTask(owner.token, "Own readable task");
    });

    it("returns the owner's task (200)", async () => {
      const res = await request(app)
        .get(`/api/tasks/${ownTask._id}`)
        .set("Authorization", `Bearer ${owner.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ _id: ownTask._id, title: "Own readable task" });
    });

    it("returns 404 (not 403) for another user's task", async () => {
      const res = await request(app)
        .get(`/api/tasks/${ownTask._id}`)
        .set("Authorization", `Bearer ${other.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Task not found" });
    });

    it("returns 404 for a nonexistent id", async () => {
      const res = await request(app)
        .get(`/api/tasks/${NONEXISTENT_ID}`)
        .set("Authorization", `Bearer ${owner.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Task not found" });
    });
  });

  describe("PUT /api/tasks/:id", () => {
    let ownTask: TaskFixture;

    beforeAll(async () => {
      ownTask = await createTask(owner.token, "Task to update");
    });

    it("updates the owner's task (200)", async () => {
      const res = await request(app)
        .put(`/api/tasks/${ownTask._id}`)
        .set("Authorization", `Bearer ${owner.token}`)
        .send({ title: "Updated title", priority: "high" });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        _id: ownTask._id,
        title: "Updated title",
        priority: "high",
      });
    });

    it("returns 404 (not 403) for another user's task", async () => {
      const res = await request(app)
        .put(`/api/tasks/${ownTask._id}`)
        .set("Authorization", `Bearer ${other.token}`)
        .send({ title: "Hijack attempt" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Task not found" });
    });

    it("returns 404 for a nonexistent id", async () => {
      const res = await request(app)
        .put(`/api/tasks/${NONEXISTENT_ID}`)
        .set("Authorization", `Bearer ${owner.token}`)
        .send({ title: "Nowhere" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Task not found" });
    });
  });

  describe("PATCH /api/tasks/:id/status", () => {
    let pendingTask: TaskFixture;
    let completedTask: TaskFixture;

    beforeAll(async () => {
      pendingTask = await createTask(owner.token, "Starts pending");
      completedTask = await createTask(owner.token, "Starts completed");
      await request(app)
        .patch(`/api/tasks/${completedTask._id}/status`)
        .set("Authorization", `Bearer ${owner.token}`);
    });

    it("flips pending to completed", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${pendingTask._id}/status`)
        .set("Authorization", `Bearer ${owner.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("completed");
    });

    it("flips completed back to pending", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${completedTask._id}/status`)
        .set("Authorization", `Bearer ${owner.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("pending");
    });

    it("returns 404 (not 403) for another user's task", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${pendingTask._id}/status`)
        .set("Authorization", `Bearer ${other.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Task not found" });
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    let ownTask: TaskFixture;

    beforeAll(async () => {
      ownTask = await createTask(owner.token, "Task to delete");
    });

    it("deletes the owner's task (200) and it is gone afterwards", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${ownTask._id}`)
        .set("Authorization", `Bearer ${owner.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ message: "Task deleted" });

      const gone = await request(app)
        .get(`/api/tasks/${ownTask._id}`)
        .set("Authorization", `Bearer ${owner.token}`);

      expect(gone.status).toBe(404);
    });

    it("returns 404 (not 403) for another user's task", async () => {
      const otherTask = await createTask(other.token, "Other's task");
      const res = await request(app)
        .delete(`/api/tasks/${otherTask._id}`)
        .set("Authorization", `Bearer ${owner.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Task not found" });
    });

    it("returns 404 for a nonexistent id", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${NONEXISTENT_ID}`)
        .set("Authorization", `Bearer ${owner.token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Task not found" });
    });
  });
});

describe("GET /api/tasks/stats", () => {
  let userA: TestUser;
  let userB: TestUser;

  beforeAll(async () => {
    userA = await registerAndLogin("stats-a");
    userB = await registerAndLogin("stats-b");
  });

  it("returns zeroed stats when the user has no tasks", async () => {
    const res = await request(app)
      .get("/api/tasks/stats")
      .set("Authorization", `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      byPriority: { high: 0, medium: 0, low: 0 },
      completionRate: 0,
      recentActivity: [],
      upcomingDeadlines: [],
      categoryBreakdown: [],
      weeklyTrend: { completedThisWeek: 0 },
    });
  });

  it("reports total, completed, pending, overdue, byPriority and completionRate", async () => {
    const pendingHigh = await createTask(userA.token, "Pending high", {
      priority: "high",
      dueDate: "2030-01-01",
    });
    const overduePending = await createTask(userA.token, "Overdue pending", {
      priority: "low",
      dueDate: "2020-01-01",
    });
    const doneHigh = await createTask(userA.token, "Done high", { priority: "high" });
    const doneMedium = await createTask(userA.token, "Done medium", { priority: "medium" });
    const doneMedium2 = await createTask(userA.token, "Done medium 2", { priority: "medium" });
    const doneLow = await createTask(userA.token, "Done low", { priority: "low" });

    for (const task of [doneHigh, doneMedium, doneMedium2, doneLow]) {
      const patch = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set("Authorization", `Bearer ${userA.token}`);
      expect(patch.status).toBe(200);
    }

    const res = await request(app)
      .get("/api/tasks/stats")
      .set("Authorization", `Bearer ${userA.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      total: 6,
      completed: 4,
      pending: 2,
      overdue: 1,
      byPriority: { high: 2, medium: 3, low: 1 },
      completionRate: 67,
      upcomingDeadlines: [
        {
          id: pendingHigh._id,
          title: "Pending high",
          dueDate: "2030-01-01T00:00:00.000Z",
          priority: "high",
        },
      ],
      categoryBreakdown: [{ category: "Uncategorized", count: 6 }],
      weeklyTrend: { completedThisWeek: 4 },
      recentActivity: expect.any(Array),
    });

    expect(res.body.data.recentActivity).toHaveLength(5);
    expect(
      res.body.data.recentActivity
        .map((item: { title: string }) => item.title)
        .sort(),
    ).toEqual(["Done high", "Done low", "Done medium", "Done medium 2", "Overdue pending"]);
    for (const item of res.body.data.recentActivity) {
      expect(item).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          status: expect.stringMatching(/^(pending|completed)$/),
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }),
      );
    }
    expect(
      res.body.data.recentActivity.every(
        (item: { timestamp: string }, index: number, arr: Array<{ timestamp: string }>) =>
          index === 0 || new Date(arr[index - 1].timestamp).getTime() >= new Date(item.timestamp).getTime(),
      ),
    ).toBe(true);
  });

  it("scopes stats to the authenticated user only", async () => {
    const bCompleted = await createTask(userB.token, "B completed", { priority: "high" });
    await request(app)
      .patch(`/api/tasks/${bCompleted._id}/status`)
      .set("Authorization", `Bearer ${userB.token}`);
    await createTask(userB.token, "B pending", { priority: "low" });
    await createTask(userB.token, "B overdue", { priority: "low", dueDate: "2020-01-01" });

    const aRes = await request(app)
      .get("/api/tasks/stats")
      .set("Authorization", `Bearer ${userA.token}`);

    expect(aRes.status).toBe(200);
    expect(aRes.body.data).toMatchObject({
      total: 6,
      completed: 4,
      pending: 2,
      overdue: 1,
      byPriority: { high: 2, medium: 3, low: 1 },
      completionRate: 67,
    });
    expect(aRes.body.data.recentActivity).toHaveLength(5);
    expect(aRes.body.data.recentActivity.every(
      (item: { title: string }) =>
        ["Done high", "Done low", "Done medium", "Done medium 2", "Overdue pending"].includes(item.title),
    )).toBe(true);
    expect(aRes.body.data.upcomingDeadlines).toHaveLength(1);
    expect(aRes.body.data.upcomingDeadlines[0]).toMatchObject({
      title: "Pending high",
      dueDate: "2030-01-01T00:00:00.000Z",
      priority: "high",
    });
    expect(aRes.body.data.categoryBreakdown).toEqual([{ category: "Uncategorized", count: 6 }]);
    expect(aRes.body.data.weeklyTrend).toEqual({ completedThisWeek: 4 });

    const bRes = await request(app)
      .get("/api/tasks/stats")
      .set("Authorization", `Bearer ${userB.token}`);

    expect(bRes.status).toBe(200);
    expect(bRes.body.data).toMatchObject({
      total: 3,
      completed: 1,
      pending: 2,
      overdue: 1,
      byPriority: { high: 0, medium: 3, low: 0 },
      completionRate: 33,
    });
    expect(
      bRes.body.data.recentActivity
        .map((item: { title: string }) => item.title)
        .sort(),
    ).toEqual(["B completed", "B overdue", "B pending"]);
    expect(bRes.body.data.upcomingDeadlines).toEqual([]);
    expect(bRes.body.data.categoryBreakdown).toEqual([{ category: "Uncategorized", count: 3 }]);
    expect(bRes.body.data.weeklyTrend).toEqual({ completedThisWeek: 1 });
  });
});

describe("task routes require authentication", () => {
  it.each([
    { label: "POST /api/tasks", req: request(app).post("/api/tasks").send({ title: "x" }) },
    { label: "GET /api/tasks", req: request(app).get("/api/tasks") },
    { label: "GET /api/tasks/:id", req: request(app).get(`/api/tasks/${NONEXISTENT_ID}`) },
    { label: "PUT /api/tasks/:id", req: request(app).put(`/api/tasks/${NONEXISTENT_ID}`).send({ title: "x" }) },
    {
      label: "PATCH /api/tasks/:id/status",
      req: request(app).patch(`/api/tasks/${NONEXISTENT_ID}/status`),
    },
    { label: "DELETE /api/tasks/:id", req: request(app).delete(`/api/tasks/${NONEXISTENT_ID}`) },
  ])("rejects $label without a token (401)", async ({ req }) => {
    const res = await req;

    expect(res.status).toBe(401);
  });
});