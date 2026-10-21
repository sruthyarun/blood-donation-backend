const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
    {
        requestedBy: {
            type: String,
            default: "Hospital",
            trim: true,
        },

        requesterId: {
            type: String,
            default: "",
            trim: true,
        },

        requesterName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        patientName: {
            type: String,
            required: true,
            trim: true,
        },

        bloodGroup: {
            type: String,
            required: true,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },

        units: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Units must be a whole number.",
            },
        },

        district: {
            type: String,
            required: true,
            trim: true,
        },

        hospital: {
            type: String,
            required: true,
            trim: true,
        },

        contact: {
            type: String,
            required: true,
            trim: true,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["Active", "Completed", "Cancelled"],
            default: "Active",
        },
    },
    {
        timestamps: true,
        collection: "emergencyRequests",
    }
);

module.exports = mongoose.model(
    "EmergencyRequest",
    emergencyRequestSchema
);