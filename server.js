
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const donorRoutes = require("./routes/donorRoutes");
const recipientRoutes = require("./routes/recipientRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const bloodBankRoutes = require("./routes/bloodBankRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

// Updated request-size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "10mb"
}));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Blood Donation API is running",
    });
});

app.use("/api/donors", donorRoutes);
app.use("/api/recipients", recipientRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/bloodBanks", bloodBankRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});