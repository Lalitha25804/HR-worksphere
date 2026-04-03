import { useState, useEffect, useMemo } from "react";
import { getMyAttendanceAPI } from "../../api/attendanceApi";
import { Briefcase, Key, Clock, DollarSign, ListFilter } from "lucide-react";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const EmployeeShift = () => {

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMonth, setFilterMonth] = useState(currentMonth.toString().padStart(2, "0"));
  const [filterYear, setFilterYear] = useState(currentYear.toString());
  const [filterShift, setFilterShift] = useState("All");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await getMyAttendanceAPI();
        setAttendance(res.data || []);
      } catch (err) {
        console.error("Shift Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  /* ================= CALCULATIONS ================= */
  const shiftMetrics = useMemo(() => {
     let logs = [];
     let totalWorkedDays = 0;
     let morningShifts = 0;
     let eveningShifts = 0;
     let nightShifts = 0;
     let totalAllowance = 0;

     // 1. Initial Temporal Constraints Mapping
     const monthScope = attendance.filter(log => {
        if (!log.date) return false;
        const [y, m] = log.date.split('-');
        return y === filterYear && m === filterMonth;
     });

     // 2. Extrapolate Core Metrics over Scoped Iteration natively
     monthScope.forEach(log => {
         if (!log.checkIn) return;

         let shiftClass = "Morning";
         let allowance = 0;
         let hoursWorked = 0;

         // Calculate Hours
         if (log.checkOut) {
             const tIn = new Date(log.checkIn);
             const tOut = new Date(log.checkOut);
             let diff = (tOut - tIn) / (1000 * 60 * 60);
             if (diff < 0) diff += 24; // Cross-midnight boundaries
             hoursWorked = diff.toFixed(1);
         }

         // Ascertain Shift Vectors based natively on Check-in parameters
         const hour = new Date(log.checkIn).getHours();
         
         if (hour >= 18 || hour < 6) {
             shiftClass = "Night";
             allowance = 500;
             nightShifts++;
         } else if (hour >= 12 && hour < 18) {
             shiftClass = "Evening";
             allowance = 200;
             eveningShifts++;
         } else {
             morningShifts++;
         }

         totalWorkedDays++;
         totalAllowance += allowance;

         logs.push({
             ...log,
             shiftClass,
             allowance,
             hoursWorked
         });
     });

     // 3. User Filter Application cleanly executed against computed classes natively
     if (filterShift !== "All") {
         logs = logs.filter(l => l.shiftClass === filterShift);
     }

     // Chronological Descending execution locally mapped natively
     logs.sort((a,b) => new Date(b.date) - new Date(a.date));

     return {
         logs,
         totalWorkedDays,
         morningShifts,
         eveningShifts,
         nightShifts,
         totalAllowance
     };

  }, [attendance, filterMonth, filterYear, filterShift]);

  /* ================= UI RENDER ================= */
  if (loading) return <div className="text-white animate-pulse">Initializing Personal Matrices...</div>;

  return (
    <div className="space-y-6">

      {/* HEADER CONTROLS */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
             <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl border border-white/10">
                <ListFilter size={18} className="text-teal-400" />
                <span className="text-sm font-semibold tracking-wide">Filter Variables:</span>
             </div>

             <select 
                value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="bg-slate-800 border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 transition"
             >
                {Array.from({length: 12}, (_, i) => {
                    const m = (i + 1).toString().padStart(2, "0");
                    return <option key={m} value={m}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                })}
             </select>

             <select 
                value={filterYear} onChange={e => setFilterYear(e.target.value)}
                className="bg-slate-800 border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 transition"
             >
                <option value={currentYear.toString()}>{currentYear}</option>
                <option value={(currentYear - 1).toString()}>{currentYear - 1}</option>
             </select>
          </div>

          <div className="flex gap-2">
              {['All', 'Morning', 'Evening', 'Night'].map(pt => (
                 <button
                    key={pt}
                    onClick={() => setFilterShift(pt)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filterShift === pt ? 'bg-teal-500 text-slate-900 shadow-[0_0_15px_rgba(45,212,191,0.4)]' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'}`}
                 >
                    {pt}
                 </button>
              ))}
          </div>
      </div>

      {/* SUMMARY SCALARS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card label="Working Days" value={shiftMetrics.totalWorkedDays} icon={<Briefcase size={22} />} color="text-indigo-400" />
         <Card label="Morning Shifts" value={shiftMetrics.morningShifts} icon={<Key size={22} />} color="text-sky-400" />
         <Card label="Night Shifts" value={shiftMetrics.nightShifts} icon={<Clock size={22} />} color="text-indigo-500" />
         
         <div className="bg-gradient-to-br from-emerald-600/30 to-teal-900/30 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group">
             <div className="flex justify-between items-start">
                <span className="text-emerald-100/70 font-semibold text-sm tracking-widest uppercase">Allowance Yield</span>
                <DollarSign size={24} className="text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
             </div>
             <p className="text-4xl font-black text-white mt-4 drop-shadow-md">
                ₹{shiftMetrics.totalAllowance.toLocaleString()}
             </p>
         </div>
      </div>

      {/* MASTER DATA GRID */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
         <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
             <h3 className="text-lg font-bold text-white tracking-wide">Historical Shift Matrix Log</h3>
         </div>

         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                 <thead>
                     <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-white/50 border-b border-white/10">
                         <th className="p-4 font-semibold">Temporal Date</th>
                         <th className="p-4 font-semibold">Check-In Node</th>
                         <th className="p-4 font-semibold">Check-Out Node</th>
                         <th className="p-4 font-semibold text-center">Calculated Shift</th>
                         <th className="p-4 font-semibold text-center">Output Metric (Hrs)</th>
                         <th className="p-4 font-semibold text-right">Allowance Earned</th>
                     </tr>
                 </thead>
                 <tbody>
                    {shiftMetrics.logs.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center p-8 text-white/40 italic">No chronological data anchored to this temporal frame.</td>
                        </tr>
                    ) : shiftMetrics.logs.map(log => (
                        <tr key={log._id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                            <td className="p-4">
                               <span className="text-white font-mono text-sm">{log.date}</span>
                            </td>
                            <td className="p-4 text-emerald-300 text-sm">
                               {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                            </td>
                            <td className="p-4 text-indigo-300 text-sm">
                               {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}
                            </td>
                            <td className="p-4 text-center">
                               <span className={`px-3 py-1 rounded-full text-xs font-bold border ${log.shiftClass === 'Morning' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : log.shiftClass === 'Evening' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                                  {log.shiftClass}
                               </span>
                            </td>
                            <td className="p-4 text-center">
                               <span className="font-mono text-white/80">{log.hoursWorked > 0 ? `${log.hoursWorked}h` : '--'}</span>
                            </td>
                            <td className="p-4 text-right">
                               <span className={`font-mono font-bold ${log.allowance > 0 ? 'text-emerald-400' : 'text-white/30'}`}>
                                  ₹{log.allowance}
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

// Layout Structuring Element
const Card = ({ label, value, icon, color }) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col justify-between group hover:bg-white/15 transition relative overflow-hidden">
     <div className="flex justify-between items-start">
        <span className="text-white/60 font-semibold text-sm tracking-widest uppercase">{label}</span>
        <div className={`p-2 rounded-xl bg-slate-900/50 border border-white/5 ${color} shadow-lg`}>
           {icon}
        </div>
     </div>
     <p className="text-3xl font-bold text-white mt-4 tracking-tight drop-shadow-md">{value}</p>
  </div>
);

export default EmployeeShift;
