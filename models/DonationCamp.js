
const mongoose = require("mongoose");

const donationCampSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: String,
            default: "",
            trim: true,
        },
        hospitalName: {
            type: String,
            required: true,
            trim: true,
        },
        hospitalEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        campName: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
            trim: true,
        },
        endTime: {
            type: String,
            required: true,
            trim: true,
        },
        venue: {
            type: String,
            required: true,
            trim: true,
        },
        district: {
            type: String,
            required: true,
            trim: true,
        },
        bloodGroupsNeeded: {
            type: [{
                type: String,
                enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            }],
            default: [],
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Capacity must be a whole number.",
            },
        },
        contact: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: ["Upcoming", "Completed", "Cancelled"],
            default: "Upcoming",
        },
    },
    {
        timestamps: true,
        collection: "donationCamps",
    }
);

module.exports = mongoose.model("DonationCamp", donationCampSchema);
