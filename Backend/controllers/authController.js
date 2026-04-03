const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔥 REGISTER (HR ONLY)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Force role to HR - no choice given
    const role = "HR";

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.json({
      message: "HR registered successfully",
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 CREATE MANAGER (HR ONLY)
exports.createManager = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Verify HR is logged in (middleware should check this)
    if (req.user.role !== "HR") {
      return res.status(403).json({ error: "Only HR can create managers" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashedPassword,
      role: "Manager"
    });

    res.json({
      message: "Manager created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 CREATE EMPLOYEE USER (HR ONLY) - for credentials
exports.createEmployeeUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // ✅ Verify HR is logged in
    if (req.user.role !== "HR") {
      return res.status(403).json({ error: "Only HR can create employee users" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashedPassword,
      role: "Employee"
    });

    res.json({
      message: "Employee user created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 LOGIN (CORE LOGIC)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: "Your account has been suspended by an Administrator." });
    }

    // 🔥 TOKEN WITH ROLE
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 IMPORTANT RESPONSE (used by frontend)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 UNIVERSAL GET PROFILE (Resolves Identity Mapping automatically)
exports.getMe = async (req, res) => {
  try {
    const Employee = require("../models/Employee");

    if (req.user.role === "HR") {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ error: "Profile not found" });
      return res.json(user);
    } else {
      const emp = await Employee.findById(req.user.id);
      if (!emp) return res.status(404).json({ error: "Employee Profile not found" });
      return res.json(emp);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 UNIVERSAL UPDATE PROFILE (Name, Phone, Address)
exports.updateProfile = async (req, res) => {
  try {
    const Employee = require("../models/Employee");
    const { name, phone, address } = req.body;

    // Reject entirely blank names to prevent rendering glitches
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Name cannot be absolutely empty" });
    }

    if (req.user.role === "HR") {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { name, phone, address },
        { new: true }
      ).select("-password");
      return res.json(updatedUser);
      
    } else {
      // 1. Update primary HR Employee Document
      const updatedEmp = await Employee.findByIdAndUpdate(
        req.user.id,
        { name, phone, address },
        { new: true }
      );

      // 2. Safely sync the visual user credential display name backward to Auth Collection
      if (updatedEmp) {
        await User.findOneAndUpdate({ email: updatedEmp.email }, { name });
      }

      return res.json(updatedEmp);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};