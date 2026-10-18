
const Donor = require("../models/Donor");

// Create donor
const createDonor = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            gender,
            dob,
            bloodGroup,
            weight,
            lastDonation,
            address,
            city,
            state,
            pincode,
            diseases,
            availability,
            password,
            confirmPassword,
        } = req.body;

        // Validate required password fields
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

        // Normalize email
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check whether donor already exists
        const existingDonor = await Donor.findOne({
            email: normalizedEmail,
        });

        if (existingDonor) {
            return res.status(409).json({
                success: false,
                message: "Donor with this email already exists",
            });
        }

        // Create donor
        // Ensure your Donor model hashes passwords using bcrypt
        const donor = await Donor.create({
            fullName,
            email: normalizedEmail,
            phone,
            gender,
            dob,
            bloodGroup,
            weight,
            lastDonation,
            address,
            city,
            state,
            pincode,
            diseases,
            availability,
            password,
        });

        // Never send the password to the frontend
        const donorResponse = donor.toObject();
        delete donorResponse.password;

        return res.status(201).json({
            success: true,
            message: "Donor created successfully",
            donor: donorResponse,
        });
    } catch (error) {
        console.error("Create donor error:", error.message);

        // Handle duplicate email index errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Donor with this email already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create donor",
        });
    }
};

// Get all donors
const getDonors = async (req, res) => {
    try {
        const donors = await Donor.find().select("-password");

        console.log("Retrieved donors:", donors.length);

        return res.status(200).json({
            success: true,
            count: donors.length,
            donors,
        });
    } catch (error) {
        console.error("Get donors error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve donors",
        });
    }
};

// Get donor by ID
const getDonorById = async (req, res) => {
    try {
        const donor = await Donor.findById(req.params.id)
            .select("-password");

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found",
            });
        }

        return res.status(200).json({
            success: true,
            donor,
        });
    } catch (error) {
        console.error("Get donor by ID error:", error.message);

        // Invalid MongoDB ObjectId
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid donor ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve donor",
        });
    }
};

// Update donor
const updateDonor = async (req, res) => {
    try {
        // Password updates must use a separate secure endpoint.
        if (
            Object.prototype.hasOwnProperty.call(req.body, "password") ||
            Object.prototype.hasOwnProperty.call(req.body, "confirmPassword")
        ) {
            return res.status(400).json({
                success: false,
                message: "Use the secure password update endpoint to change a password",
            });
        }

        // Do not allow email changes through this endpoint.
        // Handle email changes separately if your application requires them.
        const updateData = { ...req.body };
        delete updateData.email;

        const donor = await Donor.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Donor updated successfully",
            donor,
        });
    } catch (error) {
        console.error("Update donor error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid donor ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update donor",
        });
    }
};

// Delete donor
const deleteDonor = async (req, res) => {
    try {
        const donor = await Donor.findByIdAndDelete(req.params.id);

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Donor deleted successfully",
        });
    } catch (error) {
        console.error("Delete donor error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid donor ID",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete donor",
        });
    }
};

// Export controller functions
module.exports = {
    createDonor,
    getDonors,
    getDonorById,
    updateDonor,
    deleteDonor,
};