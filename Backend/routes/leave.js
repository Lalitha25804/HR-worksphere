const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require("../controllers/leaveController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 EMPLOYEE + MANAGER (Personal Scope)
router.post("/apply", auth, role("Employee", "Manager"), applyLeave);
router.get("/me", auth, role("Employee", "Manager"), getMyLeaves);

// 🔥 HR + MANAGER
router.get("/", auth, role("HR", "Manager"), getAllLeaves);
router.put("/:id", auth, role("HR", "Manager"), updateLeaveStatus);

module.exports = router;