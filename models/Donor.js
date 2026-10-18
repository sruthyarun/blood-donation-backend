const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const donorSchema = new mongoose.Schema(
    {
        fullName: {
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

        gender: {
            type: String,
            required: true,
        },

        dob: {
            type: Date,
            required: true,
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

        weight: {
            type: Number,
            required: true,
        },

        lastDonation: {
            type: Date,
        },

        address: {
            type: String,
            required: true,
        },

        city: {
            type: String,
            required: true,
        },

        state: {
            type: String,
            required: true,
        },

        pincode: {
            type: String,
            required: true,
        },

        diseases: {
            type: String,
            default: "None",
        },

        availability: {
            type: String,
            enum: ["Available", "Not Available"],
            default: "Available",
        },

        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
donorSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});
module.exports = mongoose.model("Donor", donorSchema);