const { Op } = require("sequelize");
const validationTools = require("../helpers/validationTools");

const beneficiaryStatus = require("../enums/beneficiaryStatus");
const Beneficiary = require("../models/beneficiary");
const Bank = require("../models/bank");
const BankAccountType = require("../models/bankAccountType");

module.exports = {
  getBeneficiariesPaginated: async (req, res) => {
    try {
      const quantityPerPage = 10;
      const offset = ((req.query.page || 1) - 1) * quantityPerPage;
      const searchValue = req.query.searchValue;
      let whereQuery = {};

      if (searchValue) {
        whereQuery = {
          [Op.or]: [
            { name: { [Op.substring]: searchValue } },
            { document: { [Op.substring]: searchValue } },
            { agencyNumber: { [Op.substring]: searchValue } },
            { "$BankAccountType.name$": { [Op.substring]: searchValue } },
          ],
        };
      }

      if (offset < 0) {
        return res.sendStatus(400);
      }

      const beneficiaries = await Beneficiary.findAll({
        offset,
        limit: quantityPerPage,
        include: [{ model: Bank }, { model: BankAccountType }],
        where: whereQuery,
      });

      return res.status(200).json(beneficiaries);
    } catch (e) {
      console.error(
        "[BENEFICIARY] An unexpected error occurred when fetching beneficiaries",
        e
      );
      return res.sendStatus(500);
    }
  },
  getBeneficiaryById: async (req, res) => {
    try {
      const id = req.params.id;

      const beneficiary = await Beneficiary.findByPk(id);

      if (!beneficiary) {
        return res.sendStatus(404);
      }

      return res.status(200).json(beneficiary);
    } catch (e) {
      console.error(
        "[BENEFICIARY] An unexpected error occurred when fetching beneficiary",
        e
      );
      return res.sendStatus(500);
    }
  },
  createBeneficiary: async (req, res) => {
    try {
      const body = req.body;
      const reqFields = [
        "name",
        "email",
        "document",
        "documentType",
        "agencyNumber",
        "accountNumber",
        "accountDigit",
        "bankId",
        "bankAccounTypeId",
      ];

      for (const reqField of reqFields) {
        if (!body[reqField]) {
          return res
            .status(400)
            .send(`Missing parameter ${reqField} on request body`);
        }
      }

      const { valid, reason } = validationTools.validateDocument();

      if (!valid) {
        return res.status(400).send(reason);
      }

      const bank = await Bank.findByPk(body.bankId);

      if (!bank) {
        return res.status(404).send("Bank not found");
      }

      const bankAccounType = await BankAccountType.findByPk(
        body.bankAccounTypeId
      );

      if (!bankAccounType) {
        return res.status(404).send("Bank account type not found!");
      }

      const validationResult = validationTools.validateBankData({
        ...body,
        accountType: bankAccounType.type,
      });

      if (!validationResult.valid) {
        return res.status(400).send(validationResult.reason);
      }

      const beneficiary = await Beneficiary.create(body);

      return res.status(201).json({ id: beneficiary.id });
    } catch (e) {
      console.error(
        "[BENEFICIARY] An unexpected error occurred when creating beneficiary",
        e
      );
      return res.sendStatus(500);
    }
  },
  updateBeneficiary: async (req, res) => {
    try {
      const id = req.params.id;
      const body = req.body;

      const beneficiary = await Beneficiary.findByPk(id, {
        include: [{ model: Bank }, { model: BankAccountType }],
      });

      if (!beneficiary) {
        return res.sendStatus(404);
      }

      if (beneficiary.status == beneficiaryStatus.VALIDATED) {
        if (body.email && body.email != beneficiary.email) {
          await beneficiary.update({ email: body.email });
        }

        return res.sendStatus(200);
      }

      for (const notValidatedField of ["name", "email"]) {
        if (body[notValidatedField]) {
          beneficiary[notValidatedField] = body[notValidatedField];
        }
      }

      if (body.status) {
        if (!Object.values(beneficiaryStatus).includes(body.status)) {
          return res.status(400).send("Invalid status");
        }

        beneficiary.status = body.status;
      }

      if (
        body.documentType &&
        body.documentType != beneficiary.documentType &&
        !body.document
      ) {
        return res
          .status(400)
          .send(
            "To update your document type, you must provide a new document number"
          );
      }

      if (body.document) {
        const docType = body.documentType || beneficiary.documentType;
        const { valid, reason } = validationTools.validateDocument(
          docType,
          body.document
        );

        if (!valid) {
          return res.status(400).send(reason);
        }

        beneficiary.documentType = docType;
        beneficiary.document = body.document;
      }

      if (body.bankId) {
        const bank = await Bank.findByPk(body.bankId);

        if (!bank) {
          return res.status(404).send("Bank not found");
        }

        beneficiary.bankId = body.bankId;
      }

      let newBankAccountType;

      if (body.bankAccounTypeId) {
        const bankAccounType = await BankAccountType.findByPk(
          body.bankAccounTypeId
        );

        if (!bankAccounType) {
          return res.status(404).send("Bank account type not found");
        }

        newBankAccountType = bankAccounType;
        beneficiary.bankAccounTypeId = body.bankAccounTypeId;
      }

      const bankDetails = {
        bankId: body.bankId || beneficiary.bankId,
        agencyNumber: body.agencyNumber || beneficiary.agencyNumber,
        agencyDigit: body.agencyDigit || beneficiary.agencyDigit,
        accountNumber: body.accountNumber || beneficiary.accountNumber,
        accountDigit: body.accountDigit || beneficiary.accountDigit,
        accountType:
          newBankAccountType?.type || beneficiary.BankAccountType.type,
      };

      const { valid, reason } = validationTools.validateBankData(bankDetails);

      if (!valid) {
        return res.status(400).send(reason);
      }

      beneficiary.agencyNumber = bankDetails.agencyNumber;
      beneficiary.agencyDigit = bankDetails.agencyDigit;
      beneficiary.accountNumber = bankDetails.accountNumber;
      beneficiary.accountDigit = bankDetails.accountDigit;

      await beneficiary.save();

      return res.sendStatus(200);
    } catch (e) {
      console.error(
        "[BENEFICIARY] An unexpected error occurred when updating beneficiary",
        e
      );
      return res.sendStatus(500);
    }
  },
};
