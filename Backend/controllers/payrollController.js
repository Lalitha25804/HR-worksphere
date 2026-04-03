const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Settings = require("../models/Settings");

// 🔥 GET PAYROLL
exports.getPayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        error: "Month and year are required"
      });
    }

    // Role Mapping Verification Block
    if (req.user.role !== "HR" && req.user.role !== "Manager" && req.user.id !== employeeId) {
       return res.status(403).json({ error: "Access Denied: You cannot view foreign financial records." });
    }

    const m = parseInt(month) - 1;
    const y = parseInt(year);

    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59);

    // FETCH GLOBALS
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found." });
    }
    const settings = await Settings.findOne() || {};

    // 🔥 ATTENDANCE DATA
    const records = await Attendance.find({
      employeeId,
      checkIn: { $gte: startDate, $lte: endDate },
      checkOut: { $ne: null }
    });

    let totalWorkHours = 0;
    let totalOvertime = 0;
    let totalAllowance = 0;
    let uniqueShifts = new Set();

    records.forEach((rec) => {
      totalWorkHours += rec.hoursWorked || 0;
      totalOvertime += rec.overtime || 0;
      totalAllowance += rec.allowance || 0;
      
      let actualShift = rec.shift;
      // Retroactive inference for extremely old records labeled 'Standard'
      if ((!actualShift || actualShift === "Standard") && rec.checkIn && settings.shiftSettings?.shifts?.length > 0) {
         const currentHour = new Date(rec.checkIn).getHours();
         let pickedShift = settings.shiftSettings.shifts[0];
         let minDiff = 24;
         settings.shiftSettings.shifts.forEach(shift => {
             const shiftHour = parseInt(shift.start.split(":")[0]);
             let hourDiff = Math.abs(currentHour - shiftHour);
             if (hourDiff > 12) hourDiff = 24 - hourDiff;
             if (hourDiff < minDiff) {
               minDiff = hourDiff;
               pickedShift = shift;
             }
         });
         actualShift = pickedShift.name;
      }
      
      if (actualShift && actualShift !== "Standard") {
         uniqueShifts.add(actualShift);
      }
    });
    const workedShifts = Array.from(uniqueShifts).join(", ") || "-";

    totalWorkHours = parseFloat(totalWorkHours.toFixed(2));
    totalOvertime = parseFloat(totalOvertime.toFixed(2));

    let grossSalary = employee.baseSalary || 0;

    // 🔥 LEAVE DATA
    const leaves = await Leave.find({
      employeeId,
      fromDate: { $gte: startDate },
      toDate: { $lte: endDate },
      status: "Approved"
    });

    // Count accurate leave days taken in this month
    let leaveDays = 0;
    leaves.forEach(l => {
       const start = new Date(l.fromDate);
       const end = new Date(l.toDate);
       leaveDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    });

    // 🔥 CALCULATE DEDUCTIONS
    let deduction = 0;
    const isDeductionEnabled = settings.leavePolicy ? settings.leavePolicy.leaveDeductionPerDay : true;
    
    // Per day wage = baseSalary / 30
    const dailyWage = grossSalary / 30;

    if (isDeductionEnabled) {
      deduction = leaveDays * dailyWage;
    }

    // 🔥 ADD OVERTIME & ALLOWANCES (1.5x default OT pay)
    const fullDayConfig = settings.attendanceRules?.fullDayHours || 8;
    const hourlyWage = dailyWage / fullDayConfig;
    const overtimePay = totalOvertime * hourlyWage * 1.5; 
    
    let salaryBeforeTaxes = grossSalary + totalAllowance + overtimePay - deduction;

    // 🔥 PF AND TAXES (If active in settings OR Employee Profile)
    const pfPercentage = employee.pfPercentage || settings.payrollSettings?.pfPercent || 12;
    const taxPercentage = employee.taxPercentage || settings.payrollSettings?.taxPercent || 10;

    const pfAmount = salaryBeforeTaxes * (pfPercentage / 100);
    const taxAmount = salaryBeforeTaxes * (taxPercentage / 100);

    let netSalary = salaryBeforeTaxes - pfAmount - taxAmount;
    
    // final round
    netSalary = parseFloat(netSalary.toFixed(2));
    deduction = parseFloat(deduction.toFixed(2));

    res.json({
      employeeId,
      month,
      year,
      totalWorkHours,
      totalOvertime,
      totalAllowance,
      leaveDays,
      deduction,
      grossSalary,
      pfAmount: parseFloat(pfAmount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      salary: netSalary,
      workedShifts
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};