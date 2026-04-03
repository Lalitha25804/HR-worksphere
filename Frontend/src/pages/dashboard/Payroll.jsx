import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { getEmployeesAPI } from "../../api/employeesApi";
import { getPayrollAPI } from "../../api/payrollApi";

const Payroll = () => {
  const currentDate = new Date();
  const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(defaultMonth);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [reportType, setReportType] = useState("All");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [processedPayroll, setProcessedPayroll] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [payrollCache, setPayrollCache] = useState({});
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchEmployeesAndPayroll();
  }, [month]); // re-fetch if month changes

  const fetchEmployeesAndPayroll = async () => {
    setLoading(true);
    try {
      // 1. Fetch live employees
      const empRes = await getEmployeesAPI();
      const emps = empRes.data;
      setEmployees(emps);

      // 2. Fetch specific payroll computations for this month dynamically!
      const [yearStr, monthStr] = month.split("-");
      const cache = {};

      // Execute backend mathematics for every alive employee in parallel
      await Promise.all(
        emps.map(async (emp) => {
          try {
             const payRes = await getPayrollAPI(emp._id, monthStr, yearStr);
             cache[emp._id] = payRes.data;
          } catch (e) {
             console.error(`Error calculating payroll for ${emp.name}`, e);
             // Default safe payload if they lack attendance/records
             cache[emp._id] = {
                salary: 0,
                grossSalary: emp.baseSalary || 0,
                totalAllowance: 0,
                totalOvertime: 0,
                deduction: 0,
                leaveDays: 0,
                pfAmount: 0,
                taxAmount: 0
             };
          }
        })
      );
      
      setPayrollCache(cache);
    } catch (err) {
      console.error("Failed to fetch payroll data", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DEPARTMENTS LIST ---------------- */
  const departments = ["All", ...new Set(employees.map(e => e.dept).filter(Boolean))];

  /* ---------------- FILTER ---------------- */
  const filteredEmployees = employees.filter(emp => {
    const text = search.toLowerCase();
    const empName = emp.name ? emp.name.toLowerCase() : "";
    const empId = emp.empId ? emp.empId.toLowerCase() : "";

    return (
      (empName.includes(text) || empId.includes(text)) &&
      (department === "All" || emp.dept === department) &&
      (reportType === "Selected" ? selectedEmployees.includes(emp._id) : true)
    );
  });

  /* ---------------- PAGINATION ---------------- */
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredEmployees.slice(indexOfFirst, indexOfLast);

  /* ---------------- TOTALS ---------------- */
  const totalPayroll = filteredEmployees.reduce((sum, e) => {
    return sum + (payrollCache[e._id]?.salary || 0);
  }, 0);

  const totalOvertime = filteredEmployees.reduce((sum, e) => {
    return sum + (payrollCache[e._id]?.totalOvertime || 0);
  }, 0);

  const totalShift = filteredEmployees.reduce((sum, e) => {
    return sum + (payrollCache[e._id]?.totalAllowance || 0);
  }, 0);

  const totalBonus = 0; // standard mock behavior for bonus
  const totalLeave = filteredEmployees.reduce((sum, e) => {
    return sum + (payrollCache[e._id]?.deduction || 0);
  }, 0);

  /* ---------------- SELECT ---------------- */
  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const selectAllEmployees = () => {
    selectedEmployees.length === currentRows.length
      ? setSelectedEmployees([])
      : setSelectedEmployees(currentRows.map(e => e._id));
  };

  const generatePayrollForSelected = () => {
    if(selectedEmployees.length === 0){
      alert("Select employees first");
      return;
    }

    setProcessedPayroll(prev => [...new Set([...prev, ...selectedEmployees])]);
    alert("Payroll Processing Complete!");
  };

  /* ---------------- PAYSLIP ---------------- */
  const generatePayslip = (emp) => {
    const s = payrollCache[emp._id] || {};
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`HR WorkSphere Pvt Ltd`, 60, 20);

    doc.setFontSize(14);
    doc.text(`Payslip - ${month}`, 20, 40);
    
    doc.setFontSize(12);
    doc.text(`Employee ID: ${emp.empId || "EMP"}`, 20, 50);
    doc.text(`Employee Name: ${emp.name}`, 20, 60);
    doc.text(`Department: ${emp.dept || "N/A"}`, 20, 70);

    doc.line(20, 75, 190, 75);

    doc.text(`Base Salary:`, 20, 90);
    doc.text(`₹${s.grossSalary || 0}`, 150, 90);

    doc.text(`Shift Allowance:`, 20, 100);
    doc.text(`+ ₹${s.totalAllowance || 0}`, 150, 100);

    doc.text(`Overtime (hours factored inline):`, 20, 110);
    doc.text(`+ ₹0`, 150, 110);

    doc.text(`Leave Deductions:`, 20, 120);
    doc.text(`- ₹${s.deduction || 0}`, 150, 120);

    doc.text(`Taxes:`, 20, 130);
    doc.text(`- ₹${s.taxAmount || 0}`, 150, 130);

    doc.text(`Provident Fund:`, 20, 140);
    doc.text(`- ₹${s.pfAmount || 0}`, 150, 140);

    doc.line(20, 145, 190, 145);

    doc.setFontSize(14);
    doc.text(`Net Payable Salary:`, 20, 160);
    doc.text(`₹${s.salary || 0}`, 150, 160);

    doc.save(`${emp.empId || "EMP"}_${month}_Payslip.pdf`);
  };

  const downloadSelectedPayslips = () => {
    if(selectedEmployees.length === 0){
      alert("Select employees first");
      return;
    }
    employees
      .filter(emp => selectedEmployees.includes(emp._id))
      .forEach(emp => generatePayslip(emp));
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 text-white">
      <h2 className="text-2xl font-bold">Monthly Payroll Processing</h2>

      {/* CONTROLS */}
      <div className="flex gap-4 flex-wrap">
        <input type="month" value={month}
          onChange={(e)=>setMonth(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded outline-none"/>

        <input placeholder="Search employees..." value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded outline-none w-64"/>

        <select value={department}
          onChange={(e)=>setDepartment(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded outline-none">
          {departments.map((d, i) => (
             <option key={i} className="text-black" value={d}>{d}</option>
          ))}
        </select>

        <select value={reportType}
          onChange={(e)=>setReportType(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded outline-none">
          <option className="text-black">All</option>
          <option className="text-black">Selected</option>
        </select>

        <button onClick={generatePayrollForSelected}
          className="bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded font-medium">Generate Payroll</button>

        <button onClick={downloadSelectedPayslips}
          className="bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 rounded font-medium">Download PDFs</button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-5 gap-4">
        <Card title="Total Payroll" value={totalPayroll} color="text-green-400"/>
        <Card title="Total OT Hrs" value={totalOvertime} color="text-purple-400" prefix=""/>
        <Card title="Global Shift ₹" value={totalShift} color="text-blue-400"/>
        <Card title="Bonus Handed" value={totalBonus} color="text-indigo-400"/>
        <Card title="Leave Deductions" value={totalLeave} color="text-red-400"/>
      </div>

      {/* TABLE */}
      {loading ? (
          <div className="text-center py-10 text-white/60 text-lg">Calculating dynamic payroll logic across database...</div>
      ) : (
          <div className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-lg">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full table-fixed text-sm">
                <thead className="sticky top-0 bg-slate-900 border-b border-white/20 text-white/70">
                  <tr>
                    <th className="w-[50px] text-center py-3">
                      <input type="checkbox" onChange={selectAllEmployees} checked={currentRows.length > 0 && selectedEmployees.length === currentRows.length}/>
                    </th>
                    <th className="text-left py-3">EMP ID</th>
                    <th className="text-left py-3">Name</th>
                    <th className="text-center py-3">OT Hrs</th>
                    <th className="text-center py-3">Shift ₹</th>
                    <th className="text-center py-3">Leaves ₹</th>
                    <th className="text-center py-3">Net Pay</th>
                    <th className="text-center py-3">Status</th>
                    <th className="text-center py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentRows.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-8 text-white/50">No employees found.</td>
                      </tr>
                  ) : (
                    currentRows.map(emp => {
                      const s = payrollCache[emp._id] || {};
                      return (
                        <tr key={emp._id} className="border-b border-white/10 hover:bg-white/5 transition">
                          <td className="text-center py-3">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(emp._id)}
                              onChange={()=>toggleEmployee(emp._id)}
                            />
                          </td>
                          <td className="py-3 text-white/80">{emp.empId || "EMP"}</td>
                          <td className="py-3 font-semibold">{emp.name}</td>
                          <td className="text-center py-3 text-purple-300">{s.totalOvertime || 0}</td>
                          <td className="text-blue-400 text-center py-3">₹{s.totalAllowance || 0}</td>
                          <td className="text-red-400 text-center py-3">-₹{s.deduction || 0}</td>
                          <td className="text-green-400 text-center font-bold text-base">₹{(s.salary || 0).toLocaleString()}</td>
                          <td className="text-center py-3">
                            {processedPayroll.includes(emp._id)
                              ? <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-semibold">Processed</span>
                              : <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-semibold">Pending</span>}
                          </td>
                          <td className="text-center py-3">
                            <button
                              onClick={()=>generatePayslip(emp)}
                              className="bg-indigo-600 hover:bg-indigo-500 transition px-3 py-1.5 rounded text-xs font-bold shadow-md">
                              Payslip
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
      )}
    </div>
  );
};

const Card = ({title, value, color, prefix = "₹"}) => (
  <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-4 rounded-xl shadow-lg hover:bg-white/20 transition">
    <p className="text-white/60 text-sm mb-1">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>
      {prefix}{Number(value || 0).toLocaleString()}
    </p>
  </div>
);

export default Payroll;