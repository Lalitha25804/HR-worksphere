import { useState, useMemo, useEffect } from "react";
import { getAllAttendanceAPI } from "../../api/attendanceApi";
import { getEmployeesAPI } from "../../api/employeesApi";

const ManagerAttendance = () => {

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [shiftFilter, setShiftFilter] = useState("All");
  const [selectionMode, setSelectionMode] = useState("All");
  
  // Date Config
  const todayDate = new Date();
  const currentMonthNum = String(todayDate.getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(todayDate.getFullYear());

  const [selMonth, setSelMonth] = useState(currentMonthNum);
  const [selYear, setSelYear] = useState(currentYearStr);

  const monthStr = `${selYear}-${selMonth}`;

  const [selectedIds, setSelectedIds] = useState([]);

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
        console.error("Matrix generation failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔥 Construct Virtual Time Matrix
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
       // Omit weekends from strict absentee requirements
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
          let checkInStr = "-";
          let checkOutStr = "-";
          let hours = "-";
          let shiftStr = "Standard";

          if (record) {
             const h = record.hoursWorked || 0;
             if (h > 0 && h < 4.0) derivedStatus = "Half Day";
             else if (record.status?.toLowerCase().includes("leave")) derivedStatus = "Leave";
             else if (record.lateMinutes > 0) derivedStatus = "Late";
             else derivedStatus = "Present";

             checkInStr = record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "-";
             checkOutStr = record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "-";
             hours = record.hoursWorked ? record.hoursWorked.toFixed(2) : "-";
             shiftStr = record.shift || "Morning"; // Map standard to Morning for UI consistency
          }

          generated.push({
             uid: `${emp._id}_${dateStr}`, 
             name: emp.name,
             empId: emp.empId,
             date: dateStr,
             checkIn: checkInStr,
             checkOut: checkOutStr,
             hours: hours,
             shift: shiftStr,
             status: derivedStatus
          });
       });
    });

    return generated.sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [employees, attendance, monthStr]);

  // 🔥 Apply Sub-Filters
  const filteredGrid = useMemo(() => {
    return flattenedMatrix.filter(r => {
       const s = search.toLowerCase();
       const mSearch = (r.name?.toLowerCase().includes(s) || false) || (r.empId?.toLowerCase().includes(s) || false);
       const mStatus = statusFilter === "All" || r.status === statusFilter;
       const mShift = shiftFilter === "All" || r.shift === shiftFilter;
       const mSelect = selectionMode === "All" || selectedIds.includes(r.uid);
       return mSearch && mStatus && mShift && mSelect;
    });
  }, [flattenedMatrix, search, statusFilter, shiftFilter, selectionMode, selectedIds]);

  // Metric Aggregation
  const sumPresent = flattenedMatrix.filter(r => r.status === "Present").length;
  const sumAbsent = flattenedMatrix.filter(r => r.status === "Absent").length;
  const sumLate = flattenedMatrix.filter(r => r.status === "Late").length;
  const sumLeave = flattenedMatrix.filter(r => r.status === "Leave").length;

  /* ================= ACTION BINDINGS ================= */

  const toggleSelect = (uid) => {
    setSelectedIds(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filteredGrid.map(f => f.uid));
    else setSelectedIds([]);
  };

  const downloadCSV = () => {
    let csv = "Name,Emp ID,Date,Check In,Check Out,Hours,Shift,Status\n";
    filteredGrid.forEach(e => {
      csv += `"${e.name}",${e.empId},${e.date},${e.checkIn},${e.checkOut},${e.hours},${e.shift},${e.status}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_Matrix_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-white p-6">Authenticating Matrix Configuration...</div>;

  return (
    <div className="space-y-6 text-white mt-6">
      
      <h2 className="text-2xl font-bold">Team Attendance Matrix</h2>

      {/* SUMMARY WIDGETS */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-green-900/40 border border-green-500/30 p-5 rounded-2xl">
          <p className="text-white/60 text-sm font-medium">Present</p>
          <p className="text-3xl font-bold mt-2 text-green-400">{sumPresent}</p>
        </div>
        <div className="bg-red-900/30 border border-red-500/30 p-5 rounded-2xl">
          <p className="text-white/60 text-sm font-medium">Absent</p>
          <p className="text-3xl font-bold mt-2 text-red-400">{sumAbsent}</p>
        </div>
        <div className="bg-orange-900/40 border border-orange-500/30 p-5 rounded-2xl">
          <p className="text-white/60 text-sm font-medium">Late</p>
          <p className="text-3xl font-bold mt-2 text-orange-400">{sumLate}</p>
        </div>
        <div className="bg-blue-900/40 border border-blue-500/30 p-5 rounded-2xl">
          <p className="text-white/60 text-sm font-medium">On Leave</p>
          <p className="text-3xl font-bold mt-2 text-blue-400">{sumLeave}</p>
        </div>
      </div>

      {/* FILTER & METADATA BAR */}
      <div className="flex flex-wrap gap-3 bg-white/5 p-4 rounded-xl border border-white/10 items-center justify-between">
        
        <div className="flex gap-3 flex-wrap items-center">
            <input 
              placeholder="Search Employee..." 
              value={search} onChange={e=>setSearch(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[150px]"
            />
            
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-900 rounded-lg border border-white/20">
              <option value="All">Status: All</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">On Leave</option>
            </select>

            <select value={shiftFilter} onChange={e=>setShiftFilter(e.target.value)} className="px-3 py-2 bg-slate-900 rounded-lg border border-white/20">
              <option value="All">Shift: All</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>

            <select value={selectionMode} onChange={e=>setSelectionMode(e.target.value)} className="px-3 py-2 bg-slate-900 rounded-lg border border-white/20 text-indigo-300">
              <option value="All">View All Scope</option>
              <option value="Selected">View Selected ({selectedIds.length})</option>
            </select>
        </div>

        <div className="flex gap-3 flex-wrap items-center bg-black/30 p-2 rounded-lg border border-white/5">
            <select value={selMonth} onChange={(e)=>setSelMonth(e.target.value)} className="px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-sm text-indigo-200 shadow-sm">
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
            <select value={selYear} onChange={(e)=>setSelYear(e.target.value)} className="px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-sm text-indigo-200 shadow-sm">
                {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
        </div>

        <button onClick={downloadCSV} className="bg-slate-700 px-5 py-2 rounded-lg border border-white/20 hover:bg-slate-600 shadow-md whitespace-nowrap">
          📥 Download
        </button>
      </div>

      {/* DYNAMIC DATA GRID */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800 text-gray-300 border-b border-white/20 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredGrid.length && filteredGrid.length > 0} className="w-4 h-4 rounded appearance-none checked:bg-indigo-500 border border-white/30 cursor-pointer"/>
                </th>
                <th className="p-4">Name</th>
                <th className="p-4">Date</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
                <th className="p-4">Hours</th>
                <th className="p-4">Shift</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredGrid.length === 0 ? (
                 <tr><td colSpan="8" className="p-8 text-center text-white/50 italic">No attendance records discovered spanning this configuration.</td></tr>
              ) : filteredGrid.map((row) => (
                <tr key={row.uid} className={`hover:bg-white/5 transition ${row.status === 'Absent' ? 'bg-red-900/10' : ''}`}>
                  <td className="p-4 text-center">
                    <input type="checkbox" checked={selectedIds.includes(row.uid)} onChange={() => toggleSelect(row.uid)} className="w-4 h-4 rounded appearance-none checked:bg-indigo-500 border border-white/30 cursor-pointer"/>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">{row.name}</p>
                    <p className="text-xs text-indigo-300">{row.empId}</p>
                  </td>
                  <td className="p-4 text-indigo-100">{row.date}</td>
                  <td className="p-4 text-emerald-100/80">{row.checkIn}</td>
                  <td className="p-4 text-emerald-100/80">{row.checkOut}</td>
                  <td className="p-4 font-mono text-white/80">{row.hours}</td>
                  <td className="p-4">
                    <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/80 border border-white/10">{row.shift}</span>
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ManagerAttendance;