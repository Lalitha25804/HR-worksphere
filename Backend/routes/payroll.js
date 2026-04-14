const express = require("express");
const router = express.Router();

const { getPayroll, processPayroll } = require("../controllers/payrollController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 PROCESS PAYROLL (Managers and HR only)
router.post("/process", auth, role(["HR", "Manager"]), processPayroll);

// 🔥 ALL ROLES CAN ATTEMPT TO FETCH (Secured actively by Controller ID verification limits)
router.get("/:employeeId", auth, getPayroll);

module.exports = router;