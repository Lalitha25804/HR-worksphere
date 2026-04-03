const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },

  date: {
    type: String, // YYYY-MM-DD
    required: true
  },

  checkIn: {
    type: Date
  },

  checkOut: {
    type: Date
  },
  hoursWorked: {
    type: Number
  },
  overtime: {
    type: Number,
    default: 0
  },
  allowance: {
    type: Number,
    default: 0
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  shift: {
    type: String,
    default: "Standard"
  },

  status: {
    type: String,
    enum: ["Present", "Present (Late)", "Late", "Absent", "Half Day", "Leave"],
    default: "Present"
  }

}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);