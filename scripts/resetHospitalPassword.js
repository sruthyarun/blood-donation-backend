
require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const Hospital = require("../models/Hospital");

async function resetHospitalPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "testhos@gmail.com";
        const newPassword = "TestHos@123";

        const hospital = await Hospital.findOne({
            email: email.toLowerCase(),
        }).select("+password");

        if (!hospital) {
            console.log("Hospital not found:", email);
            return;
        }

        // The Hospital model's pre-save hook hashes this password.
        hospital.password = newPassword;
        await hospital.save();

        console.log("Password reset successfully!");
        console.log("Email:", email);
        console.log("New password: TestHos@123");
        console.log("Hospital status:", hospital.status);
    } catch (error) {
        console.error("Password reset error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

resetHospitalPassword();
