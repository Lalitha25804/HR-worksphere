const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  getAttendance,
  getMyAttendance
} = require("../controllers/attendanceController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 EMPLOYEE ACTIONS
router.post("/checkin", auth, role("Employee"), checkIn);
router.post("/checkout", auth, role("Employee"), checkOut);

// 🔥 HR + MANAGER VIEW ALL
router.get("/", auth, role("HR", "Manager"), getAttendance);

// 🔥 EMPLOYEE VIEW OWN
router.get("/me", auth, role("Employee"), getMyAttendance);

module.exports = router;