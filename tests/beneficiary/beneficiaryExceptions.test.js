const supertest = require("supertest");

const app = require("../../src/app");

const baseBeneficiaryObj = {
  name: "Ronaldo Silva Pereira",
  email: "ronaldo.pereira@gmail.com",
  document: "53902371021",
  documentType: "CPF",
  agencyNumber: "0001",
  agencyDigit: null,
  accountNumber: "123456",
  accountDigit: "1",
  bankId: "BANCO_DO_BRASIL",
  bankAccountTypeId: "1",
};

describe("Testing responses when an unexpected error happen on beneficiary routes", () => {
  test("Get beneficiary should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .get("/beneficiary/nope")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
    expect(resp.statusCode).toBe(500);
  });

  test("Create beneficiary should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .post("/beneficiary")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send(baseBeneficiaryObj);
    expect(resp.statusCode).toBe(500);
  });

  test("Get list of beneficiaries should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .get("/beneficiaries")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

    expect(resp.statusCode).toBe(500);
  });

  test("Updating beneficiary should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .patch(`/beneficiary/nope`)
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ name: "Vladmir" });
    expect(resp.statusCode).toBe(500);
  });

  test("Delete beneficiary should return status 500 when an unexpected error happen", async () => {
    const resp = await supertest(app)
      .delete("/beneficiaries")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ ids: ["nope"] });

    expect(resp.statusCode).toBe(500);
  });
});
