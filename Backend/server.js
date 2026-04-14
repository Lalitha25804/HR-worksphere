const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// ROUTES
const employeeRoutes = require("./routes/employees");
const attendanceRoutes = require("./routes/attendance");
const payrollRoutes = require("./routes/payroll");
const leaveRoutes = require("./routes/leave");
const authRoutes = require("./routes/auth");
const settingsRoutes = require("./routes/settings");
const notificationRoutes = require("./routes/notifications");
const uploadRoutes = require("./routes/upload");
const path = require("path");


const app = express();

// DB
connectDB();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// TEST
app.get("/", (req, res) => {
  res.send("API running");
});

// ROUTES
app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/payroll", payrollRoutes);
app.use("/leave", leaveRoutes);
app.use("/settings", settingsRoutes);
app.use("/notifications", notificationRoutes);
app.use("/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});