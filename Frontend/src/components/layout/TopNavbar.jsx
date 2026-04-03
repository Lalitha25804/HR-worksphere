import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { logout } from "../../utils/logout";

// APIs
import { getEmployeesAPI } from "../../api/employeesApi";
import { getMyNotificationsAPI, markNotificationsReadAPI } from "../../api/notificationApi";

const TopNavbar = ({ toggleSidebar }) => {

  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const hasUnread = alerts.some(a => !a.isRead);

  // Sync Global Data
  useEffect(() => {
     const spinUp = async () => {
         try {
             const [eRes, nRes] = await Promise.all([
                 getEmployeesAPI(),
                 getMyNotificationsAPI()
             ]);
             setEmployees(eRes.data || []);
             setAlerts(nRes.data || []);
         } catch(e) { console.error(e); }
     };
     spinUp();
  }, []);

  // Actions
  const handleMarkRead = async () => {
    try {
       await markNotificationsReadAPI();
       setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    } catch(e) {}
  };

  return (
    <div className="h-16 bg-white/10 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-6 text-white relative z-40">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <Menu size={22} />
        </motion.button>

        {/* SEARCH WIDGET */}
        <div className="relative z-50">
          <Search size={16} className="absolute left-3 top-3 text-white/50" />
          <input
            type="text"
            placeholder="Search Global Profiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-72 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {searchQuery.length > 0 && (
             <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-white/20 rounded-xl overflow-hidden shadow-2xl z-50">
                {employees.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.empId && t.empId.toLowerCase().includes(searchQuery.toLowerCase()))).length > 0 ? (
                  employees.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.empId && t.empId.toLowerCase().includes(searchQuery.toLowerCase()))).slice(0, 5).map(emp => (
                   <div key={emp._id} onClick={() => { setSearchQuery(""); navigate(`/hr-dashboard/employees?search=${emp.name}`); }} className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3 transition">
                      <div className="min-w-[32px] w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/30">
                         {emp.name.substring(0,2)}
                      </div>
                      <div className="flex flex-col truncate">
                         <span className="text-sm font-semibold truncate">{emp.name}</span>
                         <span className="text-[10px] text-white/50">{emp.empId}</span>
                      </div>
                   </div>
                  ))
                ) : (
                   <div className="p-4 text-xs text-white/50 italic text-center">No matching global profiles.</div>
                )}
             </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {/* NOTIFICATIONS */}
        <div className="relative">
            <motion.div
              whileHover={{ scale: 1.15 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-lg hover:bg-white/10 cursor-pointer relative"
            >
              <Bell size={20} />
              {hasUnread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#0f172a]"></span>}
            </motion.div>

            {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-slate-800 border border-white/20 shadow-2xl rounded-xl p-3 text-sm z-50">
                  <div className="flex justify-between items-center mb-2 px-1">
                     <h4 className="font-semibold text-white">Notifications</h4>
                     {hasUnread && (
                        <button onClick={handleMarkRead} className="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20 text-indigo-300">
                           Mark Read
                        </button>
                     )}
                  </div>
                  <div className="space-y-2">
                      {alerts.length === 0 ? (
                         <p className="text-white/40 italic p-2 text-center text-xs">No active notification packets.</p>
                      ) : alerts.map(a => (
                         <div key={a._id} className={`p-3 rounded-lg border ${a.isRead ? 'bg-white/5 border-white/5 opacity-60' : 'bg-indigo-900/30 border-indigo-500/30'}`}>
                             <h5 className={`font-semibold text-xs ${a.isRead ? 'text-white/70' : 'text-indigo-300'}`}>{a.title}</h5>
                             <p className="text-xs text-white/60 mt-1 leading-snug">{a.message}</p>
                         </div>
                      ))}
                  </div>
                </div>
            )}
        </div>

        {/* Profile */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          onClick={() => navigate("/hr-dashboard/profile")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full border border-white/20 bg-indigo-500/20 text-indigo-200 flex items-center justify-center font-bold">HR</div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold">HR Admin</p>
            <p className="text-xs text-white/50">View Profile</p>
          </div>
        </motion.div>

        {/* 🔥 LOGOUT BUTTON */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => { logout(); navigate("/get-started"); }}
          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
        >
          <LogOut size={20} />
        </motion.button>

      </div>

    </div>
  );
};

export default TopNavbar;