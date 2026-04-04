import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import EmployeeSidebar from "../../components/layout/EmployeeSidebar";
import EmployeeTopNavbar from "../../components/layout/EmployeeTopNavbar";
import EmployeeSummaryCards from "../../components/employee/EmployeeSummaryCards";
import EmployeeDashboardCharts from "../../components/employee/EmployeeDashboardCharts";
import { logout } from "../../utils/logout"; // ✅ added

const EmployeeDashboard = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/employee-dashboard";

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // ✅ AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Employee") {
      navigate("/get-started");
    }
  }, []);

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    logout();
    navigate("/get-started");
  };

  return (
    <div className="
      flex min-h-screen
      bg-gradient-to-br 
      from-[#042f2e] via-[#022c22] to-black
      text-white
    ">

      {/* SIDEBAR */}
      <EmployeeSidebar open={sidebarOpen} />

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
        <EmployeeTopNavbar 
          toggleSidebar={toggleSidebar} 
          open={sidebarOpen} 
          onLogout={handleLogout} 
        /> {/* ✅ added */}

        {/* CONTENT */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">

          {isHome ? (
            <div className="space-y-6">
              <EmployeeSummaryCards />
              <EmployeeDashboardCharts />
            </div>
          ) : (
            <Outlet />
          )}

        </div>

      </div>

    </div>
  );
};

export default EmployeeDashboard;