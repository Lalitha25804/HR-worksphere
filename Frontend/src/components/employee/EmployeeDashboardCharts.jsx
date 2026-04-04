import { useState, useEffect, useMemo } from "react";
import { getMyAttendanceAPI } from "../../api/attendanceApi";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { Activity, Clock } from "lucide-react";

const EmployeeDashboardCharts = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getMyAttendanceAPI();
        let fetchedLogs = res.data || [];
        fetchedLogs.sort((a,b) => new Date(b.date) - new Date(a.date));
        setLogs(fetchedLogs);
      } catch (err) {
        console.error("Chart Analytics Sync Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  /* ================= CHART CALCULATION ALGORITHMS ================= */
  
  // 1. Bar Chart Data: Hours worked across the last 7 logged vectors natively
  const barData = useMemo(() => {
     let temp = [];
     const sliced = logs.slice(0, 7).reverse(); // Reverse to read LTR oldest to newest

     sliced.forEach(log => {
        let hrs = log.hoursWorked || 0;
        
        // Dynamically compute runtime if no formal checkout or DB calculation saved yet.
        if (hrs === 0 && log.checkIn) {
            const end = log.checkOut ? new Date(log.checkOut) : new Date();
            const diff = (end - new Date(log.checkIn)) / (1000 * 60 * 60);
            hrs = diff > 0 ? diff : diff + 24; 
        }

        temp.push({
           name: log.date.split('-').slice(1).join('/'), // format mm/dd
           hours: parseFloat(hrs.toFixed(1))
        });
     });
     return temp;
  }, [logs]);

  // 2. Pie Chart Data: Evaluate chronological check-ins generating standard shifts
  const shiftDistribution = useMemo(() => {
     let morning = 0;
     let evening = 0;
     let night = 0;

     logs.forEach(log => {
         if (!log.checkIn) return;
         const hr = new Date(log.checkIn).getHours();
         
         if (hr >= 18 || hr < 6) night++;
         else if (hr >= 12 && hr < 18) evening++;
         else morning++;
     });

     return [
       { name: "Morning", value: morning, color: "#38bdf8" },
       { name: "Evening", value: evening, color: "#f97316" },
       { name: "Night", value: night, color: "#6366f1" },
     ].filter(opt => opt.value > 0); // Hide completely inactive slices
  }, [logs]);

  /* ================= RENDER INTERFACE ================= */

  if (loading) return <div className="animate-pulse text-white/50 text-sm py-4">Evaluating DB arrays...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
       {/* BAR CHART MODULE */}
       <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
           <div className="flex items-center gap-3 mb-6">
              <Activity className="text-emerald-400" size={20} />
              <h3 className="text-white font-semibold tracking-wide">Last 7 Days Attendance Chart</h3>
           </div>
           
           <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={{stroke: "#ffffff20"}} />
                       <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                       <Tooltip 
                          cursor={{fill: "#ffffff10"}} 
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "white" }} 
                       />
                       <Bar dataKey="hours" fill="#34d399" radius={[4, 4, 0, 0]} barSize={35} />
                   </BarChart>
               </ResponsiveContainer>
           </div>
       </div>

       {/* CONTINUOUS LAYER GRID (Pie + Activity) */}
       <div className="flex flex-col gap-6 w-full">
           
           {/* PIE CHART MODULE */}
           <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl flex-1 shadow-xl flex flex-col">
               <div className="flex items-center gap-3 mb-2">
                  <Clock className="text-teal-400" size={20} />
                  <h3 className="text-white font-semibold tracking-wide">Shift Distribution</h3>
               </div>

               <div className="flex-1 flex items-center justify-center min-h-[200px]">
                   {shiftDistribution.length === 0 ? (
                      <span className="text-white/40 italic text-sm">No shifts found.</span>
                   ) : (
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie 
                                 data={shiftDistribution} 
                                 cx="50%" cy="50%" 
                                 innerRadius={50} outerRadius={70} 
                                 paddingAngle={4} 
                                 dataKey="value"
                                 stroke="none"
                              >
                                 {shiftDistribution.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "white" }} />
                              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: "12px", color: "#ffffff80"}} />
                          </PieChart>
                      </ResponsiveContainer>
                   )}
               </div>
           </div>

           {/* RECENT ACTIVITY MODULE */}
           <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl">
               <h3 className="text-white font-semibold tracking-wide mb-4">Recent Activities</h3>
               
               <div className="space-y-4 max-h-56 pr-2 overflow-y-auto custom-scrollbar">
                   {logs.slice(0, 4).map((log, i) => (
                       <div key={log._id || i} className="flex gap-4 items-start group">
                           <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0 group-hover:scale-150 transition shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                           <div>
                               <p className="text-xs text-white/50">{log.date}</p>
                               <p className="text-sm text-white/90 mt-1">
                                   <span className="text-white/70">Checked in at</span> <span className="text-emerald-300 font-semibold">{log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Unknown'}</span> 
                                   {log.checkOut ? (
                                      <>
                                         <span className="text-white/70 mx-1">and checked out at</span> 
                                         <span className="text-indigo-300 font-semibold">{new Date(log.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                      </>
                                   ) : (
                                      <span className="text-indigo-300 italic ml-1">(Currently Active)</span>
                                   )}
                               </p>
                           </div>
                       </div>
                   ))}
               </div>
           </div>

       </div>
    </div>
  );
};

export default EmployeeDashboardCharts;
