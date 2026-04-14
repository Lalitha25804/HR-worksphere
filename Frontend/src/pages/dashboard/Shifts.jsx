import { useState, useEffect } from "react";
import { getAllAttendanceAPI } from "../../api/attendanceApi";
import { getEmployeesAPI } from "../../api/employeesApi";

const Shifts = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  const [selectedEmp, setSelectedEmp] = useState("");
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtered computed states
  const [summary, setSummary] = useState({
     totalEmployees: 0,
     morning: 0,
     evening: 0,
     night: 0,
     totalAllowance: 0
  });

  const [breakdownData, setBreakdownData] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  // Pagination states
  const [breakdownPage, setBreakdownPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, empRes] = await Promise.all([
        getAllAttendanceAPI(),
        getEmployeesAPI()
      ]);
      setAttendanceData(attRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error("Failed to fetch shift analysis data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [attendanceData, month, year, selectedEmp]);

  const applyFilters = () => {
    // 1. Filter by Month/Year and optionally Employee
    const filtered = attendanceData.filter(record => {
       if (!record.date) return false;
       const [recYear, recMonth] = record.date.split("-");
       
       const matchMonth = Number(recMonth) === Number(month);
       const matchYear = Number(recYear) === Number(year);
       
       let matchEmp = true;
       if (selectedEmp) {
          const empIdVal = record.employeeId?._id || record.employeeId;
          matchEmp = empIdVal === selectedEmp;
       }

       return matchMonth && matchYear && matchEmp;
    });

    // 2. Compute Top Summary Cards
    const uniqueEmps = new Set(filtered.map(r => r.employeeId?._id || r.employeeId)).size;
    let mCount = 0;
    let eCount = 0;
    let nCount = 0;
    let tAllowance = 0;

    filtered.forEach(r => {
       const s = r.shift ? r.shift.toLowerCase() : "";
       if (s.includes("morning") || s.includes("day") || s.includes("standard")) mCount++;
       else if (s.includes("evening") || s.includes("afternoon")) eCount++;
       else if (s.includes("night")) nCount++;
       
       tAllowance += (r.allowance || 0);
    });

    setSummary({
      totalEmployees: uniqueEmps,
      morning: mCount,
      evening: eCount,
      night: nCount,
      totalAllowance: tAllowance
    });

    // 3. Compute Breakdown Table
    const map = {};
    filtered.forEach(r => {
       const empId = r.employeeId?._id || r.employeeId;
       const empName = r.employeeId?.name || "Unknown";
       
       if (!map[empId]) {
         map[empId] = { id: empId, name: empName, morning: 0, evening: 0, night: 0, totalDays: 0, allowance: 0 };
       }
       
       const s = r.shift ? r.shift.toLowerCase() : "";
       if (s.includes("morning") || s.includes("day") || s.includes("standard")) map[empId].morning++;
       else if (s.includes("evening") || s.includes("afternoon")) map[empId].evening++;
       else if (s.includes("night")) map[empId].night++;

       map[empId].totalDays++;
       map[empId].allowance += (r.allowance || 0);
    });

    setBreakdownData(Object.values(map));

    // 4. Fill Detailed History Table
    const history = filtered.map(r => ({
       id: r._id,
       name: r.employeeId?.name || "Unknown",
       date: r.date,
       checkIn: r.checkIn,
       shift: r.shift || "Missing",
       allowance: r.allowance || 0
    })).sort((a,b) => new Date(b.date) - new Date(a.date));

    setHistoryData(history);
    
    // Reset pages
    setBreakdownPage(1);
    setHistoryPage(1);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "--";
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Pagination Helper Component
  const PaginationControls = ({ currentPage, totalItems, itemsPerPage, setPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center p-3 bg-white/5 border-t border-white/10">
        <button 
           onClick={() => setPage(p => Math.max(1, p - 1))}
           disabled={currentPage === 1}
           className="px-4 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition"
        >
          Previous
        </button>
        <span className="text-sm text-white/50 font-medium">Page {currentPage} of {totalPages}</span>
        <button 
           onClick={() => setPage(p => Math.min(totalPages, p + 1))}
           disabled={currentPage === totalPages}
           className="px-4 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition"
        >
          Next
        </button>
      </div>
    );
  };

  const paginatedBreakdown = breakdownData.slice((breakdownPage - 1) * ITEMS_PER_PAGE, breakdownPage * ITEMS_PER_PAGE);
  const paginatedHistory = historyData.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 text-white pb-10">
      
      {/* 🚀 TOP FILTER SECTION */}
      <h2 className="text-2xl font-bold">Monthly Shift Analytics</h2>
      
      <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg">
        <div>
          <label className="text-sm text-white/60 block mb-1">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none min-w-[120px]">
            {Array.from({length: 12}, (_, i) => {
              const m = i + 1;
              const isDisabled = Number(year) === currentYear && m > currentMonth;
              return (
                <option key={m} value={m} disabled={isDisabled}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              );
            })}
          </select>
        </div>
        
        <div>
          <label className="text-sm text-white/60 block mb-1">Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none min-w-[100px]">
            {[2024, 2025, 2026, 2027].filter(y => y <= currentYear).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-white/60 block mb-1">Employee (Optional)</label>
          <select value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none min-w-[200px]">
            <option value="">All Employees</option>
            {employees.map(emp => (
               <option key={emp._id} value={emp._id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-5">
          <button 
            onClick={applyFilters} 
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition shadow-md"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/60 text-lg">Querying Database Attendance Intelligence...</div>
      ) : (
        <>
          {/* 🚀 SHIFT SUMMARY CARDS */}
          <div className="grid grid-cols-5 gap-4">
             <div className="bg-white/10 border border-white/10 p-4 rounded-xl shadow-md">
               <p className="text-white/60 text-sm mb-1">Total Employees</p>
               <p className="text-3xl font-bold text-white">{summary.totalEmployees}</p>
             </div>
             <div className="bg-white/10 border border-white/10 p-4 rounded-xl shadow-md">
               <p className="text-white/60 text-sm mb-1">Morning Shifts</p>
               <p className="text-3xl font-bold text-teal-300">{summary.morning}</p>
             </div>
             <div className="bg-white/10 border border-white/10 p-4 rounded-xl shadow-md">
               <p className="text-white/60 text-sm mb-1">Evening Shifts</p>
               <p className="text-3xl font-bold text-orange-300">{summary.evening}</p>
             </div>
             <div className="bg-white/10 border border-white/10 p-4 rounded-xl shadow-md">
               <p className="text-white/60 text-sm mb-1">Night Shifts</p>
               <p className="text-3xl font-bold text-purple-400">{summary.night}</p>
             </div>
             <div className="bg-white/10 border border-white/10 p-4 rounded-xl shadow-md border-b-4 border-b-green-400">
               <p className="text-white/60 text-sm mb-1">Total Shift Allowance</p>
               <p className="text-3xl font-bold text-green-400">₹{summary.totalAllowance.toLocaleString()}</p>
             </div>
          </div>

          {/* 🚀 EMPLOYEE SHIFT BREAKDOWN TABLE */}
          <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 bg-white/5 border-b border-white/10">
               <h3 className="text-lg font-bold">Employee Shift Breakdown</h3>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 border-b border-white/20">
                  <tr>
                    <th className="p-3 text-left">Employee</th>
                    <th className="p-3 text-center">Morning</th>
                    <th className="p-3 text-center">Evening</th>
                    <th className="p-3 text-center">Night</th>
                    <th className="p-3 text-center">Total Days</th>
                    <th className="p-3 text-center">Allowance Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBreakdown.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-6 text-white/50">No shift data found for this period.</td></tr>
                  ) : (
                    paginatedBreakdown.map(emp => (
                      <tr key={emp.id} className="border-b border-white/10 hover:bg-white/5 transition">
                        <td className="p-3 font-medium">{emp.name}</td>
                        <td className="p-3 text-center text-teal-300/80">{emp.morning}</td>
                        <td className="p-3 text-center text-orange-300/80">{emp.evening}</td>
                        <td className="p-3 text-center text-purple-300/80">{emp.night}</td>
                        <td className="p-3 text-center font-bold">{emp.totalDays}</td>
                        <td className="p-3 text-center text-green-400 font-bold">₹{emp.allowance.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls 
                currentPage={breakdownPage} 
                totalItems={breakdownData.length} 
                itemsPerPage={ITEMS_PER_PAGE} 
                setPage={setBreakdownPage} 
            />
          </div>

          {/* 🚀 SHIFT HISTORY TABLE */}
          <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden shadow-lg mt-8">
            <div className="p-4 bg-white/5 border-b border-white/10">
               <h3 className="text-lg font-bold">Detailed Shift Log History</h3>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 border-b border-white/20">
                  <tr>
                    <th className="p-3 text-left">Employee Name</th>
                    <th className="p-3 text-left">Log Date</th>
                    <th className="p-3 text-left">Exact Check-In Time</th>
                    <th className="p-3 text-left">System Detected Shift</th>
                    <th className="p-3 text-center">Applied Allowance</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-6 text-white/50">No logs found.</td></tr>
                  ) : (
                    paginatedHistory.map(log => (
                      <tr key={log.id} className="border-b border-white/10 hover:bg-white/5 transition">
                        <td className="p-3 font-medium">{log.name}</td>
                        <td className="p-3">{log.date}</td>
                        <td className="p-3">{formatTime(log.checkIn)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs border ${log.shift.toLowerCase().includes('night') ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : log.shift.toLowerCase().includes('evening') ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-teal-500/20 border-teal-500/40 text-teal-300'}`}>
                             {log.shift}
                          </span>
                        </td>
                        <td className="p-3 text-center text-green-400 font-semibold">
                          ₹{log.allowance}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls 
                currentPage={historyPage} 
                totalItems={historyData.length} 
                itemsPerPage={ITEMS_PER_PAGE} 
                setPage={setHistoryPage} 
            />
          </div>
        </>
      )}

    </div>
  );
};

export default Shifts;