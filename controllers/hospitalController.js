const Hospital = require("../models/Hospital");

// Create hospital
const createHospital = async (req, res) => {
    try {
        const {
            hospitalName,
            hospitalType,
            contactPerson,
            adminName,
            email,
            phone,
            registrationNumber,
            licenseNumber,
            address,
            city,
            state,
            pincode,
            bloodBank,
            totalBeds,
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

        const existingHospital = await Hospital.findOne({
            $or: [
                { email },
                { registrationNumber },
                { licenseNumber },
            ],
        });

        if (existingHospital) {
            return res.status(400).json({
                success: false,
                message: "Hospital already exists with this email, registration number, or license number",
            });
        }

        const hospital = await Hospital.create({
            hospitalName,
            hospitalType,
            contactPerson,
            adminName,
            email,
            phone,
            registrationNumber,
            licenseNumber,
            address,
            city,
            state,
            pincode,
            bloodBank,
            totalBeds,
            emergencyPhone,
            password,
            logo,
            status,
        });

        res.status(201).json({
            success: true,
            message: "Hospital created successfully",
            hospital,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create hospital",
            error: error.message,
        });
    }
};

// Get all hospitals
const getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find();

        res.status(200).json({
            success: true,
            count: hospitals.length,
            hospitals,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch hospitals",
            error: error.message,
        });
    }
};

// Get hospital by ID
const getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        res.status(200).json({
            success: true,
            hospital,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch hospital",
            error: error.message,
        });
    }
};

// Update hospital
const updateHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Hospital updated successfully",
            hospital,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update hospital",
            error: error.message,
        });
    }
};

// Delete hospital
const deleteHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Hospital deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete hospital",
            error: error.message,
        });
    }
};

module.exports = {
    createHospital,
    getHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
};