const Recipient = require("../models/Recipient");

// Create recipient
const createRecipient = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            gender,
            dob,
            bloodGroup,
            hospital,
            medicalCondition,
            address,
            city,
            state,
            pincode,
            password,
            confirmPassword,
            status,
        } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const existingRecipient = await Recipient.findOne({ email });

        if (existingRecipient) {
            return res.status(400).json({
                success: false,
                message: "Recipient with this email already exists",
            });
        }

        const recipient = await Recipient.create({

            fullName,
            email,
            phone,
            gender,
            dob,
            bloodGroup,
            hospital,
            medicalCondition,
            address,
            city,
            state,
            pincode,
            password,
            status,
        });

        res.status(201).json({
            success: true,
            message: "Recipient created successfully",
            recipient,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create recipient",
            error: error.message,
        });
    }
};

// Get all recipients
const getRecipients = async (req, res) => {
    try {
        const recipients = await Recipient.find();

        res.status(200).json({
            success: true,
            count: recipients.length,
            recipients,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch recipients",
            error: error.message,
        });
    }
};

// Get recipient by ID
const getRecipientById = async (req, res) => {
    try {
        const recipient = await Recipient.findById(req.params.id);

        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient not found",
            });
        }

        res.status(200).json({
            success: true,
            recipient,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch recipient",
            error: error.message,
        });
    }
};

// Update recipient
const updateRecipient = async (req, res) => {
    try {
        const recipient = await Recipient.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Recipient updated successfully",
            recipient,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update recipient",
            error: error.message,
        });
    }
};

// Delete recipient
const deleteRecipient = async (req, res) => {
    try {
        const recipient = await Recipient.findByIdAndDelete(req.params.id);

        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Recipient deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete recipient",
            error: error.message,
        });
    }
};

module.exports = {
    createRecipient,
    getRecipients,
    getRecipientById,
    updateRecipient,
    deleteRecipient,
};