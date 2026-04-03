import { useState, useEffect } from "react";
import { getEmployeesAPI } from "../../api/employeesApi";
import { getPayrollAPI } from "../../api/payrollApi";
import { getSettingsAPI } from "../../api/settingsApi";

const PayrollHistory = () => {
  const currentDate = new Date();
  const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const [monthFilter, setMonthFilter] = useState(defaultMonth);
  const [reportType, setReportType] = useState("All"); // All or Selected
  const [selectedRecords, setSelectedRecords] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchData();
  }, [monthFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live employees and Global Settings
      const [empRes, setRes] = await Promise.all([
        getEmployeesAPI(),
        getSettingsAPI()
      ]);
      
      const emps = empRes.data;
      setEmployees(emps);
      setGlobalSettings(setRes.data || {});

      // 2. Resolve Payroll computations per employee
      const [yearStr, monthStr] = monthFilter.split("-");
      const computed = [];

      await Promise.all(
        emps.map(async (emp) => {
          try {
             const payRes = await getPayrollAPI(emp._id, monthStr, yearStr);
             const p = payRes.data;
             // Determine fallback percentages based on user/settings
             const pfPct = emp.pfPercentage || setRes.data?.payrollSettings?.pfPercent || 12;
             const taxPct = emp.taxPercentage || setRes.data?.payrollSettings?.taxPercent || 10;
             
             computed.push({
               ...p,
               empId: emp.empId || "EMP",
               name: emp.name,
               baseSalary: emp.baseSalary || 0,
               pfPct,
               taxPct,
               uid: emp._id // Unique identifier for checkboxes
             });
          } catch (e) {
             console.error(`Failed resolving payroll history for ${emp.name}`);
          }
        })
      );
      
      setPayrollData(computed);
      setSelectedRecords([]);
      setCurrentPage(1);

    } catch (err) {
      console.error("Failed to fetch payroll history data", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTER OVERRIDES
  ========================= */
  const filteredData = payrollData.filter(record => {
     if (reportType === "Selected") return selectedRecords.includes(record.uid);
     return true;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;

  /* =========================
     SELECTION HANDLERS
  ========================= */
  const toggleRecord = (uid) => {
    setSelectedRecords(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const selectAllRendered = () => {
    const allSelected = paginatedData.every(r => selectedRecords.includes(r.uid));
    if (allSelected) {
       // Deselect all on current page
       setSelectedRecords(prev => prev.filter(id => !paginatedData.find(p => p.uid === id)));
    } else {
       // Select all on current page
       const newIds = paginatedData.map(r => r.uid);
       setSelectedRecords(prev => [...new Set([...prev, ...newIds])]);
    }
  };

  /* =========================
     CSV DOWNLOAD EXPORTER
  ========================= */
  const downloadReport = () => {
    if (reportType === "Selected" && selectedRecords.length === 0) {
      alert("Please select records to download.");
      return;
    }

    const dataToExport = reportType === "Selected" 
        ? payrollData.filter(r => selectedRecords.includes(r.uid)) 
        : payrollData;

    let csv = "Period,Employee ID,Employee Name,Shifts Handled,Base Salary,OT Hours,Shift Allowance,PF %,Tax %,Leave Deductions,PF Amount,Tax Amount,Net Payroll\n";
    
    dataToExport.forEach(r => {
      csv += [
         monthFilter,
         r.empId,
         `"${r.name}"`,
         `"${r.workedShifts || '-'}"`,
         r.baseSalary,
         r.totalOvertime || 0,
         r.totalAllowance || 0,
         `${r.pfPct}%`,
         `${r.taxPct}%`,
         r.deduction || 0,
         r.pfAmount || 0,
         r.taxAmount || 0,
         r.salary || 0
      ].join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payroll_History_${monthFilter}.csv`;
    a.click();
  };

  /* =========================
     UI RENDER
  ========================= */
  return (
    <div className="space-y-6 text-white pb-10">
      <h2 className="text-2xl font-bold">Payroll Audit History</h2>

      {/* TOP FILTERS */}
      <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-lg">
        <div>
          <label className="text-sm text-white/60 block mb-1">Month Selected</label>
          <input 
            type="month" 
            value={monthFilter} 
            onChange={(e) => setMonthFilter(e.target.value)} 
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none"
          />
        </div>

        <div>
           <label className="text-sm text-white/60 block mb-1">Selection Filter</label>
           <select 
             value={reportType} 
             onChange={(e) => {
                 setReportType(e.target.value);
                 setCurrentPage(1); // Reset page on filter change
             }} 
             className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none"
           >
             <option value="All">All Records</option>
             <option value="Selected">Selected Only</option>
           </select>
        </div>

        <div className="mt-6 flex-1 flex justify-end">
           <button 
             onClick={downloadReport} 
             className="px-6 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg font-semibold transition shadow-md flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
             Download CSV
           </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/60 text-lg">Cross-referencing global limits and compiling history...</div>
      ) : (
        <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto min-h-[400px]">
             <table className="w-full text-sm">
                <thead className="bg-slate-900 border-b border-white/20 whitespace-nowrap">
                   <tr>
                      <th className="p-4 text-center">
                         <input 
                           type="checkbox" 
                           checked={paginatedData.length > 0 && paginatedData.every(r => selectedRecords.includes(r.uid))} 
                           onChange={selectAllRendered} 
                           className="cursor-pointer"
                         />
                      </th>
                      <th className="p-4 text-left">Date</th>
                      <th className="p-4 text-left">Employee</th>
                      <th className="p-4 text-left">Shifts Handled</th>
                      <th className="p-4 text-center">Base Salary</th>
                      <th className="p-4 text-center">OT Hrs</th>
                      <th className="p-4 text-center">Shift Allw.</th>
                      <th className="p-4 text-center">PF %</th>
                      <th className="p-4 text-center">Tax %</th>
                      <th className="p-4 text-center">Leave Ded.</th>
                      <th className="p-4 text-right">Net Payroll</th>
                   </tr>
                </thead>
                <tbody>
                   {paginatedData.length === 0 ? (
                      <tr><td colSpan="10" className="text-center py-8 text-white/50">No payroll audit logs found.</td></tr>
                   ) : (
                      paginatedData.map(row => (
                         <tr key={row.uid} className={`border-b border-white/10 hover:bg-white/5 transition ${selectedRecords.includes(row.uid) ? 'bg-indigo-500/10' : ''}`}>
                            <td className="p-4 text-center">
                               <input 
                                 type="checkbox" 
                                 checked={selectedRecords.includes(row.uid)} 
                                 onChange={() => toggleRecord(row.uid)} 
                                 className="cursor-pointer"
                               />
                            </td>
                            <td className="p-4 text-white/80">{monthFilter}</td>
                            <td className="p-4 font-medium">{row.name} <span className="text-xs text-white/40 block">{row.empId}</span></td>
                            <td className="p-4 text-white/70">{row.workedShifts || "-"}</td>
                            <td className="p-4 text-center text-white/80">₹{row.baseSalary.toLocaleString()}</td>
                            <td className="p-4 text-center text-purple-300">{row.totalOvertime || 0}</td>
                            <td className="p-4 text-center text-blue-300">₹{row.totalAllowance || 0}</td>
                            <td className="p-4 text-center text-orange-300">{row.pfPct}%</td>
                            <td className="p-4 text-center text-red-300">{row.taxPct}%</td>
                            <td className="p-4 text-center text-pink-300">-₹{row.deduction || 0}</td>
                            <td className="p-4 text-right font-bold text-green-400 text-base">₹{(row.salary || 0).toLocaleString()}</td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
             <div className="flex justify-between items-center p-4 bg-white/5 border-t border-white/10">
               <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition"
               >
                 Previous
               </button>
               <span className="text-sm text-white/50 font-medium">Page {currentPage} of {totalPages}</span>
               <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm transition"
               >
                 Next
               </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayrollHistory;