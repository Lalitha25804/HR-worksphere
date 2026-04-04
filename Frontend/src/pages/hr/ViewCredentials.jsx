import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getEmployeesAPI, updateEmployeeAPI } from "../../api/employeesApi";

const ViewCredentials = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await getEmployeesAPI();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.empId.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "All" || emp.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleBlock = async (emp) => {
    try {
      setLoading(true);
      const payload = {
        name: emp.name,
        email: emp.email,
        dept: emp.dept,
        role: emp.role,
        baseSalary: emp.baseSalary,
        pfPercentage: emp.pfPercentage,
        taxPercentage: emp.taxPercentage,
        managerId: emp.managerId?._id || emp.managerId || null,
        isActive: emp.isActive === false ? true : false
      };
      await updateEmployeeAPI(emp._id, payload);
      await fetchEmployees();
    } catch (err) {
      alert("Failed to update status. Please ensure all data is intact.");
      setLoading(false);
    }
  };

  const downloadAsCSV = () => {
    let csv = "Employee ID,Name,Email,Role,Login Link,Username,Password\n";
    
    filtered.forEach(emp => {
      const loginLink = emp.role === "Employee" ? "/employee-login" : "/manager-login";
      csv += `${emp.empId},"${emp.name}",${emp.email},${emp.role},"${loginLink}",${emp.email},"[Share password separately]"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credentials_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 text-white">

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employee & Manager Credentials</h2>
        <button
          onClick={downloadAsCSV}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          Download CSV
        </button>
      </div>

      <p className="text-sm text-gray-300">
        📝 Here are all your added employees and managers with their login details. Share credentials securely with them.
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-300/40 text-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name/email/ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 flex-1 bg-white/10 border border-white/20 rounded"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded"
        >
          <option>All</option>
          <option>Employee</option>
          <option>Manager</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-white/60">Loading credentials...</div>
      ) : (
        <div className="bg-white/10 border border-white/20 rounded-2xl overflow-auto max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 sticky top-0 text-white/70">
              <tr>
                <th className="px-4 py-3 text-left">EmpID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Login Link</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-white/50">
                    No employees found matching the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <motion.tr key={emp._id} className="border-t border-white/10">
                    <td className="px-4 py-3">{emp.empId}</td>
                    <td className="px-4 py-3">{emp.name}</td>
                    <td className="px-4 py-3 text-yellow-300 font-mono">{emp.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        emp.role === "Employee" ? "bg-green-600" : "bg-purple-600"
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {emp.role === "Employee" ? "/employee-login" : "/manager-login"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{emp.email}</td>
                    <td className="px-4 py-3 text-xs">
                      <button
                        onClick={() => handleBlock(emp)}
                        className={`px-3 py-1 rounded transition text-xs font-semibold ${
                          emp.isActive === false
                            ? "bg-stone-500/30 text-stone-300 hover:bg-stone-500/50"
                            : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        }`}
                      >
                        {emp.isActive === false ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-300/40 text-blue-100 text-sm">
        <p><strong>💡 How to share credentials:</strong></p>
        <ul className="list-disc ml-5 mt-2">
          <li>Share <strong>email</strong> and <strong>password</strong> via secure channel (WhatsApp, Email, Slack, etc.)</li>
          <li>Employee login page: <code className="bg-black/30 px-2 py-1 rounded">/employee-login</code></li>
          <li>Manager login page: <code className="bg-black/30 px-2 py-1 rounded">/manager-login</code></li>
          <li>Never share credentials in plain text over unsecured channels</li>
        </ul>
      </div>

    </div>
  );
};

export default ViewCredentials;
