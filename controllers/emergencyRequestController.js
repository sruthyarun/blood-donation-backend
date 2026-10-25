
const mongoose = require("mongoose");
const EmergencyRequest = require("../models/EmergencyRequest");

// Create a new emergency request
const createEmergencyRequest = async (req, res) => {
    try {
        const {
            requesterId,
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
            !requesterId ||
            !requesterName ||
            !email ||
            !patientName ||
            !bloodGroup ||
            units === undefined ||
            units === null ||
            units === "" ||
            !district ||
            !hospital ||
            !contact ||
            !reason
        ) {
            return res.status(400).json({
                message: "Please provide all required emergency request fields.",
            });
        }

        const parsedUnits = Number(units);

        if (!Number.isInteger(parsedUnits) || parsedUnits < 1) {
            return res.status(400).json({
                message: "Units must be a positive whole number.",
            });
        }

        const emergencyRequest = await EmergencyRequest.create({
            requestedBy: "Recipient",
            requesterId: String(requesterId).trim(),
            requesterName: String(requesterName).trim(),
            email: String(email).trim().toLowerCase(),
            patientName: String(patientName).trim(),
            bloodGroup,
            units: parsedUnits,
            district: String(district).trim(),
            hospital: String(hospital).trim(),
            contact: String(contact).trim(),
            reason: String(reason).trim(),
            status: "Active",
        });

        return res.status(201).json({
            message: "Emergency request submitted successfully.",
            emergencyRequest,
        });
    } catch (error) {
        console.error("Create emergency request error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to submit emergency request.",
        });
    }
};

// Get emergency requests, optionally filtered by email, requester ID, or status
const getEmergencyRequests = async (req, res) => {
    try {
        const { email, requesterId, status } = req.query;
        const filter = {};
        const conditions = [];

        if (email && String(email).trim()) {
            conditions.push({
                email: String(email).trim().toLowerCase(),
            });
        }

        if (requesterId && String(requesterId).trim()) {
            conditions.push({
                requesterId: String(requesterId).trim(),
            });
        }

        if (conditions.length === 1) {
            Object.assign(filter, conditions[0]);
        } else if (conditions.length > 1) {
            filter.$or = conditions;
        }

        if (status) {
            filter.status = String(status).trim();
        }

        const requests = await EmergencyRequest.find(filter)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: requests.length,
            emergencyRequests: requests,
        });
    } catch (error) {
        console.error("Get emergency requests error:", error);

        return res.status(500).json({
            message: "Failed to fetch emergency requests.",
        });
    }
};

// Get one emergency request by ID
const getEmergencyRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid emergency request ID.",
            });
        }

        const request = await EmergencyRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                message: "Emergency request not found.",
            });
        }

        return res.status(200).json({
            emergencyRequest: request,
        });
    } catch (error) {
        console.error("Get emergency request error:", error);

        return res.status(500).json({
            message: "Failed to fetch emergency request.",
        });
    }
};

// Update emergency request status
const updateEmergencyRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Active",
            "Completed",
            "Cancelled",
        ];

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid emergency request ID.",
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Status must be Active, Completed, or Cancelled.",
            });
        }

        const request = await EmergencyRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!request) {
            return res.status(404).json({
                message: "Emergency request not found.",
            });
        }

        return res.status(200).json({
            message: "Emergency request status updated successfully.",
            emergencyRequest: request,
        });
    } catch (error) {
        console.error("Update emergency request status error:", error);

        return res.status(500).json({
            message: "Failed to update emergency request status.",
        });
    }
};

// Delete an emergency request by ID
const deleteEmergencyRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid emergency request ID.",
            });
        }

        const request = await EmergencyRequest.findByIdAndDelete(id);

        if (!request) {
            return res.status(404).json({
                message: "Emergency request not found.",
            });
        }

        return res.status(200).json({
            message: "Emergency request deleted successfully.",
            emergencyRequest: request,
        });
    } catch (error) {
        console.error("Delete emergency request error:", error);

        return res.status(500).json({
            message: "Failed to delete emergency request.",
        });
    }
};

module.exports = {
    createEmergencyRequest,
    getEmergencyRequests,
    getEmergencyRequestById,
    updateEmergencyRequestStatus,
    deleteEmergencyRequest,
};
