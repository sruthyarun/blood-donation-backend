
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["bloodRequest", "appointment"],
            required: true,
        },
        emailTo: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        emailBy: {
            type: String,
            default: "system",
            lowercase: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
        },
        bloodRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BloodRequest",
            default: undefined,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: undefined,
        },
        status: {
            type: String,
            enum: ["Approved", "Rejected", "Confirmed"],
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        collection: "notifications",
    }
);

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);
