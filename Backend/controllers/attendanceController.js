const Attendance = require("../models/Attendance");
const Settings = require("../models/Settings");

// 🔥 CHECK-IN
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    // ❌ Already checked in
    const existing = await Attendance.findOne({ employeeId, date: today });

    if (existing) {
      return res.status(400).json({
        error: "Already checked in today"
      });
    }

    const checkInTime = new Date();
    let lateMin = 0;

    // 🔥 DYNAMIC SETTINGS: LATE CHECK
    const settings = await Settings.findOne();
    if (settings?.companySettings?.workStartTime && settings?.attendanceRules?.lateAfterMinutes) {
      const startParts = settings.companySettings.workStartTime.split(":");
      const expectedStart = new Date();
      expectedStart.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0);

      const diffMs = checkInTime - expectedStart;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins > settings.attendanceRules.lateAfterMinutes) {
        lateMin = diffMins;
      }
    }

    // 🔥 DYNAMIC SETTINGS: INSTANT SHIFT & ALLOWANCE DETECTION
    let shiftNameAssigned = "Standard";
    let allowanceAssigned = 0;
    
    if (settings?.shiftSettings?.shifts?.length > 0) {
      const currentHour = checkInTime.getHours();
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
      shiftNameAssigned = pickedShift.name;
      allowanceAssigned = pickedShift.allowance || 0;
    }

    const attendance = await Attendance.create({
      employeeId,
      date: today,
      checkIn: checkInTime,
      lateMinutes: lateMin,
      status: lateMin > 0 ? "Present (Late)" : "Present",
      shift: shiftNameAssigned,
      allowance: allowanceAssigned
    });

    res.json({
      message: "Check-in successful",
      attendance
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 CHECK-OUT (WITH HOURS)
exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({ employeeId, date: today });

    if (!attendance) {
      return res.status(400).json({
        error: "No check-in found"
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        error: "Already checked out"
      });
    }

    // ✅ Set checkout time
    attendance.checkOut = new Date();

    // 🔥 CALCULATE WORKING HOURS
    const diff = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    attendance.hoursWorked = Number(diff.toFixed(2));

    // 🔥 DYNAMIC SETTINGS: OVERTIME & SHIFT ALLOWANCE
    // (Shift & Allowance were already set during checkIn, but we re-fetch overtime)
    const settings = await Settings.findOne() || {};

    let overtimeAmount = 0;
    if (settings.attendanceRules?.overtimeAfterHours && attendance.hoursWorked > settings.attendanceRules.overtimeAfterHours) {
      overtimeAmount = Number((attendance.hoursWorked - settings.attendanceRules.overtimeAfterHours).toFixed(2));
    }
    attendance.overtime = overtimeAmount;

    await attendance.save();

    res.json({
      message: "Check-out successful",
      attendance
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 GET ATTENDANCE (HR / Manager)
exports.getAttendance = async (req, res) => {
  try {
    const Employee = require("../models/Employee");
    let filter = {};

    // 🔥 HIERARCHY SECURITY: Map managers to exclusively query check-ins tied to their roster
    if (req.user && req.user.role === "Manager") {
      const myTeam = await Employee.find({ managerId: req.user.id }).select("_id");
      filter.employeeId = { $in: myTeam.map(m => m._id) };
    }

    const data = await Attendance.find(filter)
      .populate("employeeId", "name empId dept")
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 GET MY ATTENDANCE (Employee)
exports.getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const data = await Attendance.find({ employeeId })
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};