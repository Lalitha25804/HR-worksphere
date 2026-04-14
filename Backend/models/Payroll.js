const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  totalWorkHours: {
    type: Number,
    default: 0,
  },
  totalOvertime: {
    type: Number,
    default: 0,
  },
  totalAllowance: {
    type: Number,
    default: 0,
  },
  leaveDays: {
    type: Number,
    default: 0,
  },
  deduction: {
    type: Number,
    default: 0,
  },
  grossSalary: {
    type: Number,
    default: 0,
  },
  pfAmount: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  salary: {
    type: Number,
    default: 0,
  },
  workedShifts: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed'],
    default: 'Processed',
  }
}, { timestamps: true });

// Avoid duplicate processed payrolls for the same employee, month, year
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
