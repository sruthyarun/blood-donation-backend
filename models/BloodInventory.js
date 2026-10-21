
const mongoose = require("mongoose");

const bloodInventorySchema = new mongoose.Schema(
    {
        bloodGroup: {
            type: String,
            required: true,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },

        units: {
            type: Number,
            required: true,
            min: 0,
        },

        date: {
            type: Date,
            required: true,
            default: Date.now,
        },

        hospitalEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        hospitalName: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: "bloodInventory",
    }
);

module.exports = mongoose.model(
    "BloodInventory",
    bloodInventorySchema
);
