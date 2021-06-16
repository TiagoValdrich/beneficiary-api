const supertest = require("supertest");
const documentHelper = require("cpf-cnpj-validator");

const app = require("../../src/app");
const database = require("../../src/database");
const helpers = require("../helpers");

const bancoDoBrasilObject = {
  id: "BANCO_DO_BRASIL",
  name: "Banco do Brasil (001)",
};

const randomBankObject = {
  id: "RANDOM_BANK",
  name: "Random Bank (678)",
};

const bancoDoBrasilAccountTypeObject = {
  id: "",
  type: "CONTA_CORRENTE",
  bankId: bancoDoBrasilObject.id,
  name: "Conta Corrente",
};

const bancoDoBrasilWrongAccountTypeObject = {
  id: "",
  type: "CONTA_IMAGINARIA",
  bankId: bancoDoBrasilObject.id,
  name: "Conta Imaginária",
};

const randomBankAccountTypeObject = {
  id: "",
  type: "CONTA_POUPANCA",
  bankId: randomBankObject.id,
  name: "Conta Poupança",
};

const baseBeneficiaryObj = {
  name: "Ronaldo Silva Pereira",
  email: "ronaldo.pereira@gmail.com",
  document: documentHelper.cpf.generate(),
  documentType: "CPF",
  agencyNumber: "0001",
  agencyDigit: null,
  accountNumber: "123456",
  accountDigit: "1",
  bankId: "BANCO_DO_BRASIL",
  bankAccounTypeId: "1",
};

const getBanksToTest = () => {
  return [
    {
      bankId: bancoDoBrasilObject.id,
      bankAccountTypeId: bancoDoBrasilAccountTypeObject.id,
    },
    {
      bankId: randomBankObject.id,
      bankAccountTypeId: randomBankAccountTypeObject.id,
    },
  ];
};

beforeAll(async () => {
  await database.createInstance(true);
  // We need to wait a little bit more, for sequelize create all tables and relationships
  // before starting our tests
  await helpers.sleep(5000);
}, 10000);

