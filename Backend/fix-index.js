const mongoose = require("mongoose");
require("dotenv").config({path: "./.env"});

mongoose.connect(process.env.MONGO_URI).then(async () => {
   console.log("Connected to MongoDB to purge cached legacy indexes...");
   
   const db = mongoose.connection.db;
   
   try {
     // MongoDB does not automatically drop old unique indexes when Schemas are rewritten.
     // We are manually tearing down the ghost "user_1_date_1" index that causes E11000 errors!
     await db.collection("attendances").dropIndex("user_1_date_1");
     console.log("SUCCESS: Orphaned static index 'user_1_date_1' successfully destroyed from the attendances collection!");
   } catch (e) {
     console.log("Notice: Legacy index already dropped or not found: ", e.message);
   }

   try {
     // Now we securely construct the modern replacement index guarding double check-ins!
     const Attendance = require("./models/Attendance");
     await Attendance.collection.createIndex({ employeeId: 1, date: 1 }, { unique: true });
     console.log("SUCCESS: Modern valid 'employeeId_1_date_1' unique compound restriction properly mapped.");
   } catch (e) {
     console.log("Notice: Modern index routing error: ", e.message);
   }

   process.exit(0);
}).catch(err => {
   console.error("Fatal failure connecting to host cluster:", err);
   process.exit(1);
});
