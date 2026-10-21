
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Donor = require("../models/Donor");
const Recipient = require("../models/Recipient");
const Hospital = require("../models/Hospital");
const BloodBank = require("../models/BloodBank");

// Shared login function
const loginUser = async (req, res, Model, role, accountType) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await Model.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare the entered password with the stored bcrypt hash.
        // Existing plain-text passwords must be migrated or reset first.
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Hospital and Blood Bank accounts require approval.
        if (
            ["Hospital", "BloodBank"].includes(accountType) &&
            user.status !== "Approved"
        ) {
            return res.status(403).json({
                success: false,
                message: `Your account is ${user.status || "Pending"}. Please contact the administrator.`,
                status: user.status || "Pending",
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from .env");

            return res.status(500).json({
                success: false,
                message: "Server authentication is not configured",
            });
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d",
            }
        );

        const userData = user.toObject();

        delete userData.password;
        delete userData.__v;

        return res.status(200).json({
            success: true,
            message: `${accountType} login successful`,
            token,
            user: {
                ...userData,
                role,
            },
        });
    } catch (error) {
        console.error(`${accountType} login error:`, error);

        return res.status(500).json({
            success: false,
            message: `${accountType} login failed`,
        });
    }
};

// Donor login
const donorLogin = (req, res) => {
    return loginUser(req, res, Donor, "Donor", "Donor");
};

// Recipient login
const recipientLogin = (req, res) => {
    return loginUser(req, res, Recipient, "Recipient", "Recipient");
};

// Hospital login
const hospitalLogin = (req, res) => {
    return loginUser(req, res, Hospital, "Hospital", "Hospital");
};

// Blood Bank login
const bloodBankLogin = (req, res) => {
    return loginUser(req, res, BloodBank, "BloodBank", "Blood Bank");
};

module.exports = {
    donorLogin,
    recipientLogin,
    hospitalLogin,
    bloodBankLogin,
};
