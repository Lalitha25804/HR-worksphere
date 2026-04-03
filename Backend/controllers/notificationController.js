const Notification = require("../models/Notification");

// 🔥 GET MY NOTIFICATIONS
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // limit payload overhead

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 MARK ALL AS READ
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    
    res.json({ message: "Notifications synchronized." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
