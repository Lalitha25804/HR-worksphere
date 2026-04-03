const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  name: String,
  start: String,
  end: String,
  allowance: Number
});

const settingsSchema = new mongoose.Schema({
  companySettings: {
    companyName: { type: String, default: "HR WorkSphere" },
    workingDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
    workStartTime: { type: String, default: "09:00" },
    workEndTime: { type: String, default: "18:00" },
    timezone: { type: String, default: "Asia/Kolkata" }
  },
  shiftSettings: {
    shifts: {
      type: [shiftSchema],
      default: [
        { name: "Morning", start: "09:00", end: "18:00", allowance: 0 },
        { name: "Evening", start: "14:00", end: "23:00", allowance: 150 },
        { name: "Night", start: "22:00", end: "06:00", allowance: 400 }
      ]
    }
  },
  payrollSettings: {
    pfPercent: { type: Number, default: 12 },
    taxPercent: { type: Number, default: 10 },
    hraPercent: { type: Number, default: 20 },
    salaryCycle: { type: String, default: "monthly" },
    bonusType: { type: String, default: "fixed" }
  },
  leavePolicy: {
    paidLeavesPerMonth: { type: Number, default: 2 },
    maxConsecutiveLeaves: { type: Number, default: 5 },
    leaveTypes: { type: [String], default: ["Sick", "Casual", "Paid"] },
    leaveApprovalRequired: { type: Boolean, default: true },
    leaveDeductionPerDay: { type: Boolean, default: true }
  },
  attendanceRules: {
    lateAfterMinutes: { type: Number, default: 15 },
    halfDayHours: { type: Number, default: 4 },
    fullDayHours: { type: Number, default: 8 },
    overtimeAfterHours: { type: Number, default: 8 }
  }
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
