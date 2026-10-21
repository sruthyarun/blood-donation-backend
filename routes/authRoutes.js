
const express = require("express");
const router = express.Router();

const {
    donorLogin,
    recipientLogin,
    hospitalLogin,
    bloodBankLogin,
} = require("../controllers/authController");

router.post("/donor/login", donorLogin);
router.post("/recipient/login", recipientLogin);
router.post("/hospital/login", hospitalLogin);
router.post("/bloodbank/login", bloodBankLogin);

module.exports = router;
