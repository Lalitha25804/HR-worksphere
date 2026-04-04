import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  LogOut,
  Users,
  Briefcase,
  CreditCard
} from "lucide-react";

const EmployeeSidebar = ({ open }) => {
  return (
    <aside className={`
      fixed top-0 left-0 z-50
      h-screen w-64 p-6 text-white
      bg-white/5 backdrop-blur-xl border-r border-white/20
      shadow-[0_0_30px_rgba(0,0,0,0.3)]
      transform transition-all duration-300 ease-in-out
      ${open ? "translate-x-0" : "-translate-x-full"}
    `}>

      <h2 className="text-xl font-semibold mb-8 tracking-wide">
        Employee Panel
      </h2>

      <nav className="flex flex-col gap-2">

        <NavItem
          to="/employee-dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          end
        />

        <NavItem
          to="/employee-dashboard/attendance"
          icon={<Clock size={18} />}
          label="MyAttendance"
        />

        <NavItem
          to="/employee-dashboard/shift"
          icon={<Briefcase size={18} />}
          label="Shift"
        />

        <NavItem
          to="/employee-dashboard/leave"
          icon={<Calendar size={18} />}
          label="Leave Request"
        />

        <NavItem
          to="/employee-dashboard/payroll"
          icon={<CreditCard size={18} />}
          label="Payroll"
        />

      </nav>

      {/* LOGOUT */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <NavLink
          to="/"
          className="
            flex items-center gap-3 px-4 py-2 rounded-xl
            text-red-400 hover:bg-red-500/10 transition
          "
        >
          <LogOut size={18} />
          Logout
        </NavLink>
      </div>

    </aside>
  );
};

/* NAV ITEM */
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
          ? "bg-white/15 border border-white/20 border-l-4 border-l-teal-400 text-white"
          : "hover:bg-white/10 text-white/80"
        }
        `
      }
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
};

export default EmployeeSidebar;