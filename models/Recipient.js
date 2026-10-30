
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const recipientSchema = new mongoose.Schema(
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
                "A+", "A-",
                "B+", "B-",
                "AB+", "AB-",
                "O+", "O-",
            ],
        },

        hospital: {
            type: String,
            required: true,
        },

        medicalCondition: {
            type: String,
            required: true,
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

        password: {
            type: String,
            required: true,
            select: false,
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

// Hash password before saving
recipientSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("Recipient", recipientSchema);
