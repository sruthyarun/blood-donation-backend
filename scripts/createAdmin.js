
require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const createAdmin = async () => {
    try {
        await connectDB();

        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error("Admin environment variables are missing.");
        }

        const email = ADMIN_EMAIL.toLowerCase().trim();

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            console.log("Admin account already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        await Admin.create({
            name: ADMIN_NAME,
            email,
            password: hashedPassword,
            role: "admin",
        });

        console.log("Admin account created successfully.");
    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await require("mongoose").disconnect();
    }
};

createAdmin();
