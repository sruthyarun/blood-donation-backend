
const express = require("express");
const router = express.Router();

const {
    createDonationCamp,
    getDonationCamps,
    getDonationCampById,
    updateDonationCamp,
    deleteDonationCamp,
} = require("../controllers/donationCampController");

router.post("/", createDonationCamp);
router.get("/", getDonationCamps);
router.get("/:id", getDonationCampById);
router.put("/:id", updateDonationCamp);
router.delete("/:id", deleteDonationCamp);

module.exports = router;
