const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
const Employee = require("./models/Employee");
const Attendance = require("./models/Attendance");
const Settings = require("./models/Settings");
const Leave = require("./models/Leave");

async function fixAndSeed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const settings = await Settings.findOne() || {};
    const shifts = settings.shiftSettings?.shifts || [
      { name: "Morning", start: "09:00", end: "18:00", allowance: 0 },
      { name: "Evening", start: "14:00", end: "23:00", allowance: 150 },
      { name: "Night", start: "22:00", end: "06:00", allowance: 400 }
    ];

    const employees = await Employee.find(); // All employees
    if (!employees || employees.length === 0) {
      console.log("No employees found.");
      process.exit(0);
    }

    // 1. Fix employees base salary and clean bogus leaves causing negative payroll
    for (let emp of employees) {
       let updated = false;
       if (!emp.baseSalary || emp.baseSalary <= 0 || emp.baseSalary < 20000 || emp.baseSalary > 10000000) {
           emp.baseSalary = 50000 + Math.floor(Math.random() * 50000);
           updated = true;
       }
       if (emp.pfPercentage > 100 || emp.pfPercentage < 0) { emp.pfPercentage = 12; updated = true; }
       if (emp.taxPercentage > 100 || emp.taxPercentage < 0) { emp.taxPercentage = 10; updated = true; }
       if (updated) await emp.save();
    }

    // Also we delete leaves that span months and result in massive deductions
    const allLeaves = await Leave.find();
    for (let leave of allLeaves) {
       const durationMs = new Date(leave.toDate) - new Date(leave.fromDate);
       const days = durationMs / (1000 * 60 * 60 * 24);
       if (days > 30 || days < 0 || isNaN(days)) {
           console.log(`Deleting bogus leave: ${days} days`);
           await Leave.deleteOne({ _id: leave._id });
       }
    }

    // 2. Generate varied shifts, including TODAY, so that Present Today = Total Employees
    let generatedCount = 0;
    
    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];

        // Seed for 0 to 5 days ago (0 = today)
        for (let j = 0; j <= 5; j++) { 
            const dateObj = new Date();
            dateObj.setDate(dateObj.getDate() - j);
            const dateStr = dateObj.toISOString().split("T")[0];
            
            // Clear prior generated attendance for this date
            await Attendance.deleteMany({ employeeId: emp._id, date: dateStr });

            // Pick a shift (varied based on employee index and day)
            const shift = shifts[(i + j) % shifts.length]; // cycle through shifts
            const startStr = shift.start; // e.g. "09:00"
            const endStr = shift.end;     // e.g. "18:00"

            const checkInTime = new Date(dateObj);
            checkInTime.setHours(parseInt(startStr.split(":")[0]), parseInt(startStr.split(":")[1]), 0);
            checkInTime.setMinutes(checkInTime.getMinutes() + Math.floor(Math.random() * 10));

            const checkOutTime = new Date(dateObj);
            let checkOutHour = parseInt(endStr.split(":")[0]);
            
            if (checkOutHour < parseInt(startStr.split(":")[0])) {
               checkOutTime.setDate(checkOutTime.getDate() + 1);
            }
            checkOutTime.setHours(checkOutHour, parseInt(endStr.split(":")[1]), 0);
            checkOutTime.setMinutes(checkOutTime.getMinutes() + Math.floor(Math.random() * 15));

            const diff = (checkOutTime - checkInTime) / (1000 * 60 * 60);
            let hoursWorked = Number(diff.toFixed(2));
            if (hoursWorked < 0) hoursWorked += 24;

            let overtimeAmount = 0;
            if (settings.attendanceRules?.overtimeAfterHours && hoursWorked > settings.attendanceRules.overtimeAfterHours) {
              overtimeAmount = Number((hoursWorked - settings.attendanceRules.overtimeAfterHours).toFixed(2));
            }

            // Provide null checkout for today if desired, but providing proper checkout makes payroll calculable instantly
            await Attendance.create({
                employeeId: emp._id,
                date: dateStr,
                checkIn: checkInTime,
                checkOut: checkOutTime, // Keep it simple by giving checkOut for today so they have hours logged
                hoursWorked: hoursWorked,
                overtime: overtimeAmount,
                allowance: shift.allowance || 0,
                lateMinutes: 0,
                shift: shift.name,
                status: "Present"
            });
            generatedCount++;
        }
    }

    console.log(`Successfully generated ${generatedCount} attendance records for all ${employees.length} employees with varied shifts!`);
    console.log("Cleaned employees salaries and bogus leaves to ensure positive payroll.");
    process.exit(0);

  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
}

fixAndSeed();
