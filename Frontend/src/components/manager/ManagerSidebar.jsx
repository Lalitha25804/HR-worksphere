import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Settings,
  LogOut,
  Briefcase,
  CreditCard
} from "lucide-react";

const ManagerSidebar = ({ open }) => {
  return (
    <aside
      className={`
        fixed top-0 left-0 z-50
        h-screen w-64
        p-6 text-white
        bg-white/5 backdrop-blur-xl border-r border-white/20
        shadow-[0_0_30px_rgba(0,0,0,0.3)]

        transform transition-all duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* HEADER */}
      <h2 className="text-xl font-semibold mb-8 tracking-wide">
        Manager Panel
      </h2>

      {/* NAVIGATION */}
      <nav className="flex flex-col gap-2">

        <NavItem
          to="/manager-dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          end
        />

        <NavItem
          to="/manager-dashboard/team"
          icon={<Users size={18} />}
          label="My Team"
        />

        <NavItem
          to="/manager-dashboard/my-attendance"
          icon={<Clock size={18} />}
          label="Mark Attendance"
        />

        <NavItem
          to="/manager-dashboard/attendance"
          icon={<Clock size={18} />}
          label="Team Attendance"
        />

        <NavItem
          to="/manager-dashboard/leave"
          icon={<Calendar size={18} />}
          label="Apply Leave"
        />

        <NavItem
          to="/manager-dashboard/shift"
          icon={<Briefcase size={18} />}
          label="Shift"
        />



        <NavItem
          to="/manager-dashboard/payroll"
          icon={<CreditCard size={18} />}
          label="Payroll"
        />

        <NavItem
          to="/manager-dashboard/profile"
          icon={<Users size={18} />}
          label="Profile"
        />

      </nav>

      {/* LOGOUT */}
      <div className="absolute bottom-6 left-6 right-6 border-t border-white/10 pt-4">
        <NavLink
          to="/manager-login"
          className="
            flex items-center gap-3 px-4 py-2 rounded-xl
            text-red-400 hover:bg-red-500/10 transition
          "
        >
          <LogOut size={18} /> Logout
        </NavLink>
      </div>
    </aside>
  );
};

/* REUSABLE NAV ITEM */
const NavItem = ({ to, icon, label, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `
        flex items-center gap-3 px-4 py-2 rounded-xl
        transition duration-300

        ${isActive
          ? "bg-white/15 border border-white/20 border-l-4 border-l-white"
          : "hover:bg-white/10"
        }
        `
      }
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
};

export default ManagerSidebar;