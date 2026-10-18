
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const connectDB = require("../config/db");

async function resetAdminPassword() {
    try {
        await connectDB();

        const email = "admin@gmail.com";
        const newPassword = process.env.ADMIN_PASSWORD;

        if (!newPassword) {
            throw new Error("ADMIN_PASSWORD is missing from .env");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const admin = await Admin.findOneAndUpdate(
            { email },
            { $set: { password: hashedPassword } },
            { new: true, runValidators: true }
        );

        if (!admin) {
            throw new Error("Admin account not found");
        }

        console.log("Admin password updated successfully.");
    } catch (error) {
        console.error("Password reset failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

resetAdminPassword();
