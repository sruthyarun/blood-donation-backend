
require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Hospital = require("../models/Hospital");

async function fixHospitalPasswords() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        // Include passwords even though the schema hides them by default.
        const hospitals = await Hospital.find({}).select("+password");

        for (const hospital of hospitals) {
            const password = hospital.password;

            if (!password) {
                console.log("Missing password:", hospital.email);
                continue;
            }

            // Do not hash passwords that are already bcrypt hashes.
            if (/^\$2[aby]\$\d{2}\$/.test(password)) {
                console.log("Already hashed:", hospital.email);
                continue;
            }

            hospital.password = await bcrypt.hash(password, 12);

            // Skip the model save hook to avoid hashing a second time.
            await Hospital.collection.updateOne(
                { _id: hospital._id },
                { $set: { password: hospital.password } }
            );

            console.log("Password hashed:", hospital.email);
        }

        console.log("Password check completed");
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

fixHospitalPasswords();
