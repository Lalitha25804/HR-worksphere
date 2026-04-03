import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import ManagerSidebar from "../../components/manager/ManagerSidebar";
import ManagerTopNavbar from "../../components/manager/ManagerTopNavbar";
import TeamSummaryCards from "../../components/manager/TeamSummaryCards";
import AttendanceChart from "../../components/manager/AttendanceChart";
import LeaveApprovalPanel from "../../components/manager/LeaveApprovalPanel";
import ActivityFeed from "../../components/manager/ActivityFeed";
import { logout } from "../../utils/logout"; // ✅ added

const ManagerDashboard = () => {

  const location = useLocation();
  const navigate = useNavigate(); // ✅ added

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const isHome = location.pathname === "/manager-dashboard";

  // ✅ AUTH CHECK (IMPORTANT)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Manager") {
      navigate("/get-started");
    }
  }, []);

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    logout();
    navigate("/get-started");
  };

  return (

    <div className="min-h-screen flex bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white">

      {/* SIDEBAR */}
      <ManagerSidebar open={sidebarOpen} />

      {/* OVERLAY (mobile only) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-40"
        />
      )}

      {/* MAIN */}
      <div className={`
        flex-1 flex flex-col w-full
        transition-all duration-300
        ${sidebarOpen ? "md:ml-64" : "ml-0"}
      `}>

        {/* NAVBAR */}
        <ManagerTopNavbar 
          toggleSidebar={toggleSidebar} 
          open={sidebarOpen}
          onLogout={handleLogout}   // ✅ added
        />

        {/* CONTENT */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">

          {isHome ? (

            <div className="space-y-6">

              <TeamSummaryCards />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2">
                  <AttendanceChart />
                </div>

                <LeaveApprovalPanel />

              </div>

              <div className="grid grid-cols-1 gap-6">
                 <ActivityFeed />
              </div>

            </div>

          ) : (
            <Outlet />
          )}

        </div>

      </div>

    </div>
  );
};

export default ManagerDashboard;