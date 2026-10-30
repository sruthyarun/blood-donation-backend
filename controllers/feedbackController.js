const Feedback = require("../models/Feedback");

// Create feedback
const createFeedback = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const feedback = await Feedback.create({
            name,
            email,
            subject,
            message,
            status: "New",
        });

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback,
        });
    } catch (error) {
        console.error("Create feedback error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
        });
    }
};

// Get all feedback
const getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({
            createdAt: -1,
        });

        // Return array for existing admin feedback page
        res.status(200).json(feedback);
    } catch (error) {
        console.error("Get feedback error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch feedback",
        });
    }
};

// Get feedback by ID
const getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found",
            });
        }

        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update feedback
const updateFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Feedback updated successfully",
            feedback,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(
            req.params.id
        );

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Feedback deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createFeedback,
    getFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
};