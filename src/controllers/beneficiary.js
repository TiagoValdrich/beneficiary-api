const Beneficiary = require("../models/beneficiary");

module.exports = {
  getBeneficiaries: async (req, res) => {
    const beneficiaries = await Beneficiary.findAll();
    return res.json(beneficiaries);
  },
};
