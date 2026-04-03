const express = require("express");
const router = express.Router();

const { register, login, createEmployeeUser, createManager, getMe, updateProfile } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 PUBLIC LOGIN & REGISTER
router.post("/register", register);
router.post("/login", login);

// 🔥 HR ONLY - CREATE EMPLOYEE/MANAGER USERS
router.post("/create-employee-user", auth, role("HR"), createEmployeeUser);
router.post("/create-manager-user", auth, role("HR"), createManager);

// 🔥 UNIVERSAL PROFILE SYNC
router.get("/me", auth, getMe);
router.put("/update-profile", auth, updateProfile);

module.exports = router;