const express = require("express");

const {
    createBloodBank,
    getBloodBanks,
    getBloodBankById,
    updateBloodBank,
    deleteBloodBank,
} = require("../controllers/bloodBankController");

const router = express.Router();

router.post("/", createBloodBank);
router.get("/", getBloodBanks);
router.get("/:id", getBloodBankById);
router.put("/:id", updateBloodBank);
router.delete("/:id", deleteBloodBank);

module.exports = router;