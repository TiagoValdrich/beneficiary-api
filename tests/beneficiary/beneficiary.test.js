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
  bankAccountTypeId: "1",
};

const createTestBanks = async () => {
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
};

const createTestBankAccountTypes = async () => {
  let resp = await supertest(app)
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
};

const deleteTestBankAccountTypes = async () => {
  let resp = await supertest(app)
    .delete(`/bankAccountType/${bancoDoBrasilAccountTypeObject.id}`)
    .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
  expect(resp.statusCode).toBe(200);

  bancoDoBrasilAccountTypeObject.id = "";

  resp = await supertest(app)
    .delete(`/bankAccountType/${bancoDoBrasilWrongAccountTypeObject.id}`)
    .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
  expect(resp.statusCode).toBe(200);

  bancoDoBrasilWrongAccountTypeObject.id = "";

  resp = await supertest(app)
    .delete(`/bankAccountType/${randomBankAccountTypeObject.id}`)
    .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
  expect(resp.statusCode).toBe(200);

  randomBankAccountTypeObject.id = "";
};

const deleteTestBanks = async () => {
  let resp = await supertest(app)
    .delete(`/bank/${bancoDoBrasilObject.id}`)
    .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
  expect(resp.statusCode).toBe(200);

  resp = await supertest(app)
    .delete(`/bank/${randomBankObject.id}`)
    .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
  expect(resp.statusCode).toBe(200);
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

  test("Listing beneficiaries with page parameters with negative numbers should return status 400", async () => {
    const resp = await supertest(app)
      .get("/beneficiaries?page=-1")
      .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);
    expect(resp.statusCode).toBe(400);
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
        bankAccountTypeId: "1",
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
      await createTestBanks();
      await createTestBankAccountTypes();
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
          bankAccountTypeId: 666999,
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
        const resp = await supertest(app)
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
        const resp = await supertest(app)
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
        const resp = await supertest(app)
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
        const resp = await supertest(app)
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

    test("Create beneficiary with account number exceeding max length should return status 400", async () => {
      for (const bank of getBanksToTest()) {
        const resp = await supertest(app)
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
        const resp = await supertest(app)
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
        const resp = await supertest(app)
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
        const resp = await supertest(app)
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
        const resp = await supertest(app)
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
      const resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
          bankId: bancoDoBrasilWrongAccountTypeObject.bankId,
          bankAccountTypeId: bancoDoBrasilWrongAccountTypeObject.id,
        });

      expect(resp.statusCode).toBe(400);
    });

    test("Create beneficiary with valid data should return status 200", async () => {
      const resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
        });

      expect(resp.statusCode).toBe(201);
      expect(resp.body.id).not.toBe(null);
      expect(typeof resp.body.id).toBe("string");

      // Cleaning
      await supertest(app)
        .delete("/beneficiaries")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({ ids: [resp.body.id] });
    });

    afterAll(async () => {
      await deleteTestBankAccountTypes();
      await deleteTestBanks();
    });
  });

  describe("Testing cases for updating an existing beneficiary", () => {
    let beneficiaryId;

    beforeAll(async () => {
      await createTestBanks();
      await createTestBankAccountTypes();

      const resp = await supertest(app)
        .post("/beneficiary")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          ...baseBeneficiaryObj,
          bankId: bancoDoBrasilObject.id,
          bankAccountTypeId: bancoDoBrasilAccountTypeObject.id,
        });
      expect(resp.statusCode).toBe(201);

      beneficiaryId = resp.body.id;
    });

    test("Update beneficiary with VALIDATED status should only update it's e-mail returning status 200", async () => {
      resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          status: "VALIDATED",
        });

      expect(resp.status).toBe(200);

      const newEmail = "newEmail@new.com";
      const newName = "Teste";

      resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          name: newName,
          email: newEmail,
        });

      expect(resp.status).toBe(200);

      resp = await supertest(app)
        .get(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

      expect(resp.body.name).toBe(baseBeneficiaryObj.name);
      expect(resp.body.email).toBe(newEmail);
    });

    test("Update beneficiary with invalid status should return status 400", async () => {
      const resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          status: "NOPE",
        });

      expect(resp.statusCode).toBe(400);
    });

    test("Update beneficiary with wrong document type should return status 400", async () => {
      let resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          status: "DRAFT",
        });

      resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          name: "Valdomiro",
          email: "Valdomiro@teste.com",
          documentType: "CNH",
        });

      expect(resp.statusCode).toBe(400);

      resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          documentType: "CNH",
          document: documentHelper.cpf.generate(),
        });

      expect(resp.statusCode).toBe(400);
    });

    test("Update beneficiary document should return status 200 and update it's document", async () => {
      const newCpf = documentHelper.cpf.generate();

      let resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          documentType: "CPF",
          document: newCpf,
        });
      expect(resp.statusCode).toBe(200);

      // Just to ensure that will update document with same documentType
      resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          document: newCpf,
        });
      expect(resp.statusCode).toBe(200);

      resp = await supertest(app)
        .get(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

      expect(resp.statusCode).toBe(200);
      expect(resp.body.document).toBe(newCpf);
    });

    test("Update beneficiary with wrong bank id should return status 404", async () => {
      const resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          bankId: "ops",
        });

      expect(resp.statusCode).toBe(404);
    });

    test("Update beneficiary bank should return status 200 and update it's bank", async () => {
      let resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          bankId: randomBankObject.id,
          bankAccountTypeId: randomBankAccountTypeObject.id,
        });
      expect(resp.statusCode).toBe(200);

      resp = await supertest(app)
        .get(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

      expect(resp.statusCode).toBe(200);
      expect(resp.body.bankId).toBe(randomBankObject.id);
      expect(resp.body.bankAccountTypeId).toBe(randomBankAccountTypeObject.id);
    });

    test("Update beneficiary with wrong bank account type id should return status 404", async () => {
      const resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          bankAccountTypeId: "ops",
        });

      expect(resp.statusCode).toBe(404);
    });

    test("Update beneficiary with invalid bank details like account number should return status 404", async () => {
      const resp = await supertest(app)
        .patch(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({
          accountNumber: "1234567abc",
          accountDigit: "wrong",
        });

      expect(resp.statusCode).toBe(400);
    });

    test("Search for beneficiary using list beneficiaries route", async () => {
      const beneficiaryResp = await supertest(app)
        .get(`/beneficiary/${beneficiaryId}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

      expect(beneficiaryResp.statusCode).toBe(200);

      const currentBeneficiary = beneficiaryResp.body;

      let resp = await supertest(app)
        .get(`/beneficiaries?page=1&searchValue=${currentBeneficiary.name}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

      expect(resp.statusCode).toBe(200);
      expect(resp.body).toHaveLength(1);
      expect(resp.body[0].name).toBe(currentBeneficiary.name);

      resp = await supertest(app)
        .get(`/beneficiaries?page=1&searchValue=${currentBeneficiary.document}`)
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

      expect(resp.statusCode).toBe(200);
      expect(resp.body).toHaveLength(1);
      expect(resp.body[0].document).toBe(currentBeneficiary.document);

      resp = await supertest(app)
        .get(
          `/beneficiaries?page=1&searchValue=${currentBeneficiary.agencyNumber}`
        )
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

      expect(resp.statusCode).toBe(200);
      expect(resp.body).toHaveLength(1);
      expect(resp.body[0].agencyNumber).toBe(currentBeneficiary.agencyNumber);

      resp = await supertest(app)
        .get(
          `/beneficiaries?page=1&searchValue=${currentBeneficiary.BankAccountType.name}`
        )
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`);

      expect(resp.statusCode).toBe(200);
      expect(resp.body).toHaveLength(1);
      expect(resp.body[0].BankAccountType.name).toBe(
        currentBeneficiary.BankAccountType.name
      );
    });

    afterAll(async () => {
      const cleaning = await supertest(app)
        .delete("/beneficiaries")
        .set("Authorization", `Bearer ${process.env.AUTH_TOKEN}`)
        .send({ ids: [beneficiaryId] });

      expect(cleaning.statusCode).toBe(200);

      await deleteTestBankAccountTypes();
      await deleteTestBanks();
    });
  });
});

afterAll(async () => {
  await database.close();
});
