const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        name: {
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
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            default: "New",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: "feedback",
        timestamps: false,
    }
);

module.exports = mongoose.model("Feedback", feedbackSchema);