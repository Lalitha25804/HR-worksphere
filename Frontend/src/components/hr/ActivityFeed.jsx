import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllAttendanceAPI } from "../../api/attendanceApi";
import { getAllLeavesAPI } from "../../api/leaveApi";

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Setup a small interval to constantly refresh the feed every 30 seconds for that "live" HR dashboard feel
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [attRes, leaveRes] = await Promise.all([
        getAllAttendanceAPI(),
        getAllLeavesAPI()
      ]);

      const attLogs = attRes.data || [];
      const leaveLogs = leaveRes.data || [];

      let combined = [];

      // 1. Process Real Attendance Logs
      attLogs.forEach(log => {
        if (log.checkIn) {
          combined.push({
             icon: "🟢",
             text: `${log.employeeId?.name || "An Employee"} checked into shift (${log.shift || 'Standard'})`,
             timeStr: log.checkIn
          });
        }
        if (log.checkOut) {
          combined.push({
             icon: "🔴",
             text: `${log.employeeId?.name || "An Employee"} checked out`,
             timeStr: log.checkOut
          });
        }
      });

      // 2. Process Real Leave Requests
      leaveLogs.forEach(log => {
         if (log.createdAt) {
           combined.push({
             icon: log.status === "Approved" ? "✅" : log.status === "Rejected" ? "❌" : "📝",
             text: `${log.employeeId?.name || "An Employee"} ${log.status === 'Pending' ? 'applied for' : log.status.toLowerCase()} leave`,
             timeStr: log.updatedAt || log.createdAt
           });
         }
      });

      // 3. Sort by exact chronological Database timestamps
      combined.sort((a, b) => new Date(b.timeStr) - new Date(a.timeStr));

      // 4. Map into format the UI expects
      const finalActs = combined.slice(0, 6).map(act => ({
        icon: act.icon,
        text: act.text,
        time: getTimeAgo(act.timeStr)
      }));

      setActivities(finalActs);
    } catch (err) {
      console.error("Failed to fetch live activity feed", err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "Unknown";
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / (1000 * 60)); // minutes

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;

    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hr ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return `Yesterday`;

    return `${days} days ago`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-xl shadow-xl text-white">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        Live Feed <span className="flex w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
      </h3>
      
      {loading && activities.length === 0 ? (
         <div className="text-sm text-white/50 animate-pulse py-4">Scanning live database events...</div>
      ) : activities.length === 0 ? (
         <div className="text-sm text-white/50 py-4">No recent database activity found.</div>
      ) : (
         <div className="space-y-4">
           {activities.map((a, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.08 }}
               className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-lg hover:bg-white/20 transition"
             >
               <div className="flex items-center gap-3">
                 <span className="text-lg">{a.icon}</span>
                 <span className="text-sm text-gray-200 font-medium">{a.text}</span>
               </div>
               <span className="text-xs text-gray-400 whitespace-nowrap">{a.time}</span>
             </motion.div>
           ))}
         </div>
      )}
    </div>
  );
};

export default ActivityFeed;