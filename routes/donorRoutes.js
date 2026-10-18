const express = require("express");

const {
    createDonor,
    getDonors,
    getDonorById,
    updateDonor,
    deleteDonor,
} = require("../controllers/donorController");

const router = express.Router();

router.post("/", createDonor);
router.get("/", getDonors);
router.get("/:id", getDonorById);
router.put("/:id", updateDonor);
router.delete("/:id", deleteDonor);

module.exports = router;