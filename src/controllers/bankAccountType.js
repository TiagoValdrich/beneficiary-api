const { Op } = require("sequelize");

const BankAccountType = require("../models/bankAccountType");
const Bank = require("../models/bank");

module.exports = {
  getBankAccountTypes: async (req, res) => {
    try {
      const bankAccountTypes = await BankAccountType.findAll({
        attributes: ["id", "type", "name"],
        include: {
          model: Bank,
          attributes: ["id", "name"],
        },
      });

      return res.status(200).json(bankAccountTypes);
    } catch (e) {
      console.error(
        "[BANK_ACCOUNT_TYPE] Unexpected error fetching bank account types",
        e
      );
      return res.sendStatus(500);
    }
  },
  getBankAccountType: async (req, res) => {
    try {
      const bankAccountTypeId = req.params?.id;

      const bankAccountType = await BankAccountType.findByPk(
        bankAccountTypeId,
        {
          attributes: ["id", "type", "name"],
          include: {
            model: Bank,
            attributes: ["id", "name"],
          },
        }
      );

      if (!bankAccountType) {
        return res.sendStatus(404);
      }

      return res.status(200).json(bankAccountType);
    } catch (e) {
      console.error(
        "[BANK_ACCOUNT_TYPE] Unexpected error fetching bank account type",
        e
      );
      return res.sendStatus(500);
    }
  },
  createBankAccountType: async (req, res) => {
    try {
      const body = req.body;
      const reqFields = ["type", "name", "bank_id"];

      if (!body) {
        return res.status(400).send("Missing body parameters");
      }

      for (const reqField of reqFields) {
        if (!body[reqField]) {
          return res
            .status(400)
            .send(`Missing parameter ${reqField} on request body`);
        }
      }

      const bank = await Bank.findByPk(body.bank_id);

      if (!bank) {
        return res.sendStatus(404);
      }

      const bankAccountType = await BankAccountType.findOne({
        where: {
          type: {
            [Op.eq]: body.type,
          },
        },
      });

      if (bankAccountType) {
        return res.status(400).send("This bank account type already exists!");
      }

      const saved = await BankAccountType.create({
        type: body.type,
        bank_id: body.bank_id,
        name: body.name,
      });

      return res.status(201).json(saved);
    } catch (e) {
      console.error(
        "[BANK_ACCOUNT_TYPE] Unexpected error creating bank account type",
        e
      );
      return res.sendStatus(500);
    }
  },
  updateBankAccountType: async (req, res) => {
    try {
      const bankAccountTypeId = req.params?.id;
      const body = req.body;

      const bankAccountType = await BankAccountType.findByPk(bankAccountTypeId);

      if (!bankAccountType) {
        return res.sendStatus(404);
      }

      if (body && body.bank_id) {
        const bank = await Bank.findByPk(body.bank_id);

        if (!bank) {
          return res.sendStatus(404);
        }
      }

      await bankAccountType.update({
        ...body,
      });

      return res.sendStatus(200);
    } catch (e) {
      console.error(
        "[BANK_ACCOUNT_TYPE] Unexpected error updating bank account type",
        e
      );
      return res.sendStatus(500);
    }
  },
  deleteBankAccountType: async (req, res) => {
    try {
      const bankAccountTypeId = req.params?.id;

      const bankAccountType = await BankAccountType.findByPk(bankAccountTypeId);

      if (!bankAccountType) {
        return res.sendStatus(404);
      }

      await bankAccountType.destroy();

      return res.sendStatus(200);
    } catch (e) {
      console.error(
        "[BANK_ACCOUNT_TYPE] Unexpected error deleting bank account type",
        e
      );
      return res.sendStatus(500);
    }
  },
};
