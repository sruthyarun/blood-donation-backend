
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
            enum: [
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
            ],
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

        hospital: {
            type: String,
            required: true,
            trim: true,
        },

        requiredDate: {
            type: Date,
            required: true,
        },

        priority: {
            type: String,
            required: true,
            enum: ["Critical", "High", "Normal"],
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        notes: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Fulfilled"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "BloodRequest",
    bloodRequestSchema
);
