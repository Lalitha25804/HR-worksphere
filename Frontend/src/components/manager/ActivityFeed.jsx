import { useState, useEffect, useMemo } from "react";
import { Clock, CalendarDays, Key } from "lucide-react";
import { getEmployeesAPI } from "../../api/employeesApi";
import { getAllAttendanceAPI } from "../../api/attendanceApi";
import { getAllLeavesAPI } from "../../api/leaveApi";

const ActivityFeed = () => {

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrix = async () => {
       try {
          const [emp, att, lev] = await Promise.all([
             getEmployeesAPI(),
             getAllAttendanceAPI(),
             getAllLeavesAPI() // Assuming HR mapping applies constraints internally
          ]);
          setEmployees(emp.data || []);
          setAttendance(att.data || []);
          setLeaves(lev.data || []);
       } catch(e) {} finally { setLoading(false); }
    };
    fetchMatrix();
  }, []);

  const feedItems = useMemo(() => {
     if (!employees.length) return [];
     
     const validEmpIds = employees.map(e => e._id.toString());
     const timeline = [];

     // Parse Leaves
     leaves.forEach(req => {
         const empId = req.employeeId?._id?.toString() || req.employeeId;
         if (!validEmpIds.includes(empId)) return;
         
         const empName = req.employeeId?.name || "System User";
         timeline.push({
             id: `l-${req._id}`,
             type: 'leave',
             title: `Leave Action: ${req.status}`,
             desc: `${empName} applied for leave (${req.fromDate?.substring(0,10)} to ${req.toDate?.substring(0,10)})`,
             date: req.createdAt || req.updatedAt || new Date().toISOString(),
             icon: <CalendarDays size={18} className="text-orange-400" />,
             bg: 'bg-orange-500/20 border-orange-500/30'
         });
     });

     // Parse Punches (Last 30 active days context approx)
     attendance.forEach(att => {
         const empId = att.employeeId?._id?.toString() || att.employeeId;
         if (!validEmpIds.includes(empId)) return;
         
         const empName = att.employeeId?.name || "System User";
         
         if (att.checkIn) {
            timeline.push({
               id: `a-in-${att._id}`,
               type: 'checkin',
               title: `Verified Punch-In`,
               desc: `${empName} began shift at ${new Date(att.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
               date: att.checkIn,
               icon: <Key size={18} className="text-emerald-400" />,
               bg: 'bg-emerald-500/20 border-emerald-500/30'
            });
         }
         
         if (att.checkOut) {
            timeline.push({
               id: `a-out-${att._id}`,
               type: 'checkout',
               title: `Verified Punch-Out`,
               desc: `${empName} completed shift at ${new Date(att.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
               date: att.checkOut,
               icon: <Clock size={18} className="text-indigo-400" />,
               bg: 'bg-indigo-500/20 border-indigo-500/30'
            });
         }
     });

     // Chronological Sort (Newest First)
     return timeline.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 15); // Limit to top 15 recent actions

  }, [employees, attendance, leaves]);

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative flex flex-col h-full max-h-[400px]">
      <h3 className="text-lg font-semibold text-white mb-4">
        Live Team Activity Feed
      </h3>

      {loading && (
        <div className="absolute inset-0 bg-[#0f172a]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
           <span className="text-indigo-200/50 italic animate-pulse text-sm">Decoding Action Logs...</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
         {feedItems.length === 0 ? (
            <p className="text-white/40 italic text-sm text-center mt-10">No recent activity found.</p>
         ) : feedItems.map(item => (
            <div key={item.id} className="flex gap-4 items-start">
               {/* Node Line Style */}
               <div className="relative flex flex-col items-center">
                   <div className={`p-2 rounded-full border ${item.bg} shadow-md`}>
                       {item.icon}
                   </div>
               </div>

               {/* Payload */}
               <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 pb-4">
                  <div className="flex justify-between items-start">
                     <h4 className="text-sm font-semibold text-white tracking-wide">{item.title}</h4>
                     <span className="text-[10px] text-white/40 uppercase font-mono">{new Date(item.date).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 leading-snug">
                     {item.desc}
                  </p>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
