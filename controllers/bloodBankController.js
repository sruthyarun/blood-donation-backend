const BloodBank = require("../models/BloodBank");

// Create blood bank
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
            status,
        } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const existingBloodBank = await BloodBank.findOne({
            $or: [
                { email },
                { licenseNumber },
                { registrationNumber },
            ],
        });

        if (existingBloodBank) {
            return res.status(400).json({
                success: false,
                message:
                    "Blood bank already exists with this email, license number, or registration number",
            });
        }

        const bloodBank = await BloodBank.create({
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
            logo,
            status,
        });

        res.status(201).json({
            success: true,
            message: "Blood bank created successfully",
            bloodBank,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create blood bank",
            error: error.message,
        });
    }
};

// Get all blood banks
const getBloodBanks = async (req, res) => {
    try {
        const bloodBanks = await BloodBank.find();

        res.status(200).json({
            success: true,
            count: bloodBanks.length,
            bloodBanks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch blood banks",
            error: error.message,
        });
    }
};

// Get blood bank by ID
const getBloodBankById = async (req, res) => {
    try {
        const bloodBank = await BloodBank.findById(req.params.id);

        if (!bloodBank) {
            return res.status(404).json({
                success: false,
                message: "Blood bank not found",
            });
        }

        res.status(200).json({
            success: true,
            bloodBank,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch blood bank",
            error: error.message,
        });
    }
};

// Update blood bank
const updateBloodBank = async (req, res) => {
    try {
        const bloodBank = await BloodBank.findByIdAndUpdate(
            req.params.id,
            req.body,
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

        res.status(200).json({
            success: true,
            message: "Blood bank updated successfully",
            bloodBank,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update blood bank",
            error: error.message,
        });
    }
};

// Delete blood bank
const deleteBloodBank = async (req, res) => {
    try {
        const bloodBank = await BloodBank.findByIdAndDelete(req.params.id);

        if (!bloodBank) {
            return res.status(404).json({
                success: false,
                message: "Blood bank not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Blood bank deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete blood bank",
            error: error.message,
        });
    }
};

module.exports = {
    createBloodBank,
    getBloodBanks,
    getBloodBankById,
    updateBloodBank,
    deleteBloodBank,
};