import { Routes, Route } from "react-router-dom";

import Landing from "../pages/landing/Landing";
import GetStarted from "../pages/get-started/GetStarted";
import Register from "../pages/auth/Register";

import HRLogin from "../pages/auth/HRLogin";
import ManagerLogin from "../pages/auth/ManagerLogin";
import EmployeeLogin from "../pages/auth/EmployeeLogin";

import HRDashboard from "../pages/dashboard/HRDashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";
import EmployeeDashboard from "../pages/dashboard/EmployeeDashboard";
import EmployeeDashboardHome from "../pages/employeedashboard/EmployeeDashboardHome";
import EmployeeShift from "../pages/employeedashboard/EmployeeShift";
import EmployeePayroll from "../pages/employeedashboard/EmployeePayroll";

import AddEmployee from "../pages/hr/AddEmployee";
import AddManager from "../pages/hr/AddManager";
import GeneratePayroll from "../pages/hr/GeneratePayroll";
import ViewCredentials from "../pages/hr/ViewCredentials";
import ImportData from "../pages/hr/ImportData";
import MarkManagerAttendance from "../pages/hr/MarkManagerAttendance";

import Employees from "../pages/dashboard/Employees";
import Attendance from "../pages/dashboard/Attendance";
import LeaveRequests from "../pages/dashboard/LeaveRequests";
import Payroll from "../pages/dashboard/Payroll";
import Shifts from "../pages/dashboard/Shifts";
import Settings from "../pages/dashboard/Settings";
import PayrollHistory from "../pages/payroll/PayrollHistory";
import MyAttendance from "../pages/employee/MyAttendance";
import LeaveRequest from "../pages/employee/LeaveRequest";

import HRProfile from "../pages/hr/HRProfile";
import Notifications from "../pages/hr/Notifications";
import EmployeeProfile from "../pages/employee/EmployeeProfile";

import MyTeam from "../pages/managerdashboard/MyTeam";
import TeamAttendance from "../pages/managerdashboard/ManagerAttendance";
import ManagerShifts from "../pages/managerdashboard/ManagerShifts";
import ManagerPayroll from "../pages/managerdashboard/ManagerPayroll";

import MarkTeamAttendance from "../pages/managerdashboard/MarkTeamAttendance";
import ManagerSettings from "../pages/managerdashboard/ManagerSettings";
import ManagerAssignShift from "../pages/managerdashboard/ManagerAssignShift";
import GenerateReport from "../pages/managerdashboard/GenerateReport";
import ExportData from "../pages/managerdashboard/ExportData";
import ManagerProfile from "../pages/managerdashboard/ManagerProfile";
import TeamMemberProfile from "../pages/managerdashboard/TeamMemberProfile";
import EmployeeDetail from "../pages/managerdashboard/EmployeeDetail";

import ProtectedRoute from "../components/auth/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Landing */}
      <Route path="/" element={<Landing />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/register" element={<Register />} />

      {/* Login */}
      <Route path="/hr-login" element={<HRLogin />} />
      <Route path="/manager-login" element={<ManagerLogin />} />
      <Route path="/employee-login" element={<EmployeeLogin />} />

      {/* ================= HR DASHBOARD ================= */}
      <Route
        path="/hr-dashboard"
        element={
          <ProtectedRoute role="HR">
            <HRDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Employees />} />

        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="mark-manager-attendance" element={<MarkManagerAttendance />} />
        <Route path="leave-requests" element={<LeaveRequests />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="shifts" element={<Shifts />} />
        <Route path="settings" element={<Settings />} />

        <Route path="profile" element={<HRProfile />} />
        <Route path="notifications" element={<Notifications />} />

        <Route path="add-employee" element={<AddEmployee />} />
        <Route path="add-manager" element={<AddManager />} />
        <Route path="view-credentials" element={<ViewCredentials />} />
        <Route path="generate-payroll" element={<GeneratePayroll />} />
        <Route path="payroll-history" element={<PayrollHistory />} />
        <Route path="import-data" element={<ImportData />} />
      </Route>

      {/* ================= MANAGER DASHBOARD ================= */}
      <Route
        path="/manager-dashboard"
        element={
          <ProtectedRoute role="Manager">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyTeam />} />

        <Route path="team" element={<MyTeam />} />
        <Route path="my-attendance" element={<MarkTeamAttendance />} />
        <Route path="attendance" element={<TeamAttendance />} />
        <Route path="shift" element={<ManagerShifts />} />
        <Route path="payroll" element={<ManagerPayroll />} />
        <Route path="leave" element={<LeaveRequest />} />

        <Route path="assign-shift" element={<ManagerAssignShift />} />
        <Route path="generate-report" element={<GenerateReport />} />
        <Route path="export-data" element={<ExportData />} />

        <Route path="settings" element={<ManagerSettings />} />
        <Route path="profile" element={<ManagerProfile />} />

        {/* Dynamic Routes */}
        <Route path="team/:id" element={<TeamMemberProfile />} />
        <Route path="team/:id/detail" element={<EmployeeDetail />} />
      </Route>

      {/* ================= EMPLOYEE DASHBOARD ================= */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute role="Employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboardHome />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="attendance" element={<MyAttendance />} />
        <Route path="shift" element={<EmployeeShift />} />
        <Route path="payroll" element={<EmployeePayroll />} />
        <Route path="leave" element={<LeaveRequest />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;