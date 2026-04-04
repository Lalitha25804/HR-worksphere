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

// 🔥 EMPLOYEE & MANAGER & HR ACTIONS
router.post("/checkin", auth, role("Employee", "Manager", "HR"), checkIn);
router.post("/checkout", auth, role("Employee", "Manager", "HR"), checkOut);

// 🔥 HR + MANAGER VIEW ALL
router.get("/", auth, role("HR", "Manager"), getAttendance);

// 🔥 EMPLOYEE & MANAGER VIEW OWN (HR FOR TARGET VIEW)
router.get("/me", auth, role("Employee", "Manager", "HR"), getMyAttendance);

module.exports = router;