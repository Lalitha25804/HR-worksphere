const mongoose = require("mongoose");
const User = require("./models/User");
const Employee = require("./models/Employee");
const Attendance = require("./models/Attendance");
const Leave = require("./models/Leave");
require("dotenv").config({path: "./.env"});

// This CLI script surgically repairs corrupted UI "Unknown" mapping glitches 
// caused by the old AuthController logging User IDs instead of Employee ID references
mongoose.connect(process.env.MONGO_URI).then(async () => {
   console.log("Connected to MongoDB for Database Migration...");
   let correctedAttendance = 0;
   let correctedLeaves = 0;

   // 1. Target all generic Staff Member identities (Managers and Employees)
   const users = await User.find({ role: { $ne: "HR" } });
   
   for (let user of users) {
       // 2. Discover their true, underlying Employee database object match
       const emp = await Employee.findOne({ email: user.email });
       if (emp) {
           // 3. Purge the raw string/User ID from the Attendance array and securely graft the Object-compliant reference payload.
           const attUpdate = await Attendance.updateMany({ employeeId: user._id }, { $set: { employeeId: emp._id } });
           correctedAttendance += attUpdate.modifiedCount;

           // 4. Mirror the ID string mapping overwrite to the Leave Request collections globally
           const leaveUpdate = await Leave.updateMany({ employeeId: user._id }, { $set: { employeeId: emp._id } });
           correctedLeaves += leaveUpdate.modifiedCount;
       }
   }
   
   console.log(`Migration Complete! Validated and correctly mapped ${correctedAttendance} attendance sheets and ${correctedLeaves} active leave requests.`);
   process.exit(0);
}).catch(err => {
   console.error("Migration fatal crash: ", err);
   process.exit(1);
});
