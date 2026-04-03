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

// 🔥 EMPLOYEE
router.post("/apply", auth, role("Employee"), applyLeave);
router.get("/me", auth, role("Employee"), getMyLeaves);

// 🔥 HR + MANAGER
router.get("/", auth, role("HR", "Manager"), getAllLeaves);
router.put("/:id", auth, role("HR", "Manager"), updateLeaveStatus);

module.exports = router;