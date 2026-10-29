
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const donorRoutes = require("./routes/donorRoutes");
const recipientRoutes = require("./routes/recipientRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const bloodBankRoutes = require("./routes/bloodBankRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const bloodInventoryRoutes = require("./routes/bloodInventoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const donationCampRoutes = require("./routes/donationCampRoutes");
const emergencyRequestRoutes = require("./routes/emergencyRequestRoutes");
const completionActionsRoutes = require(
    "./routes/completionActions"
);

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Blood Donation API is running",
    });
});

// API routes
app.use("/api/donors", donorRoutes);
app.use("/api/recipients", recipientRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/bloodBanks", bloodBankRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/bloodRequests", bloodRequestRoutes);
app.use("/api/bloodInventory", bloodInventoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/donationCamps", donationCampRoutes);
app.use(
    "/api/emergencyRequests",
    require("./routes/emergencyRequestRoutes")
);

app.use("/api/emergencyRequests", emergencyRequestRoutes);

app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/donationCamps", donationCampRoutes);
app.use(
    "/api/completionActions",
    completionActionsRoutes
);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} `);
        });
    } catch (error) {
        console.error(
            "Failed to connect to MongoDB:",
            error.message
        );

        process.exit(1);
    }
};

startServer();
