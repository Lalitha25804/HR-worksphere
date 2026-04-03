import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import EmployeeSidebar from "../../components/layout/EmployeeSidebar";
import EmployeeTopNavbar from "../../components/layout/EmployeeTopNavbar";
import EmployeeSummaryCards from "../../components/employee/EmployeeSummaryCards";
import { logout } from "../../utils/logout"; // ✅ added

const EmployeeDashboard = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/employee-dashboard";

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
      <EmployeeSidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col w-full">

        {/* NAVBAR */}
        <EmployeeTopNavbar onLogout={handleLogout} /> {/* ✅ added */}

        {/* CONTENT */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">

          {isHome ? (
            <>
              <EmployeeSummaryCards />
            </>
          ) : (
            <Outlet />
          )}

        </div>

      </div>

    </div>
  );
};

export default EmployeeDashboard;