const router = require("express").Router();

const bankController = require("../controllers/bank");

router.get("/banks", bankController.getBanks);
router.get("/bank/:id", bankController.getBank);
router.get("/bank/:id/accountTypes", bankController.getAccountTypes);
router.post("/bank", bankController.createBank);
router.patch("/bank/:id", bankController.updateBank);
router.delete("/bank/:id", bankController.deleteBank);

module.exports = router;
