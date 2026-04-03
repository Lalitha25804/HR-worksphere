import { Bell, Search, UserCircle, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// APIs
import { getMyNotificationsAPI, markNotificationsReadAPI } from "../../api/notificationApi";

const EmployeeTopNavbar = () => {

  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState([]);
  
  const hasUnread = alerts.some(a => !a.isRead);

  /* LOAD GLOBAL DATA */
  useEffect(() => {
    const saved = localStorage.getItem("employeeProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
    
    // Sync Notifications
    const fetchNotifs = async () => {
        try {
            const res = await getMyNotificationsAPI();
            setAlerts(res.data || []);
        } catch(e) {}
    };
    fetchNotifs();
  }, []);

  // Notifications API Check
  const handleMarkRead = async () => {
    try {
        await markNotificationsReadAPI();
        setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    } catch(err) {}
  };

  // Static Local Feature Routing
  const employeeFeatures = [
      { name: "My Leave Requests & Applications", route: "/employee-dashboard/leaves" },
      { name: "My Financial Payslips & Payroll", route: "/employee-dashboard/payslips" },
      { name: "Attendance & Punch In Log", route: "/employee-dashboard/attendance" },
      { name: "Personal Profile Details", route: "/employee-dashboard/profile" }
  ];

  return (
    <div className="
      flex items-center justify-between
      bg-white/10 backdrop-blur-xl border border-white/20
      px-4 py-3 rounded-2xl mb-6 text-white relative z-40
    ">

      {/* SEARCH SYSTEM */}
      <div className="relative">
          <div className="
            flex items-center bg-white/10 border border-white/20
            px-3 py-2 rounded-xl w-72 focus-within:ring-2 focus-within:ring-teal-400/40 relative z-50
          ">
            <Search size={18} className="text-white/60 mr-2" />
            <input
              type="text"
              placeholder="Search features (e.g., 'Leave')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-white placeholder-white/50"
            />
          </div>

          {searchQuery.length > 0 && (
             <div className="absolute top-full left-0 mt-2 w-full bg-[#020617] border border-white/20 shadow-2xl rounded-xl p-2 z-50">
                 {employeeFeatures.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                     employeeFeatures.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((f, i) => (
                         <div key={i} onClick={() => { setSearchQuery(""); navigate(f.route); }} className="p-3 hover:bg-white/10 cursor-pointer rounded-lg border-b border-white/5 last:border-0 transition">
                            <h4 className="text-sm font-semibold text-teal-300">{f.name}</h4>
                            <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">Navigate &rarr;</p>
                         </div>
                     ))
                 ) : (
                     <p className="text-xs text-white/50 italic text-center p-3">No features found locally.</p>
                 )}
             </div>
          )}
      </div>

      {/* RIGHT NAVIGATION COMPONENT */}
      <div className="flex items-center gap-4 relative">

        {/* NOTIFICATIONS */}
        <div className="relative">
          <div
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition cursor-pointer relative"
          >
            <Bell size={20} className="text-white/80" />
            {hasUnread && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse border border-[#0f172a]"></span>}
          </div>

          {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-white/20 shadow-2xl rounded-xl p-3 text-sm z-50">
                <div className="flex justify-between items-center mb-2 px-1">
                   <h4 className="font-semibold text-white">Notifications</h4>
                   {hasUnread && (
                      <button onClick={handleMarkRead} className="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20 text-teal-300">
                         Mark Read
                      </button>
                   )}
                </div>
                <div className="space-y-2">
                    {alerts.length === 0 ? (
                       <p className="text-white/40 italic p-2 text-center text-xs">No active notification packets.</p>
                    ) : alerts.map(a => (
                       <div key={a._id} className={`p-3 rounded-lg border ${a.isRead ? 'bg-white/5 border-white/5 opacity-60' : 'bg-teal-900/30 border-teal-500/30'}`}>
                           <h5 className={`font-semibold text-xs ${a.isRead ? 'text-white/70' : 'text-teal-300'}`}>{a.title}</h5>
                           <p className="text-xs text-white/60 mt-1 leading-snug">{a.message}</p>
                       </div>
                    ))}
                </div>
              </div>
          )}
        </div>

        {/* PROFILE */}
        <div
          onClick={() => navigate("/employee-dashboard/profile")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition cursor-pointer"
        >
          <UserCircle size={26} className="text-white/80" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-white/90">
              {profile?.name || "Employee"}
            </span>
            <span className="text-xs text-white/50">
              {profile?.role || "Employee"}
            </span>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => { logout(); navigate("/get-started"); }}
          className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
        >
          <LogOut size={20} className="text-red-400" />
        </button>

      </div>
    </div>
  );
};

export default EmployeeTopNavbar;