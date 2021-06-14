const { Op } = require("sequelize");

const Bank = require("../models/bank");
const BankAccountType = require("../models/bankAccountType");

module.exports = {
  getBanks: async (req, res) => {
    try {
      const bank = await Bank.findAll({ attributes: ["id", "name"] });

      return res.status(200).json(bank);
    } catch (e) {
      console.error("[BANK] Unexpected error fetching banks", e);
      return res.sendStatus(500);
    }
  },
  getBank: async (req, res) => {
    try {
      const bankId = req.params?.id;

      const bank = await Bank.findByPk(bankId, { attributes: ["id", "name"] });

      if (!bank) {
        return res.sendStatus(404);
      }

      return res.status(200).json(bank);
    } catch (e) {
      console.error("[BANK] Unexpected error fetching bank", e);
      return res.sendStatus(500);
    }
  },
  getAccountTypes: async (req, res) => {
    try {
      const bankId = req.params?.id;

      const bank = await Bank.findByPk(bankId, {
        attributes: ["id", "name"],
        include: {
          model: BankAccountType,
          required: false,
          attributes: ["id", "type", "name"],
        },
      });

      if (!bank) {
        return res.sendStatus(404);
      }

      return res.status(200).json(bank.BankAccountTypes || []);
    } catch (e) {
      console.error("[BANK] Unexpected error fetching bank account types", e);
      return res.sendStatus(500);
    }
  },
  createBank: async (req, res) => {
    try {
      const body = req.body;
      const reqFields = ["id", "name"];

      if (!body) {
        return res.status(400).send("Missing body parameters");
      }

      if (body.id && (await Bank.findByPk(body.id))) {
        return res.status(400).send("Bank already exists!");
      }

      for (const reqField of reqFields) {
        if (!body[reqField]) {
          return res
            .status(400)
            .send(`Missing parameter ${reqField} on request body`);
        }
      }

      await Bank.create({
        id: body.id,
        name: body.name,
      });

      return res.sendStatus(201);
    } catch (e) {
      console.error("[BANK] Unexpected error creating a bank", e);
      return res.sendStatus(500);
    }
  },
  updateBank: async (req, res) => {
    try {
      const bankId = req.params?.id;
      const body = req.body;

      const bank = await Bank.findByPk(bankId);

      if (!bank) {
        return res.sendStatus(404);
      }

      await bank.update({
        ...body,
      });

      return res.sendStatus(200);
    } catch (e) {
      console.error("[BANK] Unexpected error updating bank", e);
      return res.sendStatus(500);
    }
  },
  deleteBank: async (req, res) => {
    try {
      const bankId = req.params?.id;

      const bank = await Bank.findByPk(bankId);

      if (!bank) {
        return res.sendStatus(404);
      }

      await bank.destroy();

      return res.sendStatus(200);
    } catch (e) {
      console.error("[BANK] Unexpected error deleting bank", e);
      return res.sendStatus(500);
    }
  },
};
