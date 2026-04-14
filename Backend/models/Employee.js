const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  dept: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  baseSalary: {
    type: Number,
    required: true
  },
  pfPercentage: {
    type: Number,
    default: 12
  },
  taxPercentage: {
    type: Number,
    default: 10
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null
  },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);