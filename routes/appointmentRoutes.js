
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");

// GET appointments, optionally filtered by hospital or donor email
router.get("/", async (req, res) => {
    try {
        const { hospital, email } = req.query;
        const filter = {};

        if (hospital && hospital.trim()) {
            const escapedHospital = hospital.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.hospital = {
                $regex: `^${escapedHospital}$`,
                $options: "i",
            };
        }

        if (email && email.trim()) {
            const normalizedEmail = email.trim().toLowerCase();

            filter.$or = [
                { donorEmail: normalizedEmail },
                { email: normalizedEmail },
            ];
        }

        const appointments = await Appointment.find(filter).sort({
            createdAt: -1,
        });

        return res.status(200).json(appointments);
    } catch (error) {
        console.error("Failed to fetch appointments:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointments.",
        });
    }
});

// BOOK A NEW APPOINTMENT
router.post("/", async (req, res) => {
    try {
        const appointment = await Appointment.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully.",
            data: appointment,
        });
    } catch (error) {
        console.error("Book appointment error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to book appointment.",
        });
    }
});

// CANCEL AN APPOINTMENT
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

        const currentStatus = appointment.status?.toLowerCase();

        if (
            ["completed", "cancelled", "rejected"].includes(currentStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an appointment with status "${appointment.status}".`,
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
            message: "Unable to cancel appointment.",
        });
    }
});

// CONFIRM OR REJECT AN APPOINTMENT AND CREATE A NOTIFICATION
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

        if (appointment.status?.toLowerCase() !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending appointments can be processed.",
            });
        }

        const donorEmail = (
            appointment.donorEmail || appointment.email || ""
        ).trim().toLowerCase();

        if (!donorEmail) {
            return res.status(400).json({
                success: false,
                message: "Donor email is missing from the appointment.",
            });
        }

        // Update appointment in MongoDB
        appointment.status = status;
        await appointment.save();

        // Save notification in the notifications collection
        try {
            await Notification.create({
                title: `Appointment ${status}`,
                type: "appointment",
                emailTo: donorEmail,
                emailBy: req.body.emailBy || "hospital",
                message:
                    `Your blood donation appointment at ${appointment.hospital || "the hospital"
                    } has been ${status.toLowerCase()}.`,
                appointmentId: appointment._id,
                status,
                read: false,
            });
        } catch (notificationError) {
            console.error(
                "Notification creation failed:",
                notificationError
            );

            return res.status(500).json({
                success: false,
                appointmentUpdated: true,
                notificationCreated: false,
                message:
                    "Appointment status was updated, but the notification could not be saved.",
            });
        }

        return res.status(200).json({
            success: true,
            appointmentUpdated: true,
            notificationCreated: true,
            message:
                `Appointment ${status.toLowerCase()} successfully. Notification saved.`,
            data: appointment,
        });
    } catch (error) {
        console.error("Appointment update failed:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update appointment.",
        });
    }
});

module.exports = router;
