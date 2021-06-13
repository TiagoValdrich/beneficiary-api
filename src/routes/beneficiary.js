const router = require("express").Router();

const beneficiaryController = require("../controllers/beneficiary");

router.get("/beneficiaries", beneficiaryController.getBeneficiaries);

module.exports = router;
