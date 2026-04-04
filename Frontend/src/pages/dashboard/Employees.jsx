import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { attendanceLogs } from "../../data/attendanceLogs";
import { getEmployeesAPI, updateEmployeeAPI } from "../../api/employeesApi";

const Employees = () => {

  const location = useLocation();

  /* DATA */

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* STATES */

  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("All");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [month, setMonth] = useState("2026-03");

  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 4;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "", email: "", dept: "", role: "Employee", baseSalary: 0, pfPercentage: 12, taxPercentage: 10, isActive: true
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await getEmployeesAPI();
      const withAvatars = data.map((emp, idx) => ({
        ...emp,
        id: emp._id,
        salary: emp.baseSalary,
        avatar: `https://i.pravatar.cc/40?img=${idx % 10}`
      }));
      setEmployees(withAvatars);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to fetch employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openEditModal = (emp) => {
    setEditingId(emp._id);
    setEditFormData({
      name: emp.name,
      email: emp.email,
      dept: emp.dept,
      role: emp.role,
      baseSalary: emp.salary, // from logic above, emp.salary is mapped to baseSalary
      pfPercentage: emp.pfPercentage || 12,
      taxPercentage: emp.taxPercentage || 10,
      isActive: emp.isActive !== undefined ? emp.isActive : true
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateEmployeeAPI(editingId, editFormData);
      await fetchEmployees();
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Failed to update employee.");
    }
  };

  /* SEARCH FROM URL */

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  /* FILTER */

  let filteredEmployees = employees.filter(emp => {

    const q = search.toLowerCase();

    return (
      emp.name.toLowerCase().includes(q) ||
      emp.empId.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.dept.toLowerCase().includes(q)
    );

  });

  /* APPLY ALL / SELECTED */

  const finalEmployees =
    reportType === "Selected"
      ? filteredEmployees.filter(e => selectedEmployees.includes(e.id))
      : filteredEmployees;

  /* PAGINATION */

  const indexOfLast = currentPage * employeesPerPage;
  const currentEmployees =
    finalEmployees.slice(indexOfLast - employeesPerPage, indexOfLast);

  const totalPages =
    Math.ceil(finalEmployees.length / employeesPerPage);

  /* CHECKBOX */

  const toggleEmployee = (id)=>{
    setSelectedEmployees(prev =>
      prev.includes(id)
        ? prev.filter(e=>e!==id)
        : [...prev,id]
    );
  };

  const selectAll = ()=>{
    selectedEmployees.length===finalEmployees.length
      ? setSelectedEmployees([])
      : setSelectedEmployees(finalEmployees.map(e=>e.id));
  };

  /* 🔥 CORRECT SUMMARY LOGIC */

  const getSummary = (emp) => {

    const logs = attendanceLogs.filter(l =>
      (emp.empId ? l.empId === emp.empId : true) && l.date.startsWith(month)
    );

    let present = 0;
    let leave = 0;
    let ot = 0;
    let allowance = 0;

    logs.forEach(log => {

      if (!log.checkin || !log.checkout) {
        leave++;
        return;
      }

      present++;

      /* ✅ FIXED TIME PARSING */
      const [inH, inM] = log.checkin.split(":").map(Number);
      const [outHRaw, outM] = log.checkout.split(":").map(Number);

      let inTime = inH + inM / 60;
      let outTime = outHRaw + outM / 60;

      if (outTime < inTime) outTime += 24;

      const hours = outTime - inTime;

      if (hours <= 0 || hours > 16) return;

      /* SHIFT END */

      let shiftEnd = 18;

      if (inTime < 9) shiftEnd = 16;
      else if (inTime < 13) shiftEnd = 18;
      else if (inTime < 20) shiftEnd = 23;
      else shiftEnd = 7 + 24;

      if (shiftEnd < inTime) shiftEnd += 24;

      /* OT */

      if (outTime > shiftEnd) {
        ot += (outTime - shiftEnd);
      }

      /* ALLOWANCE */

      if (inTime >= 20 || inTime < 6) {
        allowance += hours >= 6 ? 500 : hours * 50;
      }
      else if (inTime >= 13) {
        allowance += hours >= 6 ? 200 : hours * 30;
      }

    });

    const otPay = ot * 200;

    const payroll =
      emp.salary + allowance + otPay;

    return {
      present,
      leave,
      ot: Math.round(ot),
      allowance: Math.round(allowance),
      otPay: Math.round(otPay),
      payroll: Math.round(payroll)
    };
  };

  /* EXPORT */

  const exportCSV = () => {

    let csv = "EmpID,Name,Dept,Role,Manager,Present,Leave,OT,Salary,Allowance,OT Pay,Net\n";

    finalEmployees.forEach(e=>{

      const s = getSummary(e);
      const managerName = e.role === "Manager" ? "null" : (e.managerId?.name || "Unassigned");

      csv += [
        e.empId,
        `"${e.name}"`,
        e.dept,
        e.role,
        `"${managerName}"`,
        s.present,
        s.leave,
        s.ot,
        e.salary,
        s.allowance,
        s.otPay,
        s.payroll
      ].join(",") + "\n";

    });

    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${month}_employee_report.csv`;
    a.click();

  };

  /* UI */

  return (

    <div className="space-y-6 text-white">

      <div className="flex justify-between items-center">

        <h2 className="text-2xl font-bold">Employees</h2>

        <div className="flex gap-3">

          <button
            onClick={exportCSV}
            className="bg-white/10 border border-white/20 px-4 py-2 rounded">
            Download
          </button>

          <Link
            to="/hr-dashboard/add-employee"
            className="bg-indigo-600 px-5 py-2 rounded">
            + Add
          </Link>

        </div>

      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-300/40 text-red-200">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-10 text-white/60">
          Loading employees...
        </div>
      )}

      {!loading && employees.length === 0 && (
        <div className="text-center py-10 text-white/60">
          No employees found. <Link to="/hr-dashboard/add-employee" className="text-indigo-400">Add one</Link>
        </div>
      )}

      {!loading && employees.length > 0 && (
        <>

      {/* FILTER */}

      <div className="flex gap-4 bg-white/10 p-4 rounded-xl">

        <input
          placeholder="Search..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-900 rounded"
        />

        <input
          type="month"
          value={month}
          onChange={(e)=>setMonth(e.target.value)}
          className="px-4 py-2 bg-slate-900 rounded"
        />

        <select
          value={reportType}
          onChange={(e)=>setReportType(e.target.value)}
          className="px-4 py-2 bg-slate-900 rounded"
        >
          <option>All</option>
          <option>Selected</option>
        </select>

      </div>

      {/* TABLE */}

      <div className="bg-white/10 rounded-xl overflow-hidden border border-white/10">

        <div className="max-h-[420px] overflow-y-auto">

          <table className="w-full text-sm table-fixed">

            <thead className="sticky top-0 bg-slate-900 text-gray-300">
              <tr>

                <th className="w-[50px] text-center py-3">
                  <input
                    type="checkbox"
                    onChange={selectAll}
                    checked={selectedEmployees.length===finalEmployees.length}
                  />
                </th>

                <th className="px-3 text-left">Emp ID</th>
                <th className="px-3 text-left">Employee</th>
                <th className="px-3 text-left">Role</th>
                <th className="px-3 text-left">Manager</th>
                <th className="text-center">Dept</th>

                <th className="text-center">P</th>
                <th className="text-center">L</th>
                <th className="text-center">OT</th>

                <th className="text-center">Salary</th>
                <th className="text-center">Allowance</th>
                <th className="text-center">OT ₹</th>
                <th className="text-center">Net</th>
                <th className="text-center">Actions</th>

              </tr>
            </thead>

            <tbody>

              {currentEmployees.map(emp=>{

                const s = getSummary(emp);

                return(

                  <tr key={emp.id} className="border-t border-white/10 hover:bg-white/5">

                    <td className="text-center py-3">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={()=>toggleEmployee(emp.id)}
                      />
                    </td>

                    <td className="px-3 py-3">{emp.empId}</td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} className="w-8 h-8 rounded-full"/>
                        <span>{emp.name}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3">{emp.role}</td>

                    <td className="px-3 py-3 text-xs">
                      {emp.role === "Manager" ? (
                         <span className="text-white/40 italic">null</span>
                      ) : (
                         emp.managerId?.name ? (
                           <span className="text-indigo-300">{emp.managerId.name}</span>
                         ) : (
                           <span className="text-white/40 italic">Unassigned</span>
                         )
                      )}
                    </td>

                    <td className="text-center py-3">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                        {emp.dept}
                      </span>
                    </td>

                    <td className="text-center">{s.present}</td>
                    <td className="text-center text-red-400">{s.leave}</td>
                    <td className="text-center text-purple-400">{s.ot}</td>

                    <td className="text-center">₹{(emp.salary || 0).toLocaleString()}</td>
                    <td className="text-center text-blue-400">₹{s.allowance}</td>
                    <td className="text-center text-purple-400">₹{s.otPay}</td>

                    <td className="text-center text-green-400 font-semibold">
                      ₹{s.payroll.toLocaleString()}
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 transition text-xs font-semibold"
                      >
                        Edit
                      </button>
                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </div>

      {/* PAGINATION */}

      <div className="flex justify-end gap-2">

        {[...Array(totalPages)].map((_,i)=>(
          <button
            key={i}
            onClick={()=>setCurrentPage(i+1)}
            className={`px-3 py-1 rounded ${
              currentPage===i+1
                ? "bg-indigo-600"
                : "bg-slate-800"
            }`}>
            {i+1}
          </button>
        ))}

      </div>

        </>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-white/20 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4 text-white">Edit Employee</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-xs text-white/60 mb-1 block">Department</label>
                  <input
                    type="text"
                    value={editFormData.dept}
                    onChange={(e) => setEditFormData({ ...editFormData, dept: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-xs text-white/60 mb-1 block">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none text-white"
                  >
                    <option className="text-black">Employee</option>
                    <option className="text-black">Manager</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Base Salary (₹)</label>
                <input
                  type="number"
                  value={editFormData.baseSalary}
                  onChange={(e) => setEditFormData({ ...editFormData, baseSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 transition text-sm font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>

  );

};

export default Employees;