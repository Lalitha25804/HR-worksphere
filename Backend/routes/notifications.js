const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAllRead
} = require("../controllers/notificationController");

const auth = require("../middleware/authMiddleware");

// All roles interact with their own personal localized notifications
router.get("/", auth, getMyNotifications);
router.put("/read", auth, markAllRead);

module.exports = router;
