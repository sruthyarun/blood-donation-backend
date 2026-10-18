const express = require("express");

const {
    donorLogin,
    recipientLogin,
} = require("../controllers/authController");

const router = express.Router();

router.post("/donor/login", donorLogin);
router.post("/recipient/login", recipientLogin);
router.post("/hospital/login", hospitalLogin);

module.exports = router;