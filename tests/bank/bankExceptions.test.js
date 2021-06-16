const supertest = require("supertest");

const app = require("../../src/app");

const bankObject = {
  id: "BANCO_DO_BRASIL",
  name: "Banco do Brasil (001)",
};

describe("Testing responses when an unexpected error happen on bank routes", () => {
  test("Get bank should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .get("/bank/nope")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
    expect(resp.statusCode).toBe(500);
  });

  test("Create bank should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .post("/bank")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send(bankObject);
    expect(resp.statusCode).toBe(500);
  });

  test("Get banks should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .get("/banks")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(resp.statusCode).toBe(500);
  });

  test("Update bank should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .patch(`/bank/exception`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ name: "exception" });

    expect(resp.statusCode).toBe(500);
  });

  test("Get bank account types should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .get("/bank/RANDOM/accountTypes")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(resp.statusCode).toBe(500);
  });

  test("Delete bank should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .delete("/bank/RANDOM")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(resp.statusCode).toBe(500);
  });
});
