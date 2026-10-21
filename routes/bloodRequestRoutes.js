
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const BloodRequest = require("../models/BloodRequest");
const Notification = require("../models/Notification");
// POST: Create a new blood request
router.post("/", async (req, res) => {
    try {
        const {
            recipientId,
            recipientName,
            patientName,
            bloodGroup,
            units,
            hospital,
            requiredDate,
            priority,
            email,
            phone,
            notes,
        } = req.body;

        const requiredFields = [
            "recipientId",
            "recipientName",
            "patientName",
            "bloodGroup",
            "units",
            "hospital",
            "requiredDate",
            "priority",
            "email",
            "phone",
        ];

        const missingFields = requiredFields.filter((field) => {
            const value = req.body[field];

            return (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            );
        });

        if (missingFields.length) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required blood request fields.",
                missingFields,
            });
        }

        const parsedUnits = Number(units);

        if (!Number.isInteger(parsedUnits) || parsedUnits < 1) {
            return res.status(400).json({
                success: false,
                message: "Units must be a positive whole number.",
            });
        }

        const parsedDate = new Date(requiredDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid required date.",
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        // Correct email validation regex
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        const newBloodRequest = await BloodRequest.create({
            recipientId: String(recipientId).trim(),
            recipientName: String(recipientName).trim(),
            patientName: String(patientName).trim(),
            bloodGroup: String(bloodGroup).trim(),
            units: parsedUnits,
            hospital: String(hospital).trim(),
            requiredDate: parsedDate,
            priority: String(priority).trim(),
            email: normalizedEmail,
            phone: String(phone).trim(),
            notes: notes ? String(notes).trim() : "",
            status: "Pending",
        });

        return res.status(201).json({
            success: true,
            message: "Blood request submitted successfully.",
            data: newBloodRequest,
        });
    } catch (error) {
        console.error("Create blood request error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create blood request.",
        });
    }
});

// GET: Retrieve requests filtered by hospital, email, or recipientId
router.get("/", async (req, res) => {
    try {
        const filter = {};

        if (req.query.hospital) {
            filter.hospital = {
                $regex: `^${String(req.query.hospital).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i",
            };
        }

        if (req.query.email) {
            filter.email = String(req.query.email).trim().toLowerCase();
        }

        if (req.query.recipientId) {
            filter.recipientId = String(req.query.recipientId).trim();
        }

        const requests = await BloodRequest.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests,
        });
    } catch (error) {
        console.error("Fetch blood requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blood requests.",
        });
    }
});

// GET: Retrieve one request by MongoDB ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blood request ID.",
            });
        }

        const bloodRequest = await BloodRequest.findById(id);

        if (!bloodRequest) {
            return res.status(404).json({
                success: false,
                message: "Blood request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: bloodRequest,
        });
    } catch (error) {
        console.error("Fetch blood request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blood request.",
        });
    }
});

// PATCH: Approve or reject a blood request

router.patch("/:id", async (req, res) => {
    try {
        const { status } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be Approved or Rejected.",
            });
        }

        // Find the request in MongoDB.
        const request = await BloodRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Blood request not found.",
            });
        }

        // Only allow pending requests to be processed.
        if (
            request.status &&
            request.status.toLowerCase() !== "pending"
        ) {
            return res.status(400).json({
                success: false,
                message: "This request has already been processed.",
            });
        }

        // Save the new status.
        request.status = status;
        await request.save();

        // Save a notification for the recipient.
        try {
            const recipientEmail = request.email
                ?.trim()
                .toLowerCase();

            if (!recipientEmail) {
                console.error(
                    "Request status updated, but recipient email is missing."
                );

                return res.status(200).json({
                    success: true,
                    data: request,
                    notificationCreated: false,
                    message:
                        `Request ${status.toLowerCase()} successfully, ` +
                        "but the recipient email is missing.",
                });
            }

            await Notification.create({
                title: `Blood Request ${status}`,
                type: "bloodRequest",
                emailTo: recipientEmail,
                emailBy: (
                    req.body.emailBy || "hospital"
                ).trim().toLowerCase(),
                message:
                    `Your blood request for ${request.bloodGroup} ` +
                    `has been ${status.toLowerCase()}.`,
                bloodRequestId: request._id,
                status,
                read: false,
            });

            return res.status(200).json({
                success: true,
                data: request,
                notificationCreated: true,
                message:
                    `Blood request ${status.toLowerCase()} ` +
                    "and notification saved successfully.",
            });
        } catch (notificationError) {
            console.error(
                "Notification creation failed:",
                notificationError
            );

            return res.status(200).json({
                success: true,
                data: request,
                notificationCreated: false,
                message:
                    "Request status updated, but notification creation failed.",
            });
        }
    } catch (error) {
        console.error("Blood request status update error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update blood request.",
            error: error.message,
        });
    }
});

module.exports = router;


// DELETE: Delete a pending blood request
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blood request ID.",
            });
        }

        const request = await BloodRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Blood request not found.",
            });
        }

        if (request.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be deleted.",
            });
        }

        await BloodRequest.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Blood request deleted successfully.",
        });
    } catch (error) {
        console.error("Delete blood request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete blood request.",
        });
    }
});

module.exports = router;
