const express = require("express");

const {
    createRecipient,
    getRecipients,
    getRecipientById,
    updateRecipient,
    deleteRecipient,
} = require("../controllers/recipientController");

const router = express.Router();

router.post("/", createRecipient);
router.get("/", getRecipients);
router.get("/:id", getRecipientById);
router.put("/:id", updateRecipient);
router.delete("/:id", deleteRecipient);

module.exports = router;