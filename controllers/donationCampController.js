
const mongoose = require("mongoose");
const DonationCamp = require("../models/DonationCamp");

const getHospitalEmail = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

const allowedFields = [
    "campName",
    "date",
    "startTime",
    "endTime",
    "venue",
    "district",
    "bloodGroupsNeeded",
    "capacity",
    "contact",
    "description",
    "status",
];

const createDonationCamp = async (req, res) => {
    try {
        const {
            hospitalId,
            hospitalName,
            hospitalEmail,
            campName,
            date,
            startTime,
            endTime,
            venue,
            district,
            bloodGroupsNeeded,
            capacity,
            contact,
            description,
        } = req.body;

        const ownerEmail = getHospitalEmail(hospitalEmail);

        if (
            !hospitalName ||
            !ownerEmail ||
            !campName ||
            !date ||
            !startTime ||
            !endTime ||
            !venue ||
            !district ||
            capacity === "" ||
            capacity === undefined ||
            capacity === null ||
            !contact
        ) {
            return res.status(400).json({
                message: "Please provide all required camp fields.",
            });
        }

        const parsedDate = new Date(date);
        const parsedCapacity = Number(capacity);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                message: "Please provide a valid camp date.",
            });
        }

        if (
            !Number.isInteger(parsedCapacity) ||
            parsedCapacity < 1
        ) {
            return res.status(400).json({
                message: "Capacity must be a positive whole number.",
            });
        }

        if (endTime <= startTime) {
            return res.status(400).json({
                message: "End time must be later than start time.",
            });
        }

        const camp = await DonationCamp.create({
            hospitalId: hospitalId ? String(hospitalId) : "",
            hospitalName: String(hospitalName).trim(),
            hospitalEmail: ownerEmail,
            campName: String(campName).trim(),
            date: parsedDate,
            startTime,
            endTime,
            venue: String(venue).trim(),
            district: String(district).trim(),
            bloodGroupsNeeded: Array.isArray(bloodGroupsNeeded)
                ? bloodGroupsNeeded
                : [],
            capacity: parsedCapacity,
            contact: String(contact).trim(),
            description: description || "",
        });

        return res.status(201).json({
            message: "Donation camp created successfully.",
            camp,
        });
    } catch (error) {
        console.error("Create donation camp error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to create donation camp.",
        });
    }
};

const getDonationCamps = async (req, res) => {
    try {
        const filter = {};

        if (req.query.hospitalEmail) {
            filter.hospitalEmail = getHospitalEmail(
                req.query.hospitalEmail
            );
        }

        if (req.query.status) {
            filter.status = String(req.query.status).trim();
        }

        const camps = await DonationCamp.find(filter)
            .sort({ date: 1, startTime: 1 });

        return res.status(200).json({
            count: camps.length,
            camps,
        });
    } catch (error) {
        console.error("Get donation camps error:", error);

        return res.status(500).json({
            message: "Failed to fetch donation camps.",
        });
    }
};

const getDonationCampById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid donation camp ID.",
            });
        }

        const camp = await DonationCamp.findById(id);

        if (!camp) {
            return res.status(404).json({
                message: "Donation camp not found.",
            });
        }

        return res.status(200).json({ camp });
    } catch (error) {
        console.error("Get donation camp error:", error);

        return res.status(500).json({
            message: "Failed to fetch donation camp.",
        });
    }
};

const updateDonationCamp = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerEmail = getHospitalEmail(req.body.hospitalEmail);

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid donation camp ID.",
            });
        }

        if (!ownerEmail) {
            return res.status(400).json({
                message: "Hospital email is required.",
            });
        }

        const camp = await DonationCamp.findById(id);

        if (!camp) {
            return res.status(404).json({
                message: "Donation camp not found.",
            });
        }

        if (getHospitalEmail(camp.hospitalEmail) !== ownerEmail) {
            return res.status(403).json({
                message: "You can only edit your own camps.",
            });
        }

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.date !== undefined) {
            const parsedDate = new Date(updates.date);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: "Please provide a valid camp date.",
                });
            }

            updates.date = parsedDate;
        }

        if (updates.capacity !== undefined) {
            updates.capacity = Number(updates.capacity);

            if (
                !Number.isInteger(updates.capacity) ||
                updates.capacity < 1
            ) {
                return res.status(400).json({
                    message: "Capacity must be a positive whole number.",
                });
            }
        }

        if (updates.bloodGroupsNeeded !== undefined &&
            !Array.isArray(updates.bloodGroupsNeeded)) {
            return res.status(400).json({
                message: "Blood groups needed must be an array.",
            });
        }

        const startTime = updates.startTime || camp.startTime;
        const endTime = updates.endTime || camp.endTime;

        if (endTime <= startTime) {
            return res.status(400).json({
                message: "End time must be later than start time.",
            });
        }

        Object.assign(camp, updates);
        await camp.save();

        return res.status(200).json({
            message: "Donation camp updated successfully.",
            camp,
        });
    } catch (error) {
        console.error("Update donation camp error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to update donation camp.",
        });
    }
};

const deleteDonationCamp = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerEmail = getHospitalEmail(req.query.hospitalEmail);

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid donation camp ID.",
            });
        }

        if (!ownerEmail) {
            return res.status(400).json({
                message: "Hospital email is required.",
            });
        }

        const camp = await DonationCamp.findById(id);

        if (!camp) {
            return res.status(404).json({
                message: "Donation camp not found.",
            });
        }

        if (getHospitalEmail(camp.hospitalEmail) !== ownerEmail) {
            return res.status(403).json({
                message: "You can only delete your own camps.",
            });
        }

        await camp.deleteOne();

        return res.status(200).json({
            message: "Donation camp deleted successfully.",
        });
    } catch (error) {
        console.error("Delete donation camp error:", error);

        return res.status(500).json({
            message: "Failed to delete donation camp.",
        });
    }
};

module.exports = {
    createDonationCamp,
    getDonationCamps,
    getDonationCampById,
    updateDonationCamp,
    deleteDonationCamp,
};
