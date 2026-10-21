const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const EmergencyRequest = require("../models/EmergencyRequest");

// GET: Fetch emergency requests
// Optional query: /api/emergencyRequests?email=hospital@example.com
router.get("/", async (req, res) => {
    try {
        const { email } = req.query;

        const filter = {};

        if (email && email.trim()) {
            filter.email = email.trim().toLowerCase();
        }

        const requests = await EmergencyRequest.find(filter)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests,
        });
    } catch (error) {
        console.error("Fetch emergency requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch emergency requests.",
        });
    }
});

// POST: Create a new emergency request
router.post("/", async (req, res) => {
    try {
        const {
            requesterName,
            email,
            patientName,
            bloodGroup,
            units,
            district,
            hospital,
            contact,
            reason,
        } = req.body;

        if (
            !requesterName?.trim() ||
            !email?.trim() ||
            !patientName?.trim() ||
            !bloodGroup ||
            units === undefined ||
            units === null ||
            units === "" ||
            !district?.trim() ||
            !hospital?.trim() ||
            !contact?.trim() ||
            !reason?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required emergency request fields.",
            });
        }

        const request = await EmergencyRequest.create({
            ...req.body,
            requesterName: requesterName.trim(),
            email: email.trim().toLowerCase(),
            patientName: patientName.trim(),
            district: district.trim(),
            hospital: hospital.trim(),
            contact: contact.trim(),
            reason: reason.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Emergency request created successfully.",
            data: request,
        });
    } catch (error) {
        console.error("Create emergency request error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create emergency request.",
        });
    }
});

// DELETE: Delete an emergency request by MongoDB ID
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid emergency request ID.",
            });
        }

        const deletedRequest =
            await EmergencyRequest.findByIdAndDelete(id);

        if (!deletedRequest) {
            return res.status(404).json({
                success: false,
                message: "Emergency request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency request deleted successfully.",
            data: deletedRequest,
        });
    } catch (error) {
        console.error("Delete emergency request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete emergency request.",
        });
    }
});

module.exports = router;