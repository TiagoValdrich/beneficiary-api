const router = require("express").Router();

const beneficiaryController = require("../controllers/beneficiary");

router.get("/beneficiaries", beneficiaryController.getBeneficiariesPaginated);

module.exports = router;
