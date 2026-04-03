import { Bell, Search, UserCircle, Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEmployeesAPI } from "../../api/employeesApi";
import { getMyNotificationsAPI, markNotificationsReadAPI } from "../../api/notificationApi";

const ManagerTopNavbar = ({ toggleSidebar, open }) => {

  const [profile, setProfile] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [teamNodes, setTeamNodes] = useState([]);

  const [alerts, setAlerts] = useState([]);
  const hasUnread = alerts.some(a => !a.isRead);

  // Mark Read Function
  const handleMarkRead = async () => {
    try {
      await markNotificationsReadAPI();
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    } catch(err) { console.error(err); }
  };

  /* LOAD GLOBAL ASSETS */
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [resTeam, resNotifs] = await Promise.all([
           getEmployeesAPI(),
           getMyNotificationsAPI()
        ]);
        setTeamNodes(resTeam.data || []);
        setAlerts(resNotifs.data || []);
      } catch (err) {
        console.error("Master Sync error", err);
      }
    };
    fetchTeam();
    
    const saved = localStorage.getItem("managerProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    logout();
    navigate("/get-started");
  };

  return (
    <div className="
      flex items-center justify-between
      bg-white/10 backdrop-blur-xl border border-white/20
      px-4 py-3 rounded-2xl mb-6
      sticky top-0 z-40
    ">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        <button
          onClick={toggleSidebar}
          className={`
            p-2 rounded-xl border border-white/20 transition
            ${open ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}
          `}
        >
          <Menu size={20} />
        </button>

        <div className="
          hidden md:flex items-center 
          bg-white/10 border border-white/20 backdrop-blur-md
          px-3 py-2 rounded-xl w-64 relative
        ">
          <Search size={18} className="text-white/60 mr-2" />
          <input
            type="text"
            placeholder="Search Team Members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm w-full text-white placeholder-white/50"
          />

          {searchQuery.length > 0 && (
             <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-white/20 rounded-xl overflow-hidden shadow-2xl z-50">
                {teamNodes.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.empId && t.empId.toLowerCase().includes(searchQuery.toLowerCase()))).length > 0 ? (
                  teamNodes.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.empId && t.empId.toLowerCase().includes(searchQuery.toLowerCase()))).slice(0, 5).map(emp => (
                   <div key={emp._id} onClick={() => { setSearchQuery(""); navigate(`/manager-dashboard/team/${emp._id}/detail`); }} className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3 transition">
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
                   <div className="p-4 text-xs text-white/50 italic text-center">No matching profiles found in database.</div>
                )}
             </div>
          )}
        </div>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* 🔔 NOTIFICATIONS */}
        <div className="relative">
          <div
            onClick={() => setNotifOpen(!notifOpen)}
            className="
              p-2 rounded-xl bg-white/10 border border-white/20
              hover:bg-white/20 transition cursor-pointer
            "
          >
            <Bell size={20} className="text-white/80" />
            {hasUnread && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#0f172a]"></span>}
          </div>

          {notifOpen && (
            <div className="
              absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto
              bg-slate-800 border border-white/20 shadow-2xl
              rounded-xl p-3 text-sm z-50
            ">
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

        {/* 👤 PROFILE */}
        <div
          onClick={() => navigate("/manager-dashboard/profile")}
          className="
            flex items-center gap-2 px-3 py-1.5 rounded-xl
            bg-white/10 border border-white/20
            hover:bg-white/20 transition cursor-pointer
          "
        >
          <UserCircle size={26} className="text-white/80" />

          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium text-white/90">
              {profile?.name || "Manager"}
            </span>
            <span className="text-xs text-white/50">
              {profile?.role || "Manager"}
            </span>
          </div>
        </div>

        {/* 🔥 LOGOUT */}
        <button
          onClick={handleLogout}
          className="
            p-2 rounded-xl bg-red-500/10 border border-red-500/20
            hover:bg-red-500/20 transition
          "
        >
          <LogOut size={20} className="text-red-400" />
        </button>

      </div>

    </div>
  );
};

export default ManagerTopNavbar;