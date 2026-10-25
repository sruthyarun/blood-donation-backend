
const express = require("express");
const mongoose = require("mongoose");

const BloodRequest = require("../models/BloodRequest");
const Hospital = require("../models/Hospital");
const BloodBank = require("../models/BloodBank");

const router = express.Router();

const getList = async (Model, filter = {}) => {
    return Model.find(filter).lean();
};

// Create a blood request.
router.post("/", async (req, res) => {
    try {
        const {
            recipientId,
            recipientName,
            patientName,
            bloodGroup,
            units,
            requestToType,
            requestToId,
            requiredDate,
            priority,
            email,
            phone,
            notes,
        } = req.body;

        if (
            !recipientId ||
            !recipientName ||
            !patientName ||
            !bloodGroup ||
            !units ||
            !requestToType ||
            !requestToId ||
            !requiredDate ||
            !priority ||
            !email ||
            !phone
        ) {
            return res.status(400).json({
                message: "Please provide all required blood request fields.",
            });
        }

        if (!Number.isInteger(Number(units)) || Number(units) < 1) {
            return res.status(400).json({
                message: "Units must be a positive integer.",
            });
        }

        if (!["Hospital", "Blood Bank"].includes(requestToType)) {
            return res.status(400).json({
                message: "Destination must be Hospital or Blood Bank.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(requestToId)) {
            return res.status(400).json({
                message: "Invalid hospital or blood bank ID.",
            });
        }

        const parsedDate = new Date(requiredDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                message: "Please provide a valid required date.",
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (parsedDate < today) {
            return res.status(400).json({
                message: "Required date cannot be in the past.",
            });
        }

        const DestinationModel =
            requestToType === "Hospital" ? Hospital : BloodBank;

        const destination = await DestinationModel.findById(
            requestToId
        );

        if (!destination) {
            return res.status(404).json({
                message: `${requestToType} not found.`,
            });
        }

        if (
            String(destination.status || "").toLowerCase() !==
            "approved"
        ) {
            return res.status(400).json({
                message: `The selected ${requestToType.toLowerCase()} is not approved.`,
            });
        }

        const destinationName =
            requestToType === "Hospital"
                ? destination.hospitalName || destination.name
                : destination.bloodBankName ||
                destination.bankName ||
                destination.name;

        if (!destinationName) {
            return res.status(400).json({
                message: "The selected destination has no name.",
            });
        }

        const bloodRequest = await BloodRequest.create({
            recipientId: String(recipientId).trim(),
            recipientName: recipientName.trim(),
            patientName: patientName.trim(),
            bloodGroup: bloodGroup.trim().toUpperCase(),
            units: Number(units),
            requestToType,
            requestToId: String(destination._id),
            requestToName: destinationName,

            // Preserve compatibility with existing hospital pages.
            hospital:
                requestToType === "Hospital"
                    ? destinationName
                    : "",

            requiredDate: parsedDate,
            priority,
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            notes: notes || "",
            status: "Pending",
        });

        return res.status(201).json({
            message: "Blood request submitted successfully.",
            data: bloodRequest,
        });
    } catch (error) {
        console.error("Create blood request error:", error);

        return res.status(500).json({
            message: "Failed to create blood request.",
            error: error.message,
        });
    }
});

// Get requests. Optional filters:
// ?email=recipient@example.com
// ?requestToType=Hospital&requestToId=<MongoDB ID>
// ?recipientId=<recipient ID>
router.get("/", async (req, res) => {
    try {
        const {
            email,
            recipientId,
            requestToType,
            requestToId,
            hospital,
        } = req.query;

        const filter = {};

        if (email) {
            filter.email = String(email).trim().toLowerCase();
        }

        if (recipientId) {
            filter.recipientId = String(recipientId).trim();
        }

        if (requestToType) {
            if (!["Hospital", "Blood Bank"].includes(requestToType)) {
                return res.status(400).json({
                    message: "Invalid request destination type.",
                });
            }

            filter.requestToType = requestToType;
        }

        if (requestToId) {
            filter.requestToId = String(requestToId).trim();
        }

        // Compatibility with older hospital dashboard requests.
        if (hospital && !requestToId) {
            filter.hospital = String(hospital).trim();
        }

        const requests = await getList(BloodRequest, filter);

        return res.status(200).json({
            count: requests.length,
            data: requests,
        });
    } catch (error) {
        console.error("Get blood requests error:", error);

        return res.status(500).json({
            message: "Failed to fetch blood requests.",
            error: error.message,
        });
    }
});

module.exports = router;
