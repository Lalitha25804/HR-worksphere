const express = require("express");
const router = express.Router();

const { getPayroll } = require("../controllers/payrollController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 ALL ROLES CAN ATTEMPT TO FETCH (Secured actively by Controller ID verification limits)
router.get("/:employeeId", auth, getPayroll);

module.exports = router;