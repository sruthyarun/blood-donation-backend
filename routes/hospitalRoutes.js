const express = require("express");

const {
    createHospital,
    getHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
} = require("../controllers/hospitalController");

const router = express.Router();

router.post("/", createHospital);
router.get("/", getHospitals);
router.get("/:id", getHospitalById);
router.put("/:id", updateHospital);
router.delete("/:id", deleteHospital);

module.exports = router;