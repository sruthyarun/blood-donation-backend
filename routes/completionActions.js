
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Appointment = require("../models/Appointment");
const BloodRequest = require("../models/BloodRequest");
const BloodInventory = require("../models/BloodInventory");
const Notification = require("../models/Notification");
const Hospital = require("../models/Hospital");
const BloodBank = require("../models/BloodBank");

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function normalizeType(type) {
    const value = String(type || "").trim().toLowerCase();

    if (value === "hospital") return "Hospital";

    if (
        value === "bloodbank" ||
        value === "blood bank" ||
        value === "blood_bank"
    ) {
        return "BloodBank";
    }

    return null;
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exactName(value) {
    return {
        $regex: `^${escapeRegex(String(value || "").trim())}$`,
        $options: "i",
    };
}

function getDestination(record, recordType) {
    if (recordType === "appointment") {
        return {
            type: normalizeType(record.destinationType || "Hospital"),
            id: record.destinationId || record.hospitalId || null,
            name: record.destinationName || record.hospital || "",
        };
    }

    return {
        type: normalizeType(record.requestToType || "Hospital"),
        id: record.requestToId || record.hospitalId || null,
        name: record.requestToName || record.hospital || "",
    };
}

function personEmail(record) {
    return String(
        record.donorEmail ||
        record.email ||
        record.recipientEmail ||
        ""
    ).trim().toLowerCase();
}

async function resolveDestination(type, id, name) {
    const normalizedType = normalizeType(type);

    if (!normalizedType) {
        throw new Error("Invalid destination type");
    }

    const Model =
        normalizedType === "Hospital" ? Hospital : BloodBank;

    let destination = null;

    if (id && mongoose.isValidObjectId(String(id))) {
        destination = await Model.findById(id);
    }

    if (!destination && name) {
        const nameField =
            normalizedType === "Hospital"
                ? "hospitalName"
                : "bloodBankName";

        destination = await Model.findOne({
            [nameField]: exactName(name),
        });
    }

    if (!destination) {
        throw new Error(
            `${normalizedType} "${name || id || ""}" was not found.`
        );
    }

    const email = String(destination.email || "")
        .trim()
        .toLowerCase();

    if (!email) {
        throw new Error(
            `${normalizedType} email was not found.`
        );
    }

    return {
        id: destination._id,
        type: normalizedType,
        email,
        name:
            destination.hospitalName ||
            destination.bloodBankName ||
            name,
    };
}

async function notifyCompletion(
    record,
    recordType,
    action,
    destination,
    units
) {
    const isAppointment = recordType === "appointment";

    await Notification.create({
        title: `${isAppointment ? "Appointment" : "Blood Request"} ${action}`,
        type: isAppointment ? "appointment" : "bloodRequest",

        emailTo: personEmail(record),

        // Store the ID of the hospital or blood bank performing the action.
        emailBy: destination.email,

        message:
            action === "Done"
                ? isAppointment
                    ? `Your Blood donation at ${destination.name} was completed. And now you can download the certificate.`
                    : `You have successfully received ${record.bloodGroup}(${units} units) from ${destination.name}.`
                : isAppointment
                    ? "Your donation appointment was marked as not completed."
                    : "Your blood request was marked as not completed.",

        ...(isAppointment
            ? { appointmentId: record._id }
            : { bloodRequestId: record._id }),

        status: action,
        read: false,
    });
}



// --------------------------------------------------
// GET /api/completionActions
//
// Query example:
// ?destinationType=Hospital&destinationName=General%20Hospital%20Kochi
// --------------------------------------------------

router.get("/", async (req, res) => {
    try {
        const {
            destinationType,
            destinationId,
            destinationName,
        } = req.query;

        const normalizedType = normalizeType(destinationType);

        if (!normalizedType) {
            return res.status(400).json({
                success: false,
                message: "destinationType must be Hospital or BloodBank.",
            });
        }

        if (!destinationId && !destinationName) {
            return res.status(400).json({
                success: false,
                message: "Destination ID or name is required.",
            });
        }

        const isHospital = normalizedType === "Hospital";
        const nameQuery = destinationName
            ? exactName(destinationName)
            : null;

        const appointmentConditions = [];
        const requestConditions = [];

        if (destinationId) {
            appointmentConditions.push(
                { destinationId },
                { hospitalId: destinationId }
            );

            requestConditions.push(
                { requestToId: destinationId },
                { hospitalId: destinationId }
            );
        }

        if (nameQuery) {
            appointmentConditions.push(
                { destinationName: nameQuery }
            );

            requestConditions.push(
                { requestToName: nameQuery }
            );

            // Existing records use "hospital".
            if (isHospital) {
                appointmentConditions.push({
                    hospital: nameQuery,
                });

                requestConditions.push({
                    hospital: nameQuery,
                });
            }
        }

        const appointmentTypeConditions = isHospital
            ? [
                { destinationType: "Hospital" },
                { destinationType: { $exists: false } },
                { destinationType: null },
            ]
            : [
                { destinationType: "BloodBank" },
                { destinationType: "Blood Bank" },
                { destinationType: "bloodbank" },
                { destinationType: "blood_bank" },
            ];

        const requestTypeConditions = isHospital
            ? [
                { requestToType: "Hospital" },
                { requestToType: { $exists: false } },
                { requestToType: null },
            ]
            : [
                { requestToType: "BloodBank" },
                { requestToType: "Blood Bank" },
                { requestToType: "bloodbank" },
                { requestToType: "blood_bank" },
            ];

        const [appointments, bloodRequests] = await Promise.all([
            Appointment.find({
                status: "Confirmed",
                $and: [
                    { $or: appointmentTypeConditions },
                    { $or: appointmentConditions },
                ],
            })
                .sort({ createdAt: -1 })
                .lean(),

            BloodRequest.find({
                status: { $in: ["Approved", "Confirmed"] },
                $and: [
                    { $or: requestTypeConditions },
                    { $or: requestConditions },
                ],
            })
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        const data = [
            ...appointments.map((item) => ({
                ...item,
                recordType: "appointment",
                personName: item.donorName || item.fullName || "Donor",
                personEmail: personEmail(item),
                destination:
                    item.destinationName || item.hospital || "",
            })),

            ...bloodRequests.map((item) => ({
                ...item,
                recordType: "bloodRequest",
                personName: item.recipientName || "Recipient",
                personEmail: personEmail(item),
                destination:
                    item.requestToName || item.hospital || "",
            })),
        ].sort(
            (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
        );

        console.log("Completion API:", {
            destinationType: normalizedType,
            destinationName,
            destinationId,
            appointmentsFound: appointments.length,
            bloodRequestsFound: bloodRequests.length,
        });

        return res.json({
            success: true,
            count: data.length,
            data,
        });
    } catch (error) {
        console.error("Completion GET error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch completion records.",
        });
    }
});

// --------------------------------------------------
// POST /api/completionActions/:recordType/:id
//
// Body:
// { "action": "Done" }
// { "action": "Not Done" }
// --------------------------------------------------

router.post("/:recordType/:id", async (req, res) => {
    const { recordType, id } = req.params;
    const action = String(req.body.action || "").trim();

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid record ID.",
        });
    }

    if (!["appointment", "bloodRequest"].includes(recordType)) {
        return res.status(400).json({
            success: false,
            message: "Invalid record type.",
        });
    }

    if (!["Done", "Not Done"].includes(action)) {
        return res.status(400).json({
            success: false,
            message: 'Action must be "Done" or "Not Done".',
        });
    }

    const Model =
        recordType === "appointment"
            ? Appointment
            : BloodRequest;

    // Confirmed appointments can be processed once.
    // Completed appointments are not claimable again.
    const allowedStatuses =
        recordType === "appointment"
            ? ["Confirmed"]
            : ["Approved", "Confirmed"];

    let record = null;
    let destination = null;
    let originalStatus = null;
    let inventoryBefore = null;
    let inventoryChanged = false;
    let inventoryWasCreated = false;
    let inventoryFilter = null;
    let bloodGroup = "";
    let units = 0;

    try {
        // Atomic claim prevents two simultaneous clicks from
        // processing the same record.
        record = await Model.findOneAndUpdate(
            {
                _id: id,
                status: { $in: allowedStatuses },
            },
            {
                $set: { status: "Processing" },
            },
            {
                new: false,
            }
        );

        if (!record) {
            return res.status(409).json({
                success: false,
                message:
                    "Record not found, already processed, or status is not eligible. Refresh the page and try again.",
            });
        }

        originalStatus = record.status;

        const destinationInfo = getDestination(record, recordType);

        destination = await resolveDestination(
            destinationInfo.type,
            destinationInfo.id,
            destinationInfo.name
        );

        if (action === "Not Done") {
            const result = await Model.updateOne(
                { _id: id, status: "Processing" },
                { $set: { status: "Not Done" } }
            );

            if (result.modifiedCount !== 1) {
                throw new Error("Could not update the record status.");
            }

            try {
                await notifyCompletion(
                    record,
                    recordType,
                    "Not Done",
                    destination,
                    Number(record.units || 1)
                );
            } catch (notificationError) {
                console.error(
                    "Notification creation failed:",
                    notificationError
                );
            }

            return res.json({
                success: true,
                message: "Record marked Not Done. Inventory was not changed.",
                data: {
                    id: record._id,
                    status: "Not Done",
                },
            });
        }

        bloodGroup = String(record.bloodGroup || "")
            .trim()
            .toUpperCase();

        units =
            recordType === "appointment"
                ? 1
                : Number(record.units);

        const validBloodGroups = [
            "A+", "A-", "B+", "B-",
            "AB+", "AB-", "O+", "O-",
        ];

        if (!validBloodGroups.includes(bloodGroup)) {
            throw new Error(
                `Invalid blood group: "${record.bloodGroup || ""}".`
            );
        }

        if (!Number.isInteger(units) || units < 1) {
            throw new Error("Invalid number of blood units.");
        }

        inventoryFilter = {
            hospitalEmail: destination.email,
            bloodGroup,
        };

        if (recordType === "appointment") {
            // A completed donation adds one unit.
            const existingInventory = await BloodInventory.findOne(
                inventoryFilter
            ).lean();

            if (existingInventory) {
                inventoryBefore = {
                    exists: true,
                    id: existingInventory._id,
                    units: existingInventory.units,
                    date: existingInventory.date,
                    hospitalName: existingInventory.hospitalName,
                };

                const updatedInventory =
                    await BloodInventory.findOneAndUpdate(
                        inventoryFilter,
                        {
                            $inc: { units: 1 },
                            $set: {
                                date: new Date(),
                                hospitalName: destination.name,
                            },
                        },
                        { new: true }
                    );

                if (!updatedInventory) {
                    throw new Error("Inventory update failed.");
                }
            } else {
                inventoryBefore = { exists: false };

                await BloodInventory.create({
                    ...inventoryFilter,
                    units: 1,
                    date: new Date(),
                    hospitalName: destination.name,
                });

                inventoryWasCreated = true;
            }

            inventoryChanged = true;
        } else {
            // A completed blood request deducts the requested units.
            const existingInventory = await BloodInventory.findOne(
                inventoryFilter
            ).lean();

            if (!existingInventory) {
                throw new Error(
                    `${bloodGroup} inventory was not found at ${destination.name}.`
                );
            }

            inventoryBefore = {
                exists: true,
                id: existingInventory._id,
                units: existingInventory.units,
                date: existingInventory.date,
                hospitalName: existingInventory.hospitalName,
            };

            const updatedInventory =
                await BloodInventory.findOneAndUpdate(
                    {
                        ...inventoryFilter,
                        units: { $gte: units },
                    },
                    {
                        $inc: { units: -units },
                        $set: { date: new Date() },
                    },
                    { new: true }
                );

            if (!updatedInventory) {
                throw new Error(
                    `Insufficient ${bloodGroup} inventory.Required: ${units} unit(s).`
                );
            }

            inventoryChanged = true;
        }

        // Finalize only if this request still owns the Processing status.
        const finalized = await Model.updateOne(
            { _id: id, status: "Processing" },
            { $set: { status: "Done" } }
        );

        if (finalized.modifiedCount !== 1) {
            throw new Error("Could not finalize the record.");
        }

        try {
            await notifyCompletion(
                record,
                recordType,
                "Done",
                destination,
                units
            );
        } catch (notificationError) {
            console.error(
                "Notification creation failed:",
                notificationError
            );
        }

        return res.json({
            success: true,
            message:
                recordType === "appointment"
                    ? "Appointment completed. Inventory increased by 1 unit."
                    : `Blood request completed.Inventory decreased by ${units} unit(s).`,
            data: {
                id: record._id,
                status: "Done",
                destination: destination.name,
                bloodGroup,
                units,
            },
        });
    } catch (error) {
        console.error("Completion POST error:", error);

        // Roll back inventory if an error occurs after it was changed.
        if (inventoryChanged && inventoryBefore && inventoryFilter) {
            try {
                if (inventoryBefore.exists) {
                    await BloodInventory.updateOne(
                        { _id: inventoryBefore.id },
                        {
                            $set: {
                                units: inventoryBefore.units,
                                date: inventoryBefore.date,
                                hospitalName: inventoryBefore.hospitalName,
                            },
                        }
                    );
                } else if (inventoryWasCreated) {
                    await BloodInventory.deleteOne({
                        ...inventoryFilter,
                        units: 1,
                    });
                }
            } catch (rollbackError) {
                console.error(
                    "Inventory rollback failed:",
                    rollbackError
                );
            }
        }

        // Restore the original status so the operation can be retried.
        if (record && originalStatus) {
            try {
                await Model.updateOne(
                    { _id: id, status: "Processing" },
                    { $set: { status: originalStatus } }
                );
            } catch (statusError) {
                console.error(
                    "Status restoration failed:",
                    statusError
                );
            }
        }

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to process completion action.",
        });
    }
});

module.exports = router;
