
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Donor = require("../models/Donor");

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

async function migratePasswords() {
    try {
        await connectDB();

        const donors = await Donor.find({
            password: { $type: "string" },
        }).select("+password");

        let migrated = 0;
        let skipped = 0;

        for (const donor of donors) {
            // Do not hash passwords that are already bcrypt hashes.
            if (BCRYPT_HASH.test(donor.password)) {
                skipped++;
                continue;
            }

            const hashedPassword = await bcrypt.hash(donor.password, 12);

            // Update the database directly so the save hook doesn't hash twice.
            await Donor.collection.updateOne(
                { _id: donor._id },
                { $set: { password: hashedPassword } }
            );

            migrated++;
        }

        console.log(`Migration completed. Updated: ${migrated}`);
        console.log(`Already hashed and skipped: ${skipped}`);
    } catch (error) {
        console.error("Password migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

migratePasswords();
