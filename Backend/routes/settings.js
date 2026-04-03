const express = require("express");
const router = express.Router();

const { getSettings, updateSettings } = require("../controllers/settingsController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 GET Settings (Any authed user can read, logic relies on it)
router.get("/", auth, getSettings);

// 🔥 POST Settings (Only HR can update global settings)
router.post("/", auth, role("HR"), updateSettings);

module.exports = router;
