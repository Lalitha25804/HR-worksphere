const Leave = require("../models/Leave");
const Settings = require("../models/Settings");
const Notification = require("../models/Notification");

// 🔥 APPLY LEAVE (Employee)
exports.applyLeave = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const settings = await Settings.findOne();
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const daysRequested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (settings?.leavePolicy?.maxConsecutiveLeaves && daysRequested > settings.leavePolicy.maxConsecutiveLeaves) {
       return res.status(400).json({
         error: `Cannot apply for more than ${settings.leavePolicy.maxConsecutiveLeaves} consecutive leaves.`
       });
    }

    let initialStatus = "Pending";
    if (settings?.leavePolicy && settings.leavePolicy.leaveApprovalRequired === false) {
       initialStatus = "Approved";
    }

    const leave = await Leave.create({
      employeeId,
      fromDate,
      toDate,
      reason,
      status: initialStatus
    });

    res.json({
      message: "Leave applied successfully",
      leave
    });

    // Fire Employee Confirmation Alert
    try {
        await Notification.create({
            userId: employeeId,
            title: "Leave Initialized",
            message: `Your request for ${daysRequested} days off has been captured and is pending review.`
        });
    } catch(err) { console.error("Notification dispatch failed", err); }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 GET MY LEAVES (Employee)
exports.getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const leaves = await Leave.find({ employeeId })
      .sort({ createdAt: -1 });

    res.json(leaves);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 GET ALL LEAVES (HR / Manager)
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employeeId", "name email role")
      .sort({ createdAt: -1 });

    res.json(leaves);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 APPROVE / REJECT LEAVE
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status"
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({
        error: "Leave not found"
      });
    }

    res.json({
      message: `Leave ${status}`,
      leave
    });

    // Shoot Resolution Alert down to the Employee Dashboard
    try {
        await Notification.create({
            userId: leave.employeeId,
            title: "Leave Status Updated",
            message: `Your requested leave (Ref: ${leave._id.toString().slice(-4)}) has been formally ${status}.`
        });
    } catch(err) { console.error("Notification dispatch failed", err); }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};