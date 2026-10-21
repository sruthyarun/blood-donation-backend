
const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");

// Get notifications for a recipient by email.
router.get("/", async (req, res) => {
    try {
        const email = req.query.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Recipient email is required.",
            });
        }

        const notifications = await Notification.find({
            emailTo: email,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications,
        });
    } catch (error) {
        console.error("Fetch notifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications.",
        });
    }
});

// Mark a notification as read.
router.patch("/:id/read", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Recipient email is required.",
            });
        }

        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                emailTo: email.trim().toLowerCase(),
            },
            { read: true },
            { new: true, runValidators: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: notification,
            message: "Notification marked as read.",
        });
    } catch (error) {
        console.error("Mark notification read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update notification.",
        });
    }
});

module.exports = router;
