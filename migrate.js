const mongoose = require("mongoose");
const User = require("./Backend/models/User");
const Employee = require("./Backend/models/Employee");
const Attendance = require("./Backend/models/Attendance");
const Leave = require("./Backend/models/Leave");
require("dotenv").config({path: "./Backend/.env"});

mongoose.connect(process.env.MONGO_URI).then(async () => {
   console.log("Connected to MongoDB for Database Migration...");
   let correctedAttendance = 0;
   let correctedLeaves = 0;

   const users = await User.find({ role: { $ne: "HR" } });
   
   for (let user of users) {
       const emp = await Employee.findOne({ email: user.email });
       if (emp) {
           const attUpdate = await Attendance.updateMany({ employeeId: user._id }, { $set: { employeeId: emp._id } });
           correctedAttendance += attUpdate.modifiedCount;

           const leaveUpdate = await Leave.updateMany({ employeeId: user._id }, { $set: { employeeId: emp._id } });
           correctedLeaves += leaveUpdate.modifiedCount;
       }
   }
   
   console.log(`Migration Complete! Corrected ${correctedAttendance} attendance records and ${correctedLeaves} leave requests.`);
   process.exit(0);
}).catch(err => {
   console.error(err);
   process.exit(1);
});
