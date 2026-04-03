const express = require("express");
const router = express.Router();

const {
  addEmployee,
  bulkAddEmployees,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeesController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 CREATE (HR only)
router.post("/", auth, role("HR"), addEmployee);

// 🔥 BULK CREATE (HR only)
router.post("/bulk", auth, role("HR"), bulkAddEmployees);

// 🔥 READ ALL (HR + Manager)
router.get("/", auth, role("HR", "Manager"), getEmployees);

// 🔥 READ ONE
router.get("/:id", auth, role("HR", "Manager"), getEmployeeById);

// 🔥 UPDATE (HR + Manager limit enforced at controller)
router.put("/:id", auth, role("HR", "Manager"), updateEmployee);

// 🔥 DELETE (HR only)
router.delete("/:id", auth, role("HR"), deleteEmployee);

module.exports = router;