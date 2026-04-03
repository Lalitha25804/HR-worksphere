import { useState, useMemo, useEffect } from "react";
import { getAllAttendanceAPI } from "../../api/attendanceApi";
import { getEmployeesAPI } from "../../api/employeesApi";

const ManagerShifts = () => {

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [shiftFilter, setShiftFilter] = useState("All");
  
  // Date Config
  const todayDate = new Date();
  const currentMonthNum = String(todayDate.getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(todayDate.getFullYear());

  const [selMonth, setSelMonth] = useState(currentMonthNum);
  const [selYear, setSelYear] = useState(currentYearStr);

  const monthStr = `${selYear}-${selMonth}`;

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
        console.error("Shift financial matrix generation failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔥 Construct Financial Matrix
  const flattenedMatrix = useMemo(() => {
    if (!employees.length) return [];

    let start = new Date(`${monthStr}-01T00:00:00`);
    let end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

    if (start.getMonth() === todayDate.getMonth() && start.getFullYear() === todayDate.getFullYear()) {
       end = todayDate; // Cap to today
    }

    const targetDates = [];
    let cur = new Date(start);
    while (cur <= end) {
       // Omit weekends
       if (cur.getDay() !== 0 && cur.getDay() !== 6) {
          targetDates.push(cur.toISOString().split("T")[0]);
       }
       cur.setDate(cur.getDate() + 1);
    }

    const generated = [];
    targetDates.forEach(dateStr => {
       employees.forEach(emp => {
          const record = attendance.find(a => a.employeeId?._id === emp._id && a.date === dateStr);
          
          let derivedStatus = "Absent";
          let hoursNum = 0.0;
          let shiftStr = "Morning"; // Default shift assigned if absent

          if (record) {
             hoursNum = parseFloat(record.hoursWorked) || 0;
             if (hoursNum > 0 && hoursNum < 4.0) derivedStatus = "Half Day";
             else if (record.status?.toLowerCase().includes("leave")) derivedStatus = "Leave";
             else if (record.lateMinutes > 0) derivedStatus = "Late";
             else derivedStatus = "Present";

             shiftStr = record.shift || "Morning";
          }

          // FINANCIAL ALGORITHM LAYER

          // 1. Shift Allowance
          let allowance = 0;
          if (derivedStatus !== "Absent" && derivedStatus !== "Leave") {
             if (shiftStr === "Night") allowance = 500.0;
             if (shiftStr === "Evening") allowance = 200.0;
          }

          // 2. Overtime
          let ot = 0;
          if (hoursNum > 8.0) {
              ot = hoursNum - 8.0;
          }

          // 3. Leave Deduction
          const baseDailyRate = (emp.baseSalary || 30000) / 30; // Native constraint fallback
          let deduction = 0;
          if (derivedStatus === "Absent") {
              deduction = baseDailyRate;
          } else if (derivedStatus === "Half Day") {
              deduction = baseDailyRate * 0.5;
          }

          // 4. Payroll Impact (Calculated directly against base hours natively worked)
          const baseHourlyRate = baseDailyRate / 8;
          let paidHours = hoursNum;
          if (paidHours > 8) paidHours = 8; // OT is calculated explicitly separate below? No, let's just pay strict hours worked + allowance - deduction.
          
          let finalImpact = (hoursNum * baseHourlyRate) + allowance - deduction;
          if (finalImpact < 0) finalImpact = 0; // cannot owe company on daily shift resolution boundary

          generated.push({
             uid: `${emp._id}_${dateStr}`, 
             empId: emp.empId,
             name: emp.name,
             date: dateStr,
             shift: shiftStr,
             hours: hoursNum > 0 ? hoursNum.toFixed(2) : "-",
             ot: ot > 0 ? ot.toFixed(2) : "-",
             allowance: allowance > 0 ? `₹${allowance.toFixed(2)}` : "-",
             deduction: deduction > 0 ? `₹${deduction.toFixed(2)}` : "-",
             status: derivedStatus,
             payrollImpact: `₹${finalImpact.toFixed(2)}`,

             // Raw floats for aggregation
             _rawAllowance: allowance,
             _rawOt: ot,
             _rawImpact: finalImpact
          });
       });
    });

    return generated.sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [employees, attendance, monthStr]);

  // 🔥 Apply Master Shift Filter
  const filteredGrid = useMemo(() => {
    return flattenedMatrix.filter(r => {
       return shiftFilter === "All" || r.shift === shiftFilter;
    });
  }, [flattenedMatrix, shiftFilter]);

  // 🔥 Aggregation Widget Counters
  const sumWorkingDays = filteredGrid.filter(r => r.status !== "Absent").length;
  const sumAllowance = filteredGrid.reduce((acc, curr) => acc + curr._rawAllowance, 0);
  const sumOT = filteredGrid.reduce((acc, curr) => acc + curr._rawOt, 0);
  const sumPayroll = filteredGrid.reduce((acc, curr) => acc + curr._rawImpact, 0);

  if (loading) return <div className="text-white p-6">Authenticating Financial Logic Gates...</div>;

  return (
    <div className="space-y-6 text-white mt-6">
      
      <h2 className="text-2xl font-bold">Shift & Payroll Impact Analyser</h2>

      {/* FILTER TOP BAR */}
      <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 items-center overflow-x-auto">
        <select value={selMonth} onChange={(e)=>setSelMonth(e.target.value)} className="px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-sm text-indigo-200">
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>
        
        <select value={selYear} onChange={(e)=>setSelYear(e.target.value)} className="px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-sm text-indigo-200">
            {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>

        <select value={shiftFilter} onChange={(e)=>setShiftFilter(e.target.value)} className="px-4 py-2 bg-slate-900 border border-white/20 rounded-lg text-sm font-semibold">
           <option value="All">All Shifts</option>
           <option value="Morning">Morning Shift</option>
           <option value="Evening">Evening Shift</option>
           <option value="Night">Night Shift</option>
        </select>
      </div>

      {/* SUMMARY DASHBOARD TILES */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-indigo-900/40 border border-indigo-500/30 p-5 rounded-2xl">
          <p className="text-white/60 text-sm font-medium">Total Working Days</p>
          <p className="text-3xl font-bold mt-2 text-indigo-300">{sumWorkingDays}</p>
        </div>
        <div className="bg-emerald-900/40 border border-emerald-500/30 p-5 rounded-2xl">
          <p className="text-white/60 text-sm font-medium">Total Shift Allowance</p>
          <p className="text-3xl font-bold mt-2 text-emerald-400">₹{sumAllowance.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
        </div>
        <div className="bg-orange-900/40 border border-orange-500/30 p-5 rounded-2xl">
          <p className="text-white/60 text-sm font-medium">Total Overtime Hours</p>
          <p className="text-3xl font-bold mt-2 text-orange-400">{sumOT.toFixed(2)}h</p>
        </div>
        <div className="bg-purple-900/40 border border-purple-500/30 p-5 rounded-2xl">
          <p className="text-white/60 text-sm font-medium">Total Payroll Impact</p>
          <p className="text-3xl font-bold mt-2 text-purple-400">₹{sumPayroll.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
        </div>
      </div>

      {/* DYNAMIC SHIFT REPORT TABLE */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800 text-gray-300 border-b border-white/20 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 w-28">Emp ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Shift</th>
                <th className="p-4">Hours</th>
                <th className="p-4 text-orange-300 border-l border-white/10">OT</th>
                <th className="p-4 text-emerald-300">Allowance</th>
                <th className="p-4 text-red-300">Leave Deduction</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-purple-300 border-l border-white/10 bg-white/5 right-0 sticky font-bold">Payroll Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredGrid.length === 0 ? (
                 <tr><td colSpan="10" className="p-8 text-center text-white/50 italic flex-1">No shift evaluation data available.</td></tr>
              ) : filteredGrid.map((row) => (
                <tr key={row.uid} className={`hover:bg-white/5 transition ${row.status === 'Absent' ? 'opacity-50' : ''}`}>
                  <td className="p-4 font-mono text-indigo-300 text-xs">{row.empId}</td>
                  <td className="p-4 font-semibold">{row.name}</td>
                  <td className="p-4 text-indigo-100/70">{row.date}</td>
                  
                  <td className="p-4">
                    <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/80 border border-white/10 shadow-sm">{row.shift}</span>
                  </td>
                  
                  <td className="p-4 font-mono">{row.hours}</td>
                  
                  <td className="p-4 font-mono text-orange-200 border-l border-white/5">{row.ot}</td>
                  
                  <td className="p-4 font-mono text-emerald-200">{row.allowance}</td>
                  
                  <td className="p-4 font-mono text-red-300">{row.deduction}</td>
                  
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                        row.status === "Present" ? "bg-green-500/20 text-green-300 border-green-500/30" : 
                        row.status === "Absent" ? "bg-red-500/20 text-red-300 border-red-500/30" :
                        row.status === "Late" ? "bg-orange-500/20 text-orange-300 border-orange-500/30" :
                        row.status === "Half Day" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
                        "bg-blue-500/20 text-blue-300 border-blue-500/30" // Leave
                    }`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="p-4 font-mono font-bold text-purple-300 bg-white/5 border-l border-white/5 right-0 sticky backdrop-blur-md">
                     {row.payrollImpact}
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

export default ManagerShifts;
