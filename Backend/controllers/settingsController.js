const Settings = require("../models/Settings");

// 🔥 GET GLOBAL SETTINGS
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create defaults if it doesn't exist yet
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 UPDATE GLOBAL SETTINGS
exports.updateSettings = async (req, res) => {
  try {
    const { companySettings, shiftSettings, payrollSettings, leavePolicy, attendanceRules } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    if (companySettings) settings.companySettings = companySettings;
    if (shiftSettings) settings.shiftSettings = shiftSettings;
    if (payrollSettings) settings.payrollSettings = payrollSettings;
    if (leavePolicy) settings.leavePolicy = leavePolicy;
    if (attendanceRules) settings.attendanceRules = attendanceRules;
    
    await settings.save();
    
    res.json({ message: "Settings updated successfully", settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
