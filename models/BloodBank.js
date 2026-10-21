const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const bloodBankSchema = new mongoose.Schema(
    {
        bloodBankName: {
            type: String,
            required: true,
            trim: true,
        },

        managerName: {
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

        licenseNumber: {
            type: String,
            required: true,
            unique: true,
        },

        registrationNumber: {
            type: String,
            required: true,
            unique: true,
        },

        state: {
            type: String,
            required: true,
        },

        city: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        pincode: {
            type: String,
            required: true,
        },

        storageCapacity: {
            type: String,
            required: true,
        },

        operatingHours: {
            type: String,
            required: true,
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
bloodBankSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("BloodBank", bloodBankSchema);