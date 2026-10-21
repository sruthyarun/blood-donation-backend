
require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const BloodBank = require("../models/BloodBank");

async function fixBloodBankPasswords() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const bloodBanks = await BloodBank.find({}).select("+password");

        for (const bloodBank of bloodBanks) {
            const password = bloodBank.password;

            if (!password) {
                console.log("Missing password:", bloodBank.email);
                continue;
            }

            // Keep passwords that are already bcrypt hashes.
            if (/^\$2[aby]\$\d{2}\$/.test(password)) {
                console.log("Already hashed:", bloodBank.email);
                continue;
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            // Direct update avoids triggering the save hook again.
            await BloodBank.collection.updateOne(
                { _id: bloodBank._id },
                { $set: { password: hashedPassword } }
            );

            console.log("Password hashed:", bloodBank.email);
        }

        console.log("Password check completed");
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

fixBloodBankPasswords();
