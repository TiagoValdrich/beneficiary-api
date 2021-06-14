const { Op } = require("sequelize");
const validationSchemas = require("../helpers/validationSchemas");
const {cpf, cnpj} = require('cpf-cnpj-validator');

const Beneficiary = require("../models/beneficiary");
const Bank = require("../models/bank");
const BankAccountType = require("../models/bankAccountType");

module.exports = {
  getBeneficiariesPaginated: async (req, res) => {
    try {
      const quantityPerPage = 10;
      const offset = ((req.query.page || 1) - 1) * quantityPerPage;
      const query = { 
        bankWhere: {},
        bankAccountWhere: {},
        beneficiaryWhere: {},
      }
      const searchValue = req.query.searchValue;

      const beneficiaries = await Beneficiary.findAll({
        offset,
        limit: quantityPerPage,
        include: [
          {model: Bank},
          {model: BankAccountType},
        ],
      });

      return res.status(200).json(beneficiaries);
    } catch (e) {
      console.error("[BENEFICIARY] An unexpected error occurred when fetching beneficiaries", e);
      return res.sendStatus(500);
    }
  },
  createBeneficiary: async(req, res) => {
    try {
      const body = req.body;
      const reqFields = ["name", "email", "identifier", "type", "agency", "agency_digit", "account_number", "account_digit", "bank_id", "bank_account_type_id"];

      for (const reqField of reqFields) {
        if (!body[reqField]) {
          return res
            .status(400)
            .send(`Missing parameter ${reqField} on request body`);
        }
      }

      if (!["CPF", "CNPJ"].includes(body.type)) {
        return res.status(400).send("Invalid document type");
      }

      if (body.type === "CPF" && !cpf.isValid(body.identifier)) {
        return res.status(400).send("Invalid CPF");
      }
      
      if (body.type === "CNPJ" && !cnpj.isValid(body.identifier)) {
        return res.status(400).send("Invalid CNPJ");
      }

      const bank = await Bank.findByPk(body.bank_id);

      if(!bank) {
        return res.status(404).send("Bank not found");
      }

      const bankAccounType = await BankAccountType.findByPk(body.bank_account_type_id);

      if (!bankAccounType) {
        return res.status(404).send("Bank account type not found!");
      }

    } catch (e) {
      console.error("[BENEFICIARY] An unexpected error occurred when creating beneficiary", e);
      return res.sendStatus(500);
    }
  },
};
