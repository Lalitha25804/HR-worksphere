import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import employeeImg from "../../assets/addemployee.jpg";
import { addEmployeeAPI, createEmployeeUserAPI, createManagerUserAPI, getEmployeesAPI } from "../../api/employeesApi";

const AddEmployee = () => {

  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "",
    managerId: "",
    baseSalary: "",
    pfPercentage: "",
    taxPercentage: ""
  });

  const [managers, setManagers] = useState([]);

  useEffect(() => {
     const fetchManagers = async () => {
        try {
           const res = await getEmployeesAPI({ role: "Manager" });
           setManagers(res.data || []);
        } catch(err) {
           console.error("Failed to fetch managers", err);
        }
     };
     fetchManagers();
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [addedEmployee, setAddedEmployee] = useState(null);
  const [credentials, setCredentials] = useState(null);

  const handleChange = (e) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value
    });
  };

  const generatePassword = () => {
    const pwd = Math.random().toString(36).slice(-8);
    setEmployee({
      ...employee,
      password: pwd
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!employee.password) {
      setError("Password is required. Click 'Generate' to create one.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1️⃣ Create Employee record
      const payload = {
        name: employee.name,
        email: employee.email,
        dept: employee.department,
        role: employee.role,
        managerId: employee.role === "Employee" ? employee.managerId : null,
        baseSalary: parseFloat(employee.baseSalary),
        pfPercentage: employee.pfPercentage ? parseFloat(employee.pfPercentage) : 12,
        taxPercentage: employee.taxPercentage ? parseFloat(employee.taxPercentage) : 10
      };

      const employeeResponse = await addEmployeeAPI(payload);
      
      // 2️⃣ Create User account (for login)
      const userData = {
        name: employee.name,
        email: employee.email,
        password: employee.password,
        role: employee.role
      };

      let userResponse;
      if (employee.role === "Employee") {
        userResponse = await createEmployeeUserAPI(userData);
      } else if (employee.role === "Manager") {
        userResponse = await createManagerUserAPI(userData);
      }

      setSuccess(true);
      setAddedEmployee(employeeResponse.data);
      setCredentials({
        email: employee.email,
        password: employee.password,
        role: employee.role
      });
      
      setEmployee({
        name: "",
        email: "",
        password: "",
        department: "",
        role: "",
        managerId: "",
        baseSalary: "",
        pfPercentage: "",
        taxPercentage: ""
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="
    min-h-screen
    flex items-center justify-center
    p-6
    bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800
    ">

      {/* Glass Card */}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
        w-full max-w-3xl
        p-8
        rounded-2xl
        bg-white/10
        backdrop-blur-xl
        border border-white/20
        shadow-2xl shadow-black/40
        text-white
        "
      >

        {/* Profile Icon */}

        <div className="flex justify-center mb-6">

          <motion.div
            whileHover={{ scale: 1.08 }}
            className="
            w-24 h-24
            rounded-full
            bg-white/20
            backdrop-blur-md
            border border-white/30
            flex items-center justify-center
            shadow-lg
            "
          >

            <img
              src={employeeImg}
              alt="employee"
              className="w-20 h-20 object-cover rounded-full"
            />

          </motion.div>

        </div>

        {/* Title */}

        <h1 className="text-center text-2xl font-bold mb-8">
          Add New Employee
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-300/40 text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && addedEmployee && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-300/40 text-green-100"
          >
            <h3 className="font-semibold text-lg mb-3">✓ Employee Added Successfully!</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Employee ID:</strong> {addedEmployee.empId}</p>
              <p><strong>Name:</strong> {addedEmployee.name}</p>
              <p><strong>Email:</strong> {addedEmployee.email}</p>
              <p><strong>Department:</strong> {addedEmployee.dept}</p>
              <p><strong>Role:</strong> {addedEmployee.role}</p>
              <p><strong>Base Salary:</strong> ₹{addedEmployee.baseSalary?.toLocaleString()}</p>
              <p><strong>PF %:</strong> {addedEmployee.pfPercentage}%</p>
              <p><strong>Tax %:</strong> {addedEmployee.taxPercentage}%</p>
            </div>
            
            {credentials && (
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-300/40 rounded-lg">
                <p className="font-semibold mb-2">🔐 Login Credentials (Share with them):</p>
                <p className="text-xs"><strong>Email:</strong> {credentials.email}</p>
                <p className="text-xs"><strong>Password:</strong> {credentials.password}</p>
                <p className="text-xs mt-2"><strong>Login Page:</strong> {credentials.role === "Employee" ? "/employee-login" : "/manager-login"}</p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate("/hr-dashboard/employees")}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
              >
                View All Employees
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setAddedEmployee(null);
                  setCredentials(null);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
              >
                Add Another
              </button>
            </div>
          </motion.div>
        )}

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className={`grid grid-cols-2 gap-4 ${success ? 'opacity-50 pointer-events-none' : ''}`}
        >

          {/* --- SECTION 1: PERSONAL --- */}
          <div className="col-span-2 mt-2 mb-2">
            <h3 className="text-sm font-semibold text-indigo-300 tracking-wider uppercase border-b border-indigo-500/30 pb-2">
               Personal & Role
            </h3>
          </div>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={employee.name}
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 transition"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={employee.email}
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 transition"
          />

          <select
            name="department"
            value={employee.department}
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" className="text-black">Select Department</option>
            <option className="text-black">HR</option>
            <option className="text-black">Engineering</option>
            <option className="text-black">Marketing</option>
            <option className="text-black">Sales</option>
          </select>

          <select
            name="role"
            value={employee.role}
            onChange={(e) => {
               // Auto-clear assigned manager if they swap to Manager role abruptly
               setEmployee({
                  ...employee, 
                  role: e.target.value,
                  managerId: e.target.value === "Manager" ? "" : employee.managerId
               });
            }}
            className="p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" className="text-black">Select Role</option>
            <option className="text-black">Employee</option>
            <option className="text-black">Manager</option>
          </select>

          {/* Manager Assignment */}
          <select
            name="managerId"
            value={employee.managerId}
            onChange={handleChange}
            disabled={employee.role !== "Employee"}
            className={`p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-indigo-500 transition ${employee.role !== "Employee" ? 'opacity-40 cursor-not-allowed hidden' : ''}`}
          >
            <option value="" className="text-black">Assign Manager (Optional)</option>
            {managers.length === 0 ? (
               <option disabled className="text-black">No Managers Available</option>
            ) : (
               managers.map(m => (
                  <option key={m._id} value={m._id} className="text-black">
                     {m.name} ({m.dept})
                  </option>
               ))
            )}
          </select>

          <div className="flex gap-2 col-span-2">
            <input
              type="text"
              name="password"
              placeholder="Login Password"
              value={employee.password}
              onChange={handleChange}
              className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
            >
              Generate
            </button>
          </div>

          {/* --- SECTION 2: PAYROLL --- */}
          <div className="col-span-2 mt-6 mb-2">
            <h3 className="text-sm font-semibold text-green-400 tracking-wider uppercase border-b border-green-500/30 pb-2">
               Payroll & Deductions (Manual Override)
            </h3>
          </div>

          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 ml-1">Monthly Base Salary (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                name="baseSalary"
                placeholder="e.g. 45000"
                value={employee.baseSalary}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 ml-1">PF Deduction (%)</label>
              <input
                type="text"
                inputMode="numeric"
                name="pfPercentage"
                placeholder="Default: 12"
                value={employee.pfPercentage}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 ml-1">Tax Deduction (%)</label>
              <input
                type="text"
                inputMode="numeric"
                name="taxPercentage"
                placeholder="Default: 10"
                value={employee.taxPercentage}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>

          {/* Buttons */}

          <div className="col-span-2 flex justify-center gap-4 mt-6">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`
              px-6 py-2
              rounded-lg
              text-white
              transition
              ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30'}
              `}
            >
              {loading ? "Adding..." : "Add Employee"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="reset"
              className="
              px-6 py-2
              rounded-lg
              bg-gray-600
              hover:bg-gray-700
              text-white
              transition
              "
            >
              Reset
            </motion.button>

          </div>

        </form>

      </motion.div>

    </div>

  );

};

export default AddEmployee;