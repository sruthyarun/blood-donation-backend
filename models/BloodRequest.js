
const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
    {
        recipientId: {
            type: String,
            required: true,
            trim: true,
        },
        recipientName: {
            type: String,
            required: true,
            trim: true,
        },
        patientName: {
            type: String,
            required: true,
            trim: true,
        },
        bloodGroup: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        units: {
            type: Number,
            required: true,
            min: 1,
        },

        // Hospital or Blood Bank
        requestToType: {
            type: String,
            enum: ["Hospital", "Blood Bank"],
            required: true,
        },
        requestToId: {
            type: String,
            required: true,
            trim: true,
        },
        requestToName: {
            type: String,
            required: true,
            trim: true,
        },

        // Retained for compatibility with existing hospital pages.
        hospital: {
            type: String,
            default: "",
        },

        requiredDate: {
            type: Date,
            required: true,
        },
        priority: {
            type: String,
            enum: ["Critical", "High", "Normal"],
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        notes: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.models.BloodRequest ||
    mongoose.model("BloodRequest", bloodRequestSchema);
