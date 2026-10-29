
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        donorId: {
            type: String,
            default: "",
            trim: true,
        },

        donorName: {
            type: String,
            required: true,
            trim: true,
        },

        donorEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        // Compatibility with older frontend code
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        bloodGroup: {
            type: String,
            required: true,
            trim: true,
        },

        district: {
            type: String,
            required: true,
            trim: true,
        },

        // Destination can be a hospital or blood bank
        destinationType: {
            type: String,
            enum: ["Hospital", "BloodBank"],
            required: true,
        },

        destinationId: {
            type: String,
            required: true,
            trim: true,
        },

        destinationName: {
            type: String,
            required: true,
            trim: true,
        },

        // Required only for hospital appointments
        hospital: {
            type: String,
            default: "",
            trim: true,
            required: function () {
                return this.destinationType === "Hospital";
            },
        },

        hospitalId: {
            type: String,
            default: "",
            trim: true,
        },

        // Used for blood bank appointments
        bloodBankId: {
            type: String,
            default: "",
            trim: true,
        },

        bloodBankName: {
            type: String,
            default: "",
            trim: true,
        },

        date: {
            type: String,
            required: true,
            trim: true,
        },

        time: {
            type: String,
            required: true,
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
            enum: [
                "Pending",
                "Approved",
                "Confirmed",
                "Completed",
                "Rejected",
                "Cancelled",
                "Done",
            ],
            default: "Pending",
        },
    },
    {
        timestamps: true,
        collection: "appointments",
    }
);

module.exports =
    mongoose.models.Appointment ||
    mongoose.model("Appointment", appointmentSchema);
