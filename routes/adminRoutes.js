
const express = require("express");

const {
    adminLogin,
    getAdmin,
    updateAdmin,
    changeAdminPassword,
} = require("../controllers/adminController");

const router = express.Router();

// Admin login
router.post("/login", adminLogin);

// Get admin profile
router.get("/", getAdmin);

// Update admin profile
router.put("/:id", updateAdmin);

// Change admin password
router.put("/:id/change-password", changeAdminPassword);

module.exports = router;
