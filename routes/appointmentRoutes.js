
const express = require("express");
const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");

const router = express.Router();

// ==========================================
// Helper: Escape special regex characters
// ==========================================
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ==========================================
// GET /api/appointments
// Get appointments with optional filters
// ==========================================
router.get("/", async (req, res) => {
    try {
        const {
            email,
            hospital,
            hospitalId,
            bloodBankId,
            destinationType,
            destinationId,
        } = req.query;

        const filter = {};

        // Filter by donor email
        if (email && email.trim()) {
            const normalizedEmail = email.trim().toLowerCase();

            filter.$or = [
                { donorEmail: normalizedEmail },
                { email: normalizedEmail },
            ];
        }

        // Filter by hospital name
        if (hospital && hospital.trim()) {
            filter.hospital = {
                $regex: `^${escapeRegex(hospital.trim())}$`,
                $options: "i",
            };
        }

        // Filter by hospital ID
        if (hospitalId && hospitalId.trim()) {
            filter.hospitalId = hospitalId.trim();
        }

        // Filter by blood bank ID
        if (bloodBankId && bloodBankId.trim()) {
            filter.bloodBankId = bloodBankId.trim();
        }

        // Filter by destination ID
        if (destinationId && destinationId.trim()) {
            filter.destinationId = destinationId.trim();
        }

        // Filter by destination type
        if (destinationType) {
            if (!["Hospital", "BloodBank"].includes(destinationType)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Destination type must be Hospital or BloodBank.",
                });
            }

            filter.destinationType = destinationType;
        }

        const appointments = await Appointment.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        console.error("Get appointments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve appointments.",
        });
    }
});

// ==========================================
// POST /api/appointments
// Book an appointment at a hospital or bank
// ==========================================
router.post("/", async (req, res) => {
    try {
        const {
            donorId,
            donorName,
            donorEmail,
            email,
            bloodGroup,
            district,
            destinationType,
            destinationId,
            destinationName,
            hospitalId,
            bloodBankId,
            bloodBankName,
            date,
            time,
            phone,
            notes,
        } = req.body;

        // Support donorEmail and legacy email field
        const normalizedEmail = String(donorEmail || email || "")
            .trim()
            .toLowerCase();

        // Validate required fields
        const requiredFields = {
            donorName,
            email: normalizedEmail,
            bloodGroup,
            district,
            destinationType,
            destinationId,
            destinationName,
            date,
            time,
            phone,
        };

        const missingFields = Object.entries(requiredFields)
            .filter(
                ([, value]) =>
                    value === undefined ||
                    value === null ||
                    String(value).trim() === ""
            )
            .map(([field]) => field);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required appointment fields.",
                missingFields,
            });
        }

        // Validate destination type
        if (!["Hospital", "BloodBank"].includes(destinationType)) {
            return res.status(400).json({
                success: false,
                message:
                    "Destination type must be Hospital or BloodBank.",
            });
        }

        // Validate YYYY-MM-DD format
        if (
            typeof date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
            return res.status(400).json({
                success: false,
                message: "Date must be in YYYY-MM-DD format.",
            });
        }

        // Validate actual calendar date without UTC conversion
        const [year, month, day] = date.split("-").map(Number);

        const requestedDate = new Date(year, month - 1, day);

        if (
            requestedDate.getFullYear() !== year ||
            requestedDate.getMonth() !== month - 1 ||
            requestedDate.getDate() !== day
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid calendar date.",
            });
        }

        // Reject dates in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (requestedDate < today) {
            return res.status(400).json({
                success: false,
                message: "Appointment date cannot be in the past.",
            });
        }

        // Normalize destination information
        const selectedDestinationId = String(destinationId).trim();
        const selectedDestinationName = String(destinationName).trim();

        // Prepare appointment document
        const appointmentData = {
            donorId: donorId ? String(donorId).trim() : "",
            donorName: String(donorName).trim(),
            donorEmail: normalizedEmail,
            email: normalizedEmail,
            bloodGroup: String(bloodGroup).trim(),
            district: String(district).trim(),

            destinationType,
            destinationId: selectedDestinationId,
            destinationName: selectedDestinationName,

            // Hospital compatibility fields
            hospital:
                destinationType === "Hospital"
                    ? selectedDestinationName
                    : "",
            hospitalId:
                destinationType === "Hospital"
                    ? String(hospitalId || selectedDestinationId).trim()
                    : "",

            // Blood bank fields
            bloodBankId:
                destinationType === "BloodBank"
                    ? String(bloodBankId || selectedDestinationId).trim()
                    : "",
            bloodBankName:
                destinationType === "BloodBank"
                    ? String(bloodBankName || selectedDestinationName).trim()
                    : "",

            date,
            time: String(time).trim(),
            phone: String(phone).trim(),
            notes: notes ? String(notes).trim() : "",
            status: "Pending",
        };

        const appointment = await Appointment.create(appointmentData);

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully.",
            data: appointment,
        });
    } catch (error) {
        console.error("Create appointment error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Appointment validation failed.",
                errors: Object.values(error.errors).map((item) => ({
                    field: item.path,
                    message: item.message,
                })),
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment data.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to book appointment.",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
});

// ==========================================
// PATCH /api/appointments/:id/cancel
// Cancel an appointment
// ==========================================
router.patch("/:id/cancel", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID.",
            });
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found.",
            });
        }

        if (
            ["Completed", "Cancelled", "Rejected"].includes(
                appointment.status
            )
        ) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an appointment with status ${appointment.status}.`,
            });
        }

        appointment.status = "Cancelled";
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully.",
            data: appointment,
        });
    } catch (error) {
        console.error("Cancel appointment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel appointment.",
        });
    }
});

// ==========================================
// PATCH /api/appointments/:id
// Confirm or reject an appointment
// Body: { "status": "Confirmed" }
//    or { "status": "Rejected" }
// ==========================================
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID.",
            });
        }

        if (!["Confirmed", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be Confirmed or Rejected.",
            });
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found.",
            });
        }

        if (appointment.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending appointments can be updated.",
            });
        }

        appointment.status = status;
        await appointment.save();

        // Create notification without undoing the appointment update
        try {
            await Notification.create({
                title: "Appointment Update",
                type: "appointment",
                emailTo: appointment.donorEmail || appointment.email,
                emailBy:
                    req.body.emailBy || appointment.destinationName,
                message: `Your appointment with ${appointment.destinationName} has been ${status.toLowerCase()}.`,
                appointmentId: appointment._id,
                status,
                read: false,
            });
        } catch (notificationError) {
            console.error(
                "Appointment saved, but notification failed:",
                notificationError.message
            );
        }

        return res.status(200).json({
            success: true,
            message: `Appointment ${status.toLowerCase()} successfully.`,
            data: appointment,
        });
    } catch (error) {
        console.error("Update appointment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update appointment.",
        });
    }
});

module.exports = router;
