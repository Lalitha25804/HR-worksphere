const Employee = require("../models/Employee");

// 🔥 CREATE EMPLOYEE
exports.addEmployee = async (req, res) => {
  try {
    const { name, email, dept, role, baseSalary, pfPercentage, taxPercentage, managerId } = req.body;

    // ✅ Validation
    if (!name || !email || !dept || !role || !baseSalary) {
      return res.status(400).json({
        error: "Name, Email, Department, Role, and Base Salary are required"
      });
    }

    // 🔴 Check duplicate email
    const exists = await Employee.findOne({ email });
    if (exists) {
      return res.status(400).json({
        error: "Email already exists"
      });
    }

    // Generate empId
    const empCount = await Employee.countDocuments();
    const empId = `EMP${String(empCount + 1).padStart(4, '0')}`;

    const employee = await Employee.create({
      empId,
      name,
      email,
      dept,
      role,
      baseSalary,
      pfPercentage: pfPercentage || 12,
      taxPercentage: taxPercentage || 10,
      managerId: role === "Employee" ? (managerId || null) : null
    });

    res.status(201).json(employee);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 BULK CREATE EMPLOYEES
exports.bulkAddEmployees = async (req, res) => {
  try {
    const employeesData = req.body;
    
    if (!Array.isArray(employeesData) || employeesData.length === 0) {
      return res.status(400).json({ error: "Invalid or empty data provided" });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors = [];
    const validEmployees = [];

    const empCountStart = await Employee.countDocuments();
    let currentCount = empCountStart;

    for (const emp of employeesData) {
      const { name, email, dept, role, baseSalary, pfPercentage, taxPercentage } = emp;
      
      if (!name || !email || !dept || !role || !baseSalary) {
        failedCount++;
        errors.push(`Missing required fields for entry: ${name || email || 'Unknown'}`);
        continue;
      }
      
      const exists = await Employee.findOne({ email });
      if (exists) {
        failedCount++;
        errors.push(`Email already exists: ${email}`);
        continue;
      }
      
      currentCount++;
      const empId = `EMP${String(currentCount).padStart(4, '0')}`;
      
      validEmployees.push({
        empId,
        name,
        email,
        dept,
        role,
        baseSalary: parseFloat(baseSalary) || 0,
        pfPercentage: parseFloat(pfPercentage) || 12,
        taxPercentage: parseFloat(taxPercentage) || 10
      });
    }

    if (validEmployees.length > 0) {
      await Employee.insertMany(validEmployees);
      successCount = validEmployees.length;
    }

    res.status(201).json({
      message: `Processed ${employeesData.length} records.`,
      successCount,
      failedCount,
      errors,
      addedEmployees: validEmployees
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 GET ALL EMPLOYEES (with optional email & role filter)
exports.getEmployees = async (req, res) => {
  try {
    const { email, role } = req.query;
    const filter = {};

    if (email) filter.email = email;
    if (role) filter.role = role;

    // 🔥 HIERARCHY SECURITY: Lock managers into exclusively seeing their dedicated roster.
    if (req.user && req.user.role === "Manager") {
      filter.managerId = req.user.id;
    }

    const employees = await Employee.find(filter)
      .populate("managerId", "name empId")
      .sort({ createdAt: -1 });
      
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 GET SINGLE EMPLOYEE
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found"
      });
    }

    res.json(employee);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {
  try {
    const { name, email, dept, role, baseSalary, pfPercentage, taxPercentage, managerId, isActive } = req.body;

    // ✅ Validation
    if (!name || !email || !dept || !role || !baseSalary) {
      return res.status(400).json({
        error: "Name, Email, Department, Role, and Base Salary are required"
      });
    }

    const updatePayload = { name, email, dept, role, baseSalary, pfPercentage, taxPercentage, managerId: role === "Employee" ? (managerId || null) : null };
    if (isActive !== undefined) {
      updatePayload.isActive = isActive;
    }

    // 🔒 Enforce Manager Edit Hierarchy (Managers cannot edit HR or employees belonging to other managers)
    if (req.user.role === "Manager") {
       const existingTarget = await Employee.findById(req.params.id);
       if (!existingTarget || existingTarget.managerId?.toString() !== req.user.id) {
          return res.status(403).json({ error: "Access Denied: You can only modify your explicitly assigned Team Members." });
       }
    }

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        error: "Employee not found"
      });
    }

    // 🔒 Synchronize identity block state backward to User authentication object!
    if (isActive !== undefined) {
       const User = require("../models/User");
       await User.findOneAndUpdate({ email: updated.email }, { isActive });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔥 DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        error: "Employee not found"
      });
    }

    res.json({
      message: "Employee deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};