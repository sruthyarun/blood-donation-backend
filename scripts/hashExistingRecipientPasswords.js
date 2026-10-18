
require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Recipient = require("../models/Recipient");
const connectDB = require("../config/db");

const isBcryptHash = (password) =>
    /^\$2[aby]\$\d{2}\$/.test(password);

async function hashExistingRecipientPasswords() {
    try {
        await connectDB();

        const recipients = await Recipient.find({})
            .select("+password")
            .lean();

        let updated = 0;
        let skipped = 0;

        for (const recipient of recipients) {
            if (
                typeof recipient.password !== "string" ||
                !recipient.password
            ) {
                console.log(
                    `Skipped recipient ${recipient._id}: password missing`
                );
                skipped++;
                continue;
            }

            if (isBcryptHash(recipient.password)) {
                skipped++;
                continue;
            }

            const hashedPassword = await bcrypt.hash(
                recipient.password,
                12
            );

            // Update only the password, bypassing the Mongoose
            // save hook to prevent hashing the hash a second time.
            await Recipient.collection.updateOne(
                { _id: recipient._id },
                { $set: { password: hashedPassword } }
            );

            updated++;
        }

        console.log("Recipient password migration completed.");
        console.log("Passwords hashed:", updated);
        console.log("Records skipped:", skipped);
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

hashExistingRecipientPasswords();
