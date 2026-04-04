import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const menuItems = [
  { name: "Dashboard", icon: "📊", path: "/hr-dashboard", end: true },
  { name: "Employees", icon: "👥", path: "/hr-dashboard/employees" },
  { name: "Attendance", icon: "🕒", path: "/hr-dashboard/attendance" },
  { name: "Mark Manager Attendance", icon: "⏰", path: "/hr-dashboard/mark-manager-attendance" },
  { name: "Leave Requests", icon: "📅", path: "/hr-dashboard/leave-requests" },
  { name: "Payroll", icon: "💰", path: "/hr-dashboard/payroll" },
  { name: "Payroll History", icon: "📜", path: "/hr-dashboard/payroll-history" },
  { name: "Shifts", icon: "🕓", path: "/hr-dashboard/shifts" },
  { name: "Credentials", icon: "🔐", path: "/hr-dashboard/view-credentials" },
  { name: "Import HR Data", icon: "📥", path: "/hr-dashboard/import-data" },
  { name: "Settings", icon: "⚙", path: "/hr-dashboard/settings" }
];

const Sidebar = ({ open }) => {
  return (
    <aside
      className={`
      bg-white/10 backdrop-blur-xl border-r border-white/20 text-white
      flex flex-col justify-between min-h-screen
      transition-all duration-300
      ${open ? "w-64 p-6" : "w-0 p-0 overflow-hidden"}
      `}
    >

      <div>

        {open && (
          <h2 className="text-2xl font-bold mb-8 tracking-wide">
            HR Panel
          </h2>
        )}

        {open && (
          <motion.nav className="space-y-2 text-sm">

            {menuItems.map((itemData, index) => (

              <motion.div key={index}>

                <NavLink
                  to={itemData.path}
                  end={itemData.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "hover:bg-white/10 text-gray-300"
                    }`
                  }
                >
                  <span className="text-lg">{itemData.icon}</span>
                  {itemData.name}
                </NavLink>

              </motion.div>

            ))}

          </motion.nav>
        )}

      </div>

      {open && (
        <NavLink
          to="/"
          className="
          flex items-center gap-3 p-3 rounded-lg
          text-red-400 hover:bg-red-500/20
          transition
          "
        >
          <span>🚪</span>
          Logout
        </NavLink>
      )}

    </aside>
  );
};

export default Sidebar;