
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Donor = require("../models/Donor");
const Recipient = require("../models/Recipient");
const Hospital = require("../models/Hospital");

// Shared login function
const loginUser = async (req, res, Model, role) => {
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
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

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

        return res.status(200).json({
            success: true,
            message: `${role} login successful`,
            token,
            user: {
                ...userData,
                role,
            },
        });
    } catch (error) {
        console.error(`${role} login error:`, error.message);

        return res.status(500).json({
            success: false,
            message: `${role} login failed`,
        });
    }
};

// Donor login
const donorLogin = (req, res) => {
    return loginUser(req, res, Donor, "Donor");
};

// Recipient login
const recipientLogin = (req, res) => {
    return loginUser(req, res, Recipient, "Recipient");
};


const hospitalLogin = async (req, res) => {
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

        const hospital = await Hospital.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");

        if (!hospital) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            hospital.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (hospital.status !== "Approved") {
            return res.status(403).json({
                success: false,
                message: `Hospital account is ${hospital.status.toLowerCase()}`,
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Server authentication is not configured",
            });
        }

        const token = jwt.sign(
            {
                id: hospital._id.toString(),
                role: "Hospital",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d",
            }
        );

        const hospitalData = hospital.toObject();
        delete hospitalData.password;

        return res.status(200).json({
            success: true,
            message: "Hospital login successful",
            token,
            user: {
                ...hospitalData,
                role: "Hospital",
            },
        });
    } catch (error) {
        console.error("Hospital login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Hospital login failed",
        });
    }
};

module.exports = {
    donorLogin,
    recipientLogin,
    hospitalLogin,
};
