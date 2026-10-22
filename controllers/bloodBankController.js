
const BloodBank = require("../models/BloodBank");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper: remove password from response
const sanitizeBloodBank = (bloodBank) => {
    const data = bloodBank.toObject
        ? bloodBank.toObject()
        : { ...bloodBank };

    delete data.password;
    return data;
};

// ==========================================
// 1. CREATE / REGISTER BLOOD BANK
// ==========================================
const createBloodBank = async (req, res) => {
    try {
        const {
            bloodBankName,
            managerName,
            email,
            phone,
            licenseNumber,
            registrationNumber,
            state,
            city,
            address,
            pincode,
            storageCapacity,
            operatingHours,
            emergencyPhone,
            password,
            confirmPassword,
            logo,
        } = req.body;

        if (
            !bloodBankName ||
            !managerName ||
            !email ||
            !phone ||
            !licenseNumber ||
            !registrationNumber ||
            !state ||
            !city ||
            !address ||
            !pincode ||
            storageCapacity === undefined ||
            !operatingHours ||
            !emergencyPhone ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingBloodBank = await BloodBank.findOne({
            $or: [
                { email: normalizedEmail },
                { licenseNumber: licenseNumber.trim() },
                { registrationNumber: registrationNumber.trim() },
            ],
        });

        if (existingBloodBank) {
            return res.status(409).json({
                success: false,
                message:
                    "Blood bank already exists with this email, license number, or registration number",
            });
        }

        // The BloodBank model hashes the password in its pre-save hook.
        // Do not hash the password here as well.
        const bloodBank = await BloodBank.create({
            bloodBankName,
            managerName,
            email: normalizedEmail,
            phone,
            licenseNumber: licenseNumber.trim(),
            registrationNumber: registrationNumber.trim(),
            state,
            city,
            address,
            pincode,
            storageCapacity,
            operatingHours,
            emergencyPhone,
            password,
            logo: logo || "",
            status: "Pending",
        });

        return res.status(201).json({
            success: true,
            message: "Blood bank registered successfully. Awaiting approval.",
            bloodBank: sanitizeBloodBank(bloodBank),
        });
    } catch (error) {
        console.error("Create blood bank error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email, license number, or registration number already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to register blood bank",
            error: error.message,
        });
    }
};

// ==========================================
// 2. BLOOD BANK LOGIN
// ==========================================
const loginBloodBank = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Password is select:false in the model, so explicitly include it.
        const bloodBank = await BloodBank.findOne({
            email: normalizedEmail,
        }).select("+password");

        if (!bloodBank) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Supports bcrypt-hashed passwords.
        // Plain-text legacy passwords are intentionally not accepted.
        const isMatch = await bcrypt.compare(
            password,
            bloodBank.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (bloodBank.status !== "Approved") {
            return res.status(403).json({
                success: false,
                message: `Your account is ${bloodBank.status}. Please contact the administrator.`,
                status: bloodBank.status,
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from the backend .env file");
        }

        const token = jwt.sign(
            {
                id: bloodBank._id,
                role: "bloodBank",
                email: bloodBank.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Blood bank login successful",
            token,
            bloodBank: sanitizeBloodBank(bloodBank),
        });
    } catch (error) {
        console.error("Blood bank login error:", error);

        return res.status(500).json({
            success: false,
            message: "Blood bank login failed",
            error: error.message,
        });
    }
};

// ==========================================
// 3. GET ALL BLOOD BANKS
// ==========================================
const getBloodBanks = async (req, res) => {
    try {
        const bloodBanks = await BloodBank.find().lean();

        return res.status(200).json({
            success: true,
            count: bloodBanks.length,
            bloodBanks: bloodBanks.map(sanitizeBloodBank),
        });
    } catch (error) {
        console.error("Get blood banks error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blood banks",
        });
    }
};

// ==========================================
// 4. GET BLOOD BANK BY ID
// ==========================================
const getBloodBankById = async (req, res) => {
    try {
        const bloodBank = await BloodBank.findById(
            req.params.id
        ).lean();

        if (!bloodBank) {
            return res.status(404).json({
                success: false,
                message: "Blood bank not found",
            });
        }

        return res.status(200).json({
            success: true,
            bloodBank: sanitizeBloodBank(bloodBank),
        });
    } catch (error) {
        console.error("Get blood bank by ID error:", error);

        return res.status(400).json({
            success: false,
            message: "Invalid blood bank ID",
        });
    }
};

// ==========================================
// 5. UPDATE BLOOD BANK
// ==========================================
const updateBloodBank = async (req, res) => {
    try {
        const allowedFields = [
            "bloodBankName",
            "managerName",
            "email",
            "phone",
            "licenseNumber",
            "registrationNumber",
            "state",
            "city",
            "address",
            "pincode",
            "storageCapacity",
            "operatingHours",
            "emergencyPhone",
            "logo",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.email) {
            updates.email = updates.email.trim().toLowerCase();
        }

        const bloodBank = await BloodBank.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!bloodBank) {
            return res.status(404).json({
                success: false,
                message: "Blood bank not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Blood bank updated successfully",
            bloodBank: sanitizeBloodBank(bloodBank),
        });
    } catch (error) {
        console.error("Update blood bank error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email, license number, or registration number already exists",
            });
        }

        return res.status(400).json({
            success: false,
            message: "Failed to update blood bank",
            error: error.message,
        });
    }
};

// ==========================================
// 6. DELETE BLOOD BANK
// ==========================================
const deleteBloodBank = async (req, res) => {
    try {
        const bloodBank = await BloodBank.findByIdAndDelete(
            req.params.id
        );

        if (!bloodBank) {
            return res.status(404).json({
                success: false,
                message: "Blood bank not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Blood bank deleted successfully",
        });
    } catch (error) {
        console.error("Delete blood bank error:", error);

        return res.status(400).json({
            success: false,
            message: "Failed to delete blood bank",
        });
    }
};

module.exports = {
    createBloodBank,
    loginBloodBank,
    getBloodBanks,
    getBloodBankById,
    updateBloodBank,
    deleteBloodBank,
};