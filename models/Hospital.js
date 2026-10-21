
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
            trim: true,
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
            trim: true,
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
            trim: true,
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
            trim: true,
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

// Hash password before saving a new or modified password
hospitalSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

// Remove password from normal JSON responses
hospitalSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("Hospital", hospitalSchema);
