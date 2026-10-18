
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const hospitalSchema = new mongoose.Schema(
    {
        hospitalName: {
            type: String,
            required: true,
            trim: true,
        },

        hospitalType: {
            type: String,
            required: true,
            trim: true,
        },

        contactPerson: {
            type: String,
            required: true,
            trim: true,
        },

        adminName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
        },

        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        licenseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        address: {
            type: String,
            required: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        pincode: {
            type: String,
            required: true,
        },

        bloodBank: {
            type: String,
            enum: ["Available", "Not Available"],
            default: "Not Available",
        },

        totalBeds: {
            type: Number,
            required: true,
            min: 0,
        },

        emergencyPhone: {
            type: String,
            required: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        logo: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

// Hash the password before saving
hospitalSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("Hospital", hospitalSchema);
