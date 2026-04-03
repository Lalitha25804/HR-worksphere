const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token, access denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // natively contains id + role

    // 🔥 BACKWARDS-COMPATIBILITY BUGFIX:
    // If an employee's JWT token contains a generic `User._id` instead of 
    // an `Employee._id`, MongoDB `.populate()` will fail to resolve their details on HR dashboards.
    // We intercept the invalid ID here and auto-swap it using their strict Email match.
    if (decoded.role !== "HR") {
       let isUserObj = null;
       try {
         isUserObj = await User.findById(decoded.id);
       } catch (e) { /* ignore invalid obj cast */ }
       
       if (isUserObj) {
           const mappedEmp = await Employee.findOne({ email: isUserObj.email });
           if (mappedEmp) {
               req.user.id = mappedEmp._id; // Force all subsequent controllers to use the true Identity ID!
           }
       }
    }

    next();

  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};