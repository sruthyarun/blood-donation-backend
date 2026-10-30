
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

// Admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const admin = await Admin.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const adminData = admin.toObject();
        delete adminData.password;

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            admin: adminData,
        });

    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(500).json({
            success: false,
            message: "Admin login failed",
        });
    }
};


// Get admin profile
const getAdmin = async (req, res) => {
    try {
        const { id, email } = req.query;

        let admin;

        if (id) {
            admin = await Admin.findById(id).select("-password");
        } else if (email) {
            admin = await Admin.findOne({
                email: email.toLowerCase().trim(),
            }).select("-password");
        } else {
            // Fallback: return the first admin record
            admin = await Admin.findOne().select("-password");
        }

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        return res.status(200).json({
            success: true,
            admin,
        });

    } catch (error) {
        console.error("Get admin error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch admin profile",
        });
    }
};


// Update admin profile
const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            phone,
            department,
            address,
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required",
            });
        }

        const existingAdmin = await Admin.findOne({
            email: email.toLowerCase().trim(),
            _id: { $ne: id },
        });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered",
            });
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone || "",
                department: department || "",
                address: address || "",
            },
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        if (!updatedAdmin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Admin profile updated successfully",
            admin: updatedAdmin,
        });

    } catch (error) {
        console.error("Update admin error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update admin profile",
        });
    }
};


// Change admin password
const changeAdminPassword = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            currentPassword,
            newPassword,
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current and new passwords are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters",
            });
        }

        const admin = await Admin.findById(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            admin.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        admin.password = hashedPassword;

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error("Change admin password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to change password",
        });
    }
};


module.exports = {
    adminLogin,
    getAdmin,
    updateAdmin,
    changeAdminPassword,
};
