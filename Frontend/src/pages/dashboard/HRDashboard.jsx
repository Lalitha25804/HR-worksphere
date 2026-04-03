import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import SummaryCards from "../../components/hr/SummaryCards";
import AttendanceOverview from "../../components/hr/AttendanceOverview";
import PendingApprovals from "../../components/hr/PendingApprovals";
import ActivityFeed from "../../components/hr/ActivityFeed";
import QuickActions from "../../components/hr/QuickActions";

import { logout } from "../../utils/logout"; // ✅ added

const HRDashboard = () => {

  const location = useLocation();
  const navigate = useNavigate(); // ✅ added

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isHome = location.pathname === "/hr-dashboard";

  // ✅ Auto redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "HR") {
      navigate("/get-started");
    }
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    logout();
    navigate("/get-started");
  };

  return (

    <div className="min-h-screen flex
    bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">

      <Sidebar open={sidebarOpen} />

      <div className="flex-1 flex flex-col">

        {/* ✅ pass logout to navbar */}
        <TopNavbar toggleSidebar={toggleSidebar} onLogout={handleLogout} />

        <div className="p-8 max-w-7xl mx-auto w-full">

          {isHome ? (

            <div className="space-y-6">

              <SummaryCards />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2">
                  <AttendanceOverview />
                </div>

                <PendingApprovals />

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2">
                  <ActivityFeed />
                </div>

                <QuickActions />

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

export default HRDashboard;