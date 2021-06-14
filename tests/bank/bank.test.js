const supertest = require("supertest");

const app = require("../../src/app");
const database = require("../../src/database");
const helpers = require("../helpers");

const bankObject = {
  id: "BANCO_DO_BRASIL",
  name: "Banco do Brasil (001)",
};

beforeAll(async () => {
  await database.createInstance(true);
  // We need to wait a little bit more, for sequelize create all tables and relationships
  // before starting our tests
  await helpers.sleep(5000);
}, 10000);

describe("Testing Bank routes", () => {
  test("Get a nonexistent bank, should return status 404", async () => {
    const resp = await supertest(app)
      .get("/bank/nope")
      .set("Authorization", "Bearer test_token");
    expect(resp.statusCode).toBe(404);
  });

  test("Create valid bank, should return status 200", async () => {
    const resp = await supertest(app)
      .post("/bank")
      .set("Authorization", "Bearer test_token")
      .send(bankObject);
    expect(resp.statusCode).toBe(201);
  });

  test("Create repeated bank, should return status 400", async () => {
    const resp = await supertest(app)
      .post("/bank")
      .set("Authorization", "Bearer test_token")
      .send(bankObject);
    expect(resp.statusCode).toBe(400);
  });

  test("Create bank with invalid params, should return status 400", async () => {
    let resp = await supertest(app)
      .post("/bank")
      .set("Authorization", "Bearer test_token")
      .send({});
    expect(resp.statusCode).toBe(400);

    resp = await supertest(app)
      .post("/bank")
      .set("Authorization", "Bearer test_token")
      .send({ id: "BANK" });
    expect(resp.statusCode).toBe(400);

    resp = await supertest(app)
      .post("/bank")
      .set("Authorization", "Bearer test_token")
      .send({ name: "Banco" });
    expect(resp.statusCode).toBe(400);
  });

  test("Get bank with id BANCO_DO_BRASIL, should return status 200 and a bank object", async () => {
    const resp = await supertest(app)
      .get(`/bank/${bankObject.id}`)
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(200);
    expect(resp.body.id).toBe(bankObject.id);
    expect(resp.body.name).toBe(bankObject.name);
  });

  test("Get banks, should return status 200 with a list of banks", async () => {
    const resp = await supertest(app)
      .get("/banks")
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveLength(1);
  });

  test("Update bank name with id BANCO_DO_BRASIL, should return status 200 and modify it's name on database", async () => {
    const newBankName = "Banco do Brasil";

    let resp = await supertest(app)
      .patch(`/bank/${bankObject.id}`)
      .set("Authorization", "Bearer test_token")
      .send({ name: newBankName });

    expect(resp.statusCode).toBe(200);

    resp = await supertest(app)
      .get(`/bank/${bankObject.id}`)
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(200);
    expect(resp.body.name).toBe(newBankName);
  });

  test("Delete nonexistent bank, should return status 404", async () => {
    const resp = await supertest(app)
      .delete("/bank/RANDOM")
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(404);
  });

  test("Delete existent bank(BANCO_DO_BRASIL), should return status 200", async () => {
    const resp = await supertest(app)
      .delete(`/bank/${bankObject.id}`)
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await database.close();
});