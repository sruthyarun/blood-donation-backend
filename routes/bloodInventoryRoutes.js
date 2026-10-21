
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const BloodInventory = require("../models/BloodInventory");

// GET: Retrieve inventory, optionally filtered by hospital email
router.get("/", async (req, res) => {
    try {
        const filter = {};

        if (req.query.hospitalEmail) {
            filter.hospitalEmail = req.query.hospitalEmail
                .trim()
                .toLowerCase();
        }

        const inventory = await BloodInventory.find(filter).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            data: inventory,
        });
    } catch (error) {
        console.error("Fetch blood inventory error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch blood inventory",
        });
    }
});

// POST: Add a blood inventory record

router.post("/", async (req, res) => {
    try {
        const {
            bloodGroup,
            units,
            date,
            hospitalEmail,
            hospitalName,
        } = req.body;

        if (
            !bloodGroup ||
            units === undefined ||
            units === null ||
            !hospitalEmail
        ) {
            return res.status(400).json({
                success: false,
                message: "Blood group, units, and hospital email are required",
            });
        }

        const parsedUnits = Number(units);

        if (!Number.isInteger(parsedUnits) || parsedUnits < 0) {
            return res.status(400).json({
                success: false,
                message: "Units must be a non-negative integer",
            });
        }

        const inventoryDate = date ? new Date(date) : new Date();

        if (Number.isNaN(inventoryDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid date",
            });
        }

        const inventory = await BloodInventory.create({
            bloodGroup,
            units: parsedUnits,
            date: inventoryDate,
            hospitalEmail: hospitalEmail.trim().toLowerCase(),
            hospitalName: hospitalName || "",
        });

        return res.status(201).json({
            success: true,
            message: "Blood inventory added successfully",
            data: inventory,
        });
    } catch (error) {
        console.error("Add blood inventory error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add blood inventory",
            error: error.message,
        });
    }
});

// PATCH: Update an existing inventory record
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID",
            });
        }

        const updates = {};
        const { bloodGroup, units } = req.body;

        if (bloodGroup !== undefined) updates.bloodGroup = bloodGroup;

        if (units !== undefined) {
            const parsedUnits = Number(units);

            if (!Number.isInteger(parsedUnits) || parsedUnits < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Units must be a non-negative integer",
                });
            }

            updates.units = parsedUnits;
        }

        const inventory = await BloodInventory.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Blood inventory record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Blood inventory updated successfully",
            data: inventory,
        });
    } catch (error) {
        console.error("Update blood inventory error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update blood inventory",
            error: error.message,
        });
    }
});

// DELETE: Remove an inventory record
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inventory ID",
            });
        }

        const inventory = await BloodInventory.findByIdAndDelete(id);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Blood inventory record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Blood inventory deleted successfully",
        });
    } catch (error) {
        console.error("Delete blood inventory error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete blood inventory",
        });
    }
});

module.exports = router;
