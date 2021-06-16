const supertest = require("supertest");

const app = require("../../src/app");

const bankAccountTypeObject = {
  id: "",
  type: "CONTA_CORRENTE",
  bankId: "BANCO_DO_BRASIL",
  name: "Conta Corrente",
};

describe("Testing responses when an unexpected error happen on bank account types routes", () => {
  test("Get bank account type should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .get("/bankAccountType/nope")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
    expect(resp.statusCode).toBe(500);
  });

  test("Create bank account type should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .post("/bankAccountType")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send(bankAccountTypeObject);
    expect(resp.statusCode).toBe(500);
  });

  test("Get list of bank account types should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .get("/bankAccountTypes")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(resp.statusCode).toBe(500);
  });

  test("Updating bank account type should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .patch(`/bankAccountType/nope`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ name: "nice name" });
    expect(resp.statusCode).toBe(500);
  });

  test("Delete bank account type should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .delete("/bankAccountType/RANDOM")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(resp.statusCode).toBe(500);
  });
});
