const router = require("express").Router();

const bankAccountTypeController = require("../controllers/bankAccountType");

router.get("/bankAccountTypes", bankAccountTypeController.getBankAccountTypes);
router.get(
  "/bankAccountType/:id",
  bankAccountTypeController.getBankAccountType
);
router.post(
  "/bankAccountType",
  bankAccountTypeController.createBankAccountType
);
router.patch(
  "/bankAccountType/:id",
  bankAccountTypeController.updateBankAccountType
);
router.delete(
  "/bankAccountType/:id",
  bankAccountTypeController.deleteBankAccountType
);

module.exports = router;
