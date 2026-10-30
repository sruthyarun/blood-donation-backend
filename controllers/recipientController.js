
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
        } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const existingRecipient = await Recipient.findOne({
            email: normalizedEmail,
        });

        if (existingRecipient) {
            return res.status(409).json({
                success: false,
                message: "Recipient with this email already exists",
            });
        }

        const recipient = await Recipient.create({
            fullName,
            email: normalizedEmail,
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
        });

        const recipientResponse = recipient.toObject();
        delete recipientResponse.password;
        delete recipientResponse.__v;

        return res.status(201).json({
            success: true,
            message: "Recipient created successfully",
            recipient: recipientResponse,
        });

    } catch (error) {
        console.error("Create recipient error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Recipient with this email already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create recipient",
        });
    }
};

// Get all recipients
const getRecipients = async (req, res) => {
    try {
        const recipients = await Recipient.find().select("-password -__v");

        return res.status(200).json({
            success: true,
            count: recipients.length,
            recipients,
        });

    } catch (error) {
        console.error("Get recipients error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch recipients",
        });
    }
};

// Get recipient by ID
const getRecipientById = async (req, res) => {
    try {
        const recipient = await Recipient.findById(req.params.id)
            .select("-password -__v");

        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient not found",
            });
        }

        return res.status(200).json({
            success: true,
            recipient,
        });

    } catch (error) {
        console.error("Get recipient error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid recipient ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch recipient",
        });
    }
};

// Update recipient
const updateRecipient = async (req, res) => {
    try {
        // Password must be updated through a separate secure endpoint
        if (
            Object.prototype.hasOwnProperty.call(req.body, "password") ||
            Object.prototype.hasOwnProperty.call(req.body, "confirmPassword")
        ) {
            return res.status(400).json({
                success: false,
                message: "Use the secure password update endpoint",
            });
        }

        const updateData = { ...req.body };

        // Do not allow email changes here
        delete updateData.email;

        const recipient = await Recipient.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select("-password -__v");

        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Recipient updated successfully",
            recipient,
        });

    } catch (error) {
        console.error("Update recipient error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid recipient ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update recipient",
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

        return res.status(200).json({
            success: true,
            message: "Recipient deleted successfully",
        });

    } catch (error) {
        console.error("Delete recipient error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid recipient ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete recipient",
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
