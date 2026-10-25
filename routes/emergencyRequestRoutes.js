
const express = require("express");

const {
    createEmergencyRequest,
    getEmergencyRequests,
    getEmergencyRequestById,
    updateEmergencyRequestStatus,
    deleteEmergencyRequest,
} = require("../controllers/emergencyRequestController");

const router = express.Router();

router.post("/", createEmergencyRequest);
router.get("/", getEmergencyRequests);
router.get("/:id", getEmergencyRequestById);
router.patch("/:id/status", updateEmergencyRequestStatus);
router.delete("/:id", deleteEmergencyRequest);
module.exports = router;
