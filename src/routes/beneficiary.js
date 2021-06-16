const router = require("express").Router();

const beneficiaryController = require("../controllers/beneficiary");

router.get("/beneficiaries", beneficiaryController.getBeneficiariesPaginated);
router.get("/beneficiary/:id", beneficiaryController.getBeneficiaryById);
router.post("/beneficiary", beneficiaryController.createBeneficiary);
router.patch("/beneficiary/:id", beneficiaryController.updateBeneficiary);
router.delete("/beneficiaries", beneficiaryController.batchDeleteBeneficiaries);

module.exports = router;
