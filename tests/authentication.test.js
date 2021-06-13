const supertest = require("supertest");

const app = require("../src/app");

describe("Testing bearer authentication", () => {
  test("GET without using auth, should return status 401", async () => {
    const resp = await supertest(app).get("/");
    expect(resp.statusCode).toBe(401);
  });

  test("GET with bearer token, should return status 200", async () => {
    const resp = await supertest(app)
      .get("/")
      .set("Authorization", "Bearer test_token");
    expect(resp.statusCode).toBe(200);
  });
});