describe("Testing Bank routes", () => {
  test("Listing beneficiaries without register anyone should return an empty list and status 200", async () => {
    const resp = await supertest(app)
      .get("/beneficiaries")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toStrictEqual([]);
  });

  test("Get beneficiary id that isn't registered should return status 404", async () => {
    const resp = await supertest(app)
      .get("/beneficiary/nope")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
    expect(resp.statusCode).toBe(404);
  });

  test("Invoke batch delete route with invalid body should return status 400", async () => {
    let resp = await supertest(app)
      .delete("/beneficiaries")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ body: null });
    expect(resp.statusCode).toBe(400);

    resp = await supertest(app)
      .delete("/beneficiaries")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ body: { useless: "property" } });
    expect(resp.statusCode).toBe(400);
  });

  test("Patch beneficiary with an id that isn't registerd should return status 404", async () => {
    const resp = await supertest(app)
      .patch("/beneficiary/nope")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({});
    expect(resp.statusCode).toBe(404);
  });

  test("Try to create beneficiary with missing required fields should return status 400", async () => {
    const resp = await supertest(app)
      .post("/beneficiary")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        document: "53902371021",
        documentType: "CPF",
        agencyNumber: "0001",
        agencyDigit: null,
        accountNumber: "123456",
        accountDigit: "1",
        bankId: "BANCO_DO_BRASIL",
        bankAccounTypeId: "1",
      });
    expect(resp.statusCode).toBe(400);
  });

  test("Try to create beneficiary with invalid document information should return status 400", async () => {
    let resp = await supertest(app)
      .post("/beneficiary")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ ...baseBeneficiaryObj, document: "129837129837219" });
    expect(resp.statusCode).toBe(400);

    resp = await supertest(app)
      .post("/beneficiary")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ ...baseBeneficiaryObj, documentType: "CNH" });
    expect(resp.statusCode).toBe(400);

    resp = await supertest(app)
      .post("/beneficiary")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({ ...baseBeneficiaryObj, documentType: "CNPJ" });
    expect(resp.statusCode).toBe(400);

    resp = await supertest(app)
      .post("/beneficiary")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        ...baseBeneficiaryObj,
        document: documentHelper.cnpj.generate(),
        documentType: "CPF",
      });
    expect(resp.statusCode).toBe(400);
  });

  describe("Testing beneficiary with bank and bank account type registered", () => {
    beforeAll(async () => {
      let resp = await supertest(app)
        .post("/bank")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send(bancoDoBrasilObject);
      expect(resp.statusCode).toBe(201);

      resp = await supertest(app)
        .post("/bank")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send(randomBankObject);
      expect(resp.statusCode).toBe(201);

      resp = await supertest(app)
        .post("/bankAccountType")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send(bancoDoBrasilAccountTypeObject);
      expect(resp.statusCode).toBe(201);

      bancoDoBrasilAccountTypeObject.id = resp.body.id;

      resp = await supertest(app)
        .post("/bankAccountType")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send(bancoDoBrasilWrongAccountTypeObject);
      expect(resp.statusCode).toBe(201);

      bancoDoBrasilWrongAccountTypeObject.id = resp.body.id;

      resp = await supertest(app)
        .post("/bankAccountType")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send(randomBankAccountTypeObject);
      expect(resp.statusCode).toBe(201);

      randomBankAccountTypeObject.id = resp.body.id;
    });

    test("Create beneficiary with a bank id that is not registered should return status 404", async () => {
      const resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
          bankId: "NAO_EXISTO_BANK",
        });

      expect(resp.statusCode).toBe(404);
    });

    test("Create beneficiary with bank account type id that is not registered should return status 404", async () => {
      const resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
          bankId: bancoDoBrasilObject.id,
          bankAccounTypeId: 666999,
        });

      expect(resp.statusCode).toBe(404);
    });

    test("Create beneficiary with characters on agency number should return status 400", async () => {
      for (const bank of getBanksToTest()) {
        const resp = await supertest(app)
          .post("/beneficiary")
          .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
          .send({
            ...baseBeneficiaryObj,
            ...bank,
            agencyNumber: "i_dont_have_numbers_on_my_keyboard",
          });

        expect(resp.statusCode).toBe(400);
      }
    });

    test("Create beneficiary with agency number exceeding max length should return status 400", async () => {
      for (const bank of getBanksToTest()) {
        resp = await supertest(app)
          .post("/beneficiary")
          .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
          .send({
            ...baseBeneficiaryObj,
            ...bank,
            agencyNumber: "1237126387216",
          });

        expect(resp.statusCode).toBe(400);
      }
    });

    test("Create beneficiary with agency number mixed with characters should return status 400", async () => {
      for (const bank of getBanksToTest()) {
        resp = await supertest(app)
          .post("/beneficiary")
          .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
          .send({
            ...baseBeneficiaryObj,
            ...bank,
            agencyNumber: "ab12",
          });

        expect(resp.statusCode).toBe(400);
      }
    });

    test("Create beneficiary with agency number mixed with characters should return status 400", async () => {
      for (const bank of getBanksToTest()) {
        resp = await supertest(app)
          .post("/beneficiary")
          .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
          .send({
            ...baseBeneficiaryObj,
            ...bank,
            agencyNumber: "0000",
          });

        expect(resp.statusCode).toBe(400);
      }
    });

    test("Create beneficiary with characters on account number should return status 400", async () => {
      for (const bank of getBanksToTest()) {
        resp = await supertest(app)
          .post("/beneficiary")
          .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
          .send({
            ...baseBeneficiaryObj,
            ...bank,
            accountNumber: "what_are_numbers",
          });

        expect(resp.statusCode).toBe(400);
      }
    });
  });

  test("Create beneficiary with account number exceeding max length should return status 400", async () => {
    for (const bank of getBanksToTest()) {
      resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
          ...bank,
          accountNumber: "1237126387216",
        });

      expect(resp.statusCode).toBe(400);
    }
  });

  test("Create beneficiary with account number mixed with characters should return status 400", async () => {
    for (const bank of getBanksToTest()) {
      resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
          ...bank,
          accountNumber: "ab12",
        });

      expect(resp.statusCode).toBe(400);
    }
  });

  test("Create beneficiary with account number mixed with characters should return status 400", async () => {
    for (const bank of getBanksToTest()) {
      resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
          ...bank,
          accountNumber: "000000",
        });

      expect(resp.statusCode).toBe(400);
    }
  });

  test("Create beneficiary with character on account digit should return status 400", async () => {
    for (const bank of getBanksToTest()) {
      resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
          ...bank,
          accountDigit: "a",
        });

      expect(resp.statusCode).toBe(400);
    }
  });

  test("Create beneficiary with account digit exceeding length should return status 400", async () => {
    for (const bank of getBanksToTest()) {
      resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
          ...bank,
          accountDigit: "123",
        });

      expect(resp.statusCode).toBe(400);
    }
  });

  test("Create beneficiary with invalid account type should return status 400", async () => {
    resp = await supertest(app)
      .post("/beneficiary")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        ...baseBeneficiaryObj,
        bankId: bancoDoBrasilWrongAccountTypeObject.bankId,
        bankAccounTypeId: bancoDoBrasilWrongAccountTypeObject.id,
      });

    expect(resp.statusCode).toBe(400);
  });

  test("Create beneficiary with valid data should return status 200", async () => {
    resp = await supertest(app)
      .post("/beneficiary")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
      .send({
        ...baseBeneficiaryObj,
      });

    expect(resp.statusCode).toBe(201);
  });
});

afterAll(async () => {
  await database.close();
});
