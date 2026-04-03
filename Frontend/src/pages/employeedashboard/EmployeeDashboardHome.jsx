import { useState, useEffect } from "react";
import { Clock, Calendar, CheckCircle, CreditCard, ArrowRight, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getMyAttendanceAPI } from "../../api/attendanceApi";
import { getMyLeavesAPI } from "../../api/leaveApi";

const EmployeeDashboardHome = () => {
    
  const profile = JSON.parse(localStorage.getItem("user")) || {};
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive isolated quick status locally based on today's matrix
  const today = new Date().toISOString().split('T')[0];
  const [todayStatus, setTodayStatus] = useState("Pending");
  const [monthlyShifts, setMonthlyShifts] = useState(0);
  const [approvedLeaves, setApprovedLeaves] = useState(0);

  useEffect(() => {
     const initHub = async () => {
        try {
           const [attRes, leaveRes] = await Promise.all([
               getMyAttendanceAPI(),
               getMyLeavesAPI()
           ]);
           
           const logs = attRes.data || [];
           const leaves = leaveRes.data || [];
           
           // Sort chronologically descending
           logs.sort((a,b) => new Date(b.date) - new Date(a.date));
           setRecentLogs(logs.slice(0, 4));

           // Ascertain Today
           const currentDay = logs.find(l => l.date === today);
           if (currentDay) {
               if (currentDay.checkOut) setTodayStatus("Checked Out");
               else if (currentDay.checkIn) setTodayStatus("Active (Checked In)");
               else setTodayStatus("Absent");
           } else {
               setTodayStatus("Not Logged");
           }

           // Evaluate Totals
           const currentMonthStr = today.substring(0, 7);
           setMonthlyShifts(logs.filter(l => l.date && l.date.startsWith(currentMonthStr) && l.checkIn).length);
           setApprovedLeaves(leaves.filter(l => l.status === "Approved").length);
           
        } catch (err) {
           console.error("Dashboard Sync Failed", err);
        } finally {
           setLoading(false);
        }
     };
     initHub();
  }, [today]);

  return (
    <div className="space-y-8 pb-8">
      
      {/* 🚀 MASTER WELCOME BANNER */}
      <div className="relative bg-gradient-to-r from-emerald-900 to-teal-900 border border-emerald-500/30 rounded-3xl p-8 overflow-hidden shadow-[0_10px_40px_rgba(4,47,46,0.5)]">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          
          <div className="relative z-10">
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                 Welcome back, <span className="text-emerald-400">{profile.name || "Colleague"}</span>!
              </h1>
              <p className="text-emerald-100/70 mt-2 text-sm tracking-widest uppercase font-bold">
                 Employee Central Hub Node
              </p>
          </div>
      </div>

      {/* ⚡ QUICK STATUS MATRIX NUMERICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusNode 
             label="Today's Status Node" 
             value={todayStatus} 
             icon={<UserCheck size={22} />} 
             color="text-emerald-400" 
             pulse={todayStatus === "Active (Checked In)"}
          />
          <StatusNode 
             label="Active Shifts (Month)" 
             value={loading ? "--" : monthlyShifts.toString()} 
             icon={<CheckCircle size={22} />} 
             color="text-sky-400" 
          />
          <StatusNode 
             label="Approved Leaves" 
             value={loading ? "--" : approvedLeaves.toString()} 
             icon={<Calendar size={22} />} 
             color="text-indigo-400" 
          />
      </div>

      {/* 🧭 NAVIGATION LAUNCHPAD & RECENT ACTIVITY LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* ACTION BUTTON GRID */}
          <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase mb-2 pl-2">Quick Action Matrices</h3>
              
              <Link to="/employee-dashboard/attendance" className="group bg-[#020617] border border-white/10 hover:border-emerald-500/50 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition shrink-0">
                         <Clock size={20} />
                      </div>
                      <div>
                         <h4 className="text-white font-bold tracking-wide">Sync Attendance</h4>
                         <p className="text-white/40 text-xs">Execute check-in or out algorithms.</p>
                      </div>
                  </div>
                  <ArrowRight size={18} className="text-white/20 group-hover:text-emerald-400 transition" />
              </Link>

              <Link to="/employee-dashboard/leave" className="group bg-[#020617] border border-white/10 hover:border-indigo-500/50 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition shrink-0">
                         <Calendar size={20} />
                      </div>
                      <div>
                         <h4 className="text-white font-bold tracking-wide">Apply Time Off</h4>
                         <p className="text-white/40 text-xs">Route formal block constraints to HR.</p>
                      </div>
                  </div>
                  <ArrowRight size={18} className="text-white/20 group-hover:text-indigo-400 transition" />
              </Link>

              <Link to="/employee-dashboard/payroll" className="group bg-[#020617] border border-white/10 hover:border-sky-500/50 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 group-hover:scale-110 transition shrink-0">
                         <CreditCard size={20} />
                      </div>
                      <div>
                         <h4 className="text-white font-bold tracking-wide">Evaluate Finances</h4>
                         <p className="text-white/40 text-xs">Analyze current Net Salary projections.</p>
                      </div>
                  </div>
                  <ArrowRight size={18} className="text-white/20 group-hover:text-sky-400 transition" />
              </Link>
          </div>

          {/* MINI TIMELINE WIDGET */}
          <div className="lg:col-span-3">
              <h3 className="text-sm font-bold tracking-widest text-white/50 uppercase mb-2 pl-2">Recent Execution Flow</h3>
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 h-[calc(100%-2rem)] flex flex-col relative overflow-hidden shadow-2xl">
                  
                  {loading ? (
                       <div className="flex-1 flex items-center justify-center text-emerald-300 italic animate-pulse">Syncing chronological DB traces...</div>
                  ) : recentLogs.length === 0 ? (
                       <div className="flex-1 flex flex-col items-center justify-center text-white/40 italic">
                          <p>No active chronological matrices found.</p>
                       </div>
                  ) : (
                      <div className="space-y-0 h-full overflow-y-auto pr-2 custom-scrollbar">
                         {recentLogs.map((log, i) => (
                             <div key={log._id || i} className="flex gap-4 relative isolate pb-6 last:pb-0 group">
                                 {/* Internal Timeline Line */}
                                 {i !== recentLogs.length - 1 && (
                                     <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-white/10 group-hover:bg-emerald-500/30 transition -z-10"></div>
                                 )}
                                 
                                 <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-white/20 relative z-10 shrink-0 text-emerald-400">
                                     <CheckCircle size={16} />
                                 </div>

                                 <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex-1 hover:bg-white/5 transition flex justify-between items-center group-hover:border-white/20">
                                     <div>
                                        <p className="text-sm font-bold text-white tracking-wide">Standard Attendance Node</p>
                                        <p className="text-xs text-white/40 font-mono mt-1">{log.date}</p>
                                     </div>
                                     <span className="px-3 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] uppercase font-black tracking-widest rounded-full">
                                        Verified
                                     </span>
                                 </div>
                             </div>
                         ))}
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};

const StatusNode = ({ label, value, icon, color, pulse }) => (
    <div className={`bg-gradient-to-br from-[#0f172a] via-[#020617] to-black border ${pulse ? 'border-emerald-500/50' : 'border-white/20'} rounded-3xl p-6 flex flex-col justify-between group overflow-hidden shadow-2xl relative transition duration-300`}>
        <div className="flex justify-between items-start">
           <span className="text-white/60 font-semibold text-xs tracking-widest uppercase">{label}</span>
           <div className={`p-2 rounded-xl bg-slate-900/50 border border-white/5 shadow-lg ${pulse ? 'animate-pulse' : ''}`}>
              {icon && <div className={color}>{icon}</div>}
           </div>
        </div>
        <p className={`text-2xl font-black text-white mt-4 tracking-tight drop-shadow-md ${pulse ? 'text-emerald-300' : ''}`}>
           {value}
        </p>
    </div>
  );

export default EmployeeDashboardHome;
