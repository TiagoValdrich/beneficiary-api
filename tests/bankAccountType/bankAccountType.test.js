const supertest = require("supertest");

const app = require("../../src/app");
const database = require("../../src/database");
const helpers = require("../helpers");

const bankObject = {
  id: "BANCO_DO_BRASIL",
  name: "Banco do Brasil (001)",
};

const bankAccountTypeObject = {
  id: "",
  type: "CONTA_CORRENTE",
  bank_id: bankObject.id,
  name: "Conta Corrente",
};

beforeAll(async () => {
  await database.createInstance(true);
  // We need to wait a little bit more, for sequelize create all tables and relationships
  // before starting our tests
  await helpers.sleep(5000);
}, 10000);

describe("Testing bank account types routes", () => {
  test("GET nonexistent bank account type, should return status 404", async () => {
    const resp = await supertest(app)
      .get("/bankAccountType/nope")
      .set("Authorization", "Bearer test_token");
    expect(resp.statusCode).toBe(404);
  });

  test("Create valid bank account type, should return status 200", async () => {
    let resp = await supertest(app)
      .post("/bank")
      .set("Authorization", "Bearer test_token")
      .send(bankObject);
    expect(resp.statusCode).toBe(201);

    resp = await supertest(app)
      .post("/bankAccountType")
      .set("Authorization", "Bearer test_token")
      .send(bankAccountTypeObject);
    expect(resp.statusCode).toBe(201);

    bankAccountTypeObject.id = resp.body.id;
  });

  test("Creating a repeated bank account type, should return status 400", async () => {
    const resp = await supertest(app)
      .post("/bankAccountType")
      .set("Authorization", "Bearer test_token")
      .send(bankAccountTypeObject);
    expect(resp.statusCode).toBe(400);
    expect(resp.body.id).not.toBe(null);
  });

  test("Create bank with invalid params, should return status 400", async () => {
    let resp = await supertest(app)
      .post("/bankAccountType")
      .set("Authorization", "Bearer test_token")
      .send({});
    expect(resp.statusCode).toBe(400);

    resp = await supertest(app)
      .post("/bankAccountType")
      .set("Authorization", "Bearer test_token")
      .send({ type: "ACCOUNT_TYPE" });
    expect(resp.statusCode).toBe(400);

    resp = await supertest(app)
      .post("/bankAccountType")
      .set("Authorization", "Bearer test_token")
      .send({ name: "Conta Fictícia" });
    expect(resp.statusCode).toBe(400);

    resp = await supertest(app)
      .post("/bankAccountType")
      .set("Authorization", "Bearer test_token")
      .send({ bank_id: "BANK" });
    expect(resp.statusCode).toBe(400);
  });

  test("Get a bank account type by id, should return status 200 and a bank object", async () => {
    const resp = await supertest(app)
      .get(`/bankAccountType/${bankAccountTypeObject.id}`)
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(200);
    expect(resp.body.id).toBe(bankAccountTypeObject.id);
    expect(resp.body.name).toBe(bankAccountTypeObject.name);
    expect(resp.body.type).toBe(bankAccountTypeObject.type);
  });

  test("Get list of bank account types, should return status 200 with a list of banks", async () => {
    const resp = await supertest(app)
      .get("/bankAccountTypes")
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveLength(1);
  });

  test("Updating bank account type name, should return status 200 and modify it's name on database", async () => {
    const newBankAccounTypeName = "Conta Corrente Nova";

    let resp = await supertest(app)
      .patch(`/bankAccountType/${bankAccountTypeObject.id}`)
      .set("Authorization", "Bearer test_token")
      .send({ name: newBankAccounTypeName });

    expect(resp.statusCode).toBe(200);

    resp = await supertest(app)
      .get(`/bankAccountType/${bankAccountTypeObject.id}`)
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(200);
    expect(resp.body.name).toBe(newBankAccounTypeName);
  });

  test("Updating bank account type with a nonexistent bank, should return status 404", async () => {
    let resp = await supertest(app)
      .patch(`/bankAccountType/${bankAccountTypeObject.id}`)
      .set("Authorization", "Bearer test_token")
      .send({ bank_id: "NOPE" });

    expect(resp.statusCode).toBe(404);
  });

  test("Delete nonexistent bank account type, should return status 404", async () => {
    const resp = await supertest(app)
      .delete("/bankAccountType/RANDOM")
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(404);
  });

  test("Delete existent bank account type, should return status 200", async () => {
    const resp = await supertest(app)
      .delete(`/bankAccountType/${bankAccountTypeObject.id}`)
      .set("Authorization", "Bearer test_token");

    expect(resp.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await database.close();
});
