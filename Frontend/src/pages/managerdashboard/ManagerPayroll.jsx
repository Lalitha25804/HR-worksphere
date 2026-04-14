import { useState, useMemo, useEffect } from "react";
import { getAllAttendanceAPI } from "../../api/attendanceApi";
import { getEmployeesAPI } from "../../api/employeesApi";

const ManagerPayroll = () => {

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date Config
  const todayDate = new Date();
  const currentMonthNum = String(todayDate.getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(todayDate.getFullYear());

  const [selMonth, setSelMonth] = useState(currentMonthNum);
  const [selYear, setSelYear] = useState(currentYearStr);

  const monthStr = `${selYear}-${selMonth}`;

  // Search Filter
  const [search, setSearch] = useState("");

  // 🔥 Pull Networks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empRes, attRes] = await Promise.all([
          getEmployeesAPI(),
          getAllAttendanceAPI()
        ]);
        setEmployees(empRes.data || []);
        setAttendance(attRes.data || []);
      } catch (err) {
        console.error("Payroll aggregation failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔥 Construct Payroll Aggregation Matrix
  const flattenedMatrix = useMemo(() => {
    if (!employees.length) return [];

    let start = new Date(`${monthStr}-01T00:00:00`);
    let end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

    if (start.getMonth() === todayDate.getMonth() && start.getFullYear() === todayDate.getFullYear()) {
       end = todayDate; // Cap forward calculation limits to today
    }

    const targetDates = [];
    let cur = new Date(start);
    while (cur <= end) {
       if (cur.getDay() !== 0 && cur.getDay() !== 6) {
          targetDates.push(cur.toISOString().split("T")[0]);
       }
       cur.setDate(cur.getDate() + 1);
    }

    const generated = [];

    employees.forEach(emp => {
          let sumAllowance = 0;
          let sumOT = 0;
          let sumDeduction = 0;
          let uniqueShifts = new Set();
          
          const baseSalary = parseFloat(emp.baseSalary || 30000);
          const baseDailyRate = baseSalary / 30.0;
          const baseHourlyRate = baseDailyRate / 8.0;

          // Process each target day
          targetDates.forEach(dateStr => {
             const record = attendance.find(a => a.employeeId?._id === emp._id && a.date === dateStr);
             
             let derivedStatus = "Absent";
             let hoursNum = 0.0;
             let shiftStr = "Standard";

             if (record) {
                hoursNum = parseFloat(record.hoursWorked) || 0;
                if (hoursNum > 0 && hoursNum < 4.0) derivedStatus = "Half Day";
                else if (record.status?.toLowerCase().includes("leave")) derivedStatus = "Leave";
                else if (record.lateMinutes > 0) derivedStatus = "Late";
                else derivedStatus = "Present";

                shiftStr = record.shift || "Morning";
             }

             // Aggregations
             if (derivedStatus !== "Absent" && derivedStatus !== "Leave") {
                 uniqueShifts.add(shiftStr);
                 if (shiftStr === "Night") sumAllowance += 500.0;
                 if (shiftStr === "Evening") sumAllowance += 200.0;
             }

             if (hoursNum > 8.0) {
                 sumOT += (hoursNum - 8.0);
             }

             if (derivedStatus === "Absent") {
                 sumDeduction += baseDailyRate;
             } else if (derivedStatus === "Half Day") {
                 sumDeduction += (baseDailyRate * 0.5);
             }
          });

          // Final Payroll Calculation Blocks
          const extrapolatedOTPay = sumOT * baseHourlyRate * 1.5;
          const grossPay = baseSalary + sumAllowance + extrapolatedOTPay - sumDeduction;
          
          const pfRate = emp.pfPercentage || 12;
          const pfDeduction = grossPay * (pfRate / 100);

          const taxRate = emp.taxPercentage || 10;
          const taxDeduction = grossPay * (taxRate / 100);

          let finalNetPay = grossPay - pfDeduction - taxDeduction;
          if (finalNetPay < 0) finalNetPay = 0;

          generated.push({
             uid: emp._id,
             empId: emp.empId,
             name: emp.name,
             shiftLog: uniqueShifts.size > 0 ? Array.from(uniqueShifts).join(", ") : "None",
             base: baseSalary,
             pf: pfDeduction,
             tax: taxDeduction,
             allowance: sumAllowance,
             ot: extrapolatedOTPay,
             deduction: sumDeduction,
             payroll: finalNetPay
          });
    });

    return generated.sort((a,b) => b.payroll - a.payroll); // High to low implicitly
  }, [employees, attendance, monthStr]);

  // Apply Sub-Filters
  const filteredGrid = useMemo(() => {
    return flattenedMatrix.filter(r => {
       const s = search.toLowerCase();
       return (r.name?.toLowerCase().includes(s) || false) || (r.empId?.toLowerCase().includes(s) || false);
    });
  }, [flattenedMatrix, search]);

  // Main UI Calculators
  let totalPaid = 0;
  let highest = 0;
  let lowest = Infinity;

  filteredGrid.forEach(f => {
      totalPaid += f.payroll;
      if (f.payroll > highest) highest = f.payroll;
      if (f.payroll < lowest) lowest = f.payroll;
  });

  if (filteredGrid.length === 0) lowest = 0;
  let averagePaid = filteredGrid.length > 0 ? (totalPaid / filteredGrid.length) : 0;

  // Render & Format specific components inline
  const INRF = (num) => `₹${num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const downloadReport = () => {
    let csv = "Emp ID,Name,Shifts,Base Salary,PF,Tax,Shift Allowance,Overtime Pay,Leave Deduction,Total Net Payroll\n";
    filteredGrid.forEach(e => {
      csv += `"${e.empId}","${e.name}","${e.shiftLog}",${e.base},${e.pf.toFixed(2)},${e.tax.toFixed(2)},${e.allowance.toFixed(2)},${e.ot.toFixed(2)},${e.deduction.toFixed(2)},${e.payroll.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payroll_Export_${monthStr}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPayslip = (empData) => {
    let csv = `PAYSLIP GENERATED FOR: ${monthStr}\n\n`;
    csv += `Employee ID,${empData.empId}\n`;
    csv += `Name,${empData.name}\n`;
    csv += `Shift Configurations,${empData.shiftLog}\n\n`;
    csv += `EARNINGS\n`;
    csv += `Base Salary,${empData.base.toFixed(2)}\n`;
    csv += `Shift Allowance Bonus,${empData.allowance.toFixed(2)}\n`;
    csv += `Overtime Compensation (1.5x Hourly),${empData.ot.toFixed(2)}\n\n`;
    csv += `DEDUCTIONS\n`;
    csv += `Absentee Deductions,${empData.deduction.toFixed(2)}\n`;
    csv += `Provident Fund (PF),${empData.pf.toFixed(2)}\n`;
    csv += `Tax Profile Withheld,${empData.tax.toFixed(2)}\n\n`;
    csv += `=============================\n`;
    csv += `FINAL NET DISBURSEMENT,${INRF(empData.payroll)}\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payslip_${empData.empId}_${monthStr}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-white p-6">Authenticating Global Payroll Nodes...</div>;

  return (
    <div className="space-y-6 text-white mt-6">
      
      <h2 className="text-2xl font-bold">Team Payroll Evaluation Hub</h2>

      {/* SUMMARY WIDGETS */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-emerald-900/40 border border-emerald-500/30 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-emerald-300/80 text-sm font-medium tracking-wide">Total Salary Paid</p>
          <p className="text-3xl font-bold mt-2 text-emerald-400 drop-shadow-md">{INRF(totalPaid)}</p>
        </div>
        <div className="bg-indigo-900/30 border border-indigo-500/30 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-indigo-300/80 text-sm font-medium tracking-wide">Average Salary</p>
          <p className="text-3xl font-bold mt-2 text-indigo-400 drop-shadow-md">{INRF(averagePaid)}</p>
        </div>
        <div className="bg-purple-900/40 border border-purple-500/30 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-purple-300/80 text-sm font-medium tracking-wide">Highest Salary</p>
          <p className="text-3xl font-bold mt-2 text-purple-400 drop-shadow-md">{INRF(highest)}</p>
        </div>
        <div className="bg-orange-900/40 border border-orange-500/30 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-orange-300/80 text-sm font-medium tracking-wide">Lowest Salary</p>
          <p className="text-3xl font-bold mt-2 text-orange-400 drop-shadow-md">{INRF(lowest)}</p>
        </div>
      </div>

      {/* FILTER & METADATA BAR */}
      <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 items-center justify-between">
        <input 
              placeholder="Search Name/ID..." 
              value={search} onChange={e=>setSearch(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
        />

        <div className="flex gap-3 items-center bg-black/30 p-2 rounded-lg border border-white/5">
            <select value={selMonth} onChange={(e)=>setSelMonth(e.target.value)} className="px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-sm text-indigo-200">
                {Array.from({length: 12}, (_, i) => {
                    const m = String(i + 1).padStart(2, '0');
                    const isDisabled = (Number(selYear) === Number(currentYearStr) && (i + 1) > Number(currentMonthNum));
                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    return <option key={m} value={m} disabled={isDisabled}>{monthNames[i]}</option>;
                })}
            </select>
            
            <select value={selYear} onChange={(e)=>setSelYear(e.target.value)} className="px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-sm text-indigo-200">
                {[2024, 2025, 2026, 2027, 2028].filter(y => y <= Number(currentYearStr)).map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
        </div>

        <button onClick={downloadReport} className="bg-emerald-700/80 hover:bg-emerald-600 px-6 py-2 rounded-lg border border-emerald-500/50 shadow-lg whitespace-nowrap font-semibold">
          📥 Download Global Report
        </button>
      </div>

      {/* DYNAMIC PAYROLL TABLE */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800 text-gray-300 border-b border-white/20 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 w-28">Emp ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Shift Span</th>
                <th className="p-4 text-emerald-300/70 border-l border-white/5">Base (₹)</th>
                <th className="p-4 text-orange-200/70">PF (₹)</th>
                <th className="p-4 text-orange-200/70">Tax (₹)</th>
                <th className="p-4 text-emerald-200">Allowance (₹)</th>
                <th className="p-4 text-emerald-200">OT (₹)</th>
                <th className="p-4 text-red-300">Deduction (₹)</th>
                <th className="p-4 text-purple-300 border-l border-white/10 font-bold bg-white/5 right-0 sticky">Total Payroll</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredGrid.length === 0 ? (
                 <tr><td colSpan="11" className="p-8 text-center text-white/50 italic flex-1">No employees evaluated for this temporal matrix.</td></tr>
              ) : filteredGrid.map((row) => (
                <tr key={row.uid} className="hover:bg-white/5 transition">
                  <td className="p-4 font-mono text-indigo-300 text-xs">{row.empId}</td>
                  <td className="p-4 font-semibold">{row.name}</td>
                  
                  <td className="p-4 text-white/60 text-xs tracking-wider">{row.shiftLog}</td>
                  
                  <td className="p-4 font-mono text-emerald-100/50 border-l border-white/5">{row.base.toFixed(2)}</td>
                  <td className="p-4 font-mono text-orange-100/60">{row.pf.toFixed(2)}</td>
                  <td className="p-4 font-mono text-orange-100/60">{row.tax.toFixed(2)}</td>
                  <td className="p-4 font-mono text-emerald-200/90">{row.allowance.toFixed(2)}</td>
                  <td className="p-4 font-mono text-emerald-200/90">{row.ot.toFixed(2)}</td>
                  
                  <td className="p-4 font-mono text-red-300">{row.deduction.toFixed(2)}</td>

                  <td className="p-4 font-mono font-bold text-purple-300 bg-white/5 border-l border-white/5 right-0 sticky backdrop-blur-md">
                     {INRF(row.payroll)}
                  </td>

                  <td className="p-4 text-center">
                    <button onClick={() => downloadPayslip(row)} className="text-indigo-400 border border-indigo-500/30 px-3 py-1 bg-white/5 rounded-lg hover:bg-indigo-600 hover:text-white transition whitespace-nowrap text-xs shadow-sm font-semibold">
                      📄 Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ManagerPayroll;