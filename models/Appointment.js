
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        donorName: {
            type: String,
            required: true,
            trim: true,
        },
        donorId: {
            type: String,
            default: "",
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
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
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
            enum: [
                "Pending",
                "Approved",
                "Confirmed",
                "Completed",
                "Rejected",
                "Cancelled",
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
