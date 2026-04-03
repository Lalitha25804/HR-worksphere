import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { attendanceLogs } from "../../data/attendanceLogs";

const actions = [
  {
    title: "Add Employee",
    icon: "👤",
    path: "/hr-dashboard/add-employee",
    glow: "hover:shadow-blue-400/30"
  },
  {
    title: "View Credentials",
    icon: "🔐",
    path: "/hr-dashboard/view-credentials",
    glow: "hover:shadow-green-400/30"
  },
  {
    title: "Generate Payroll",
    icon: "💰",
    path: "/hr-dashboard/generate-payroll",
    glow: "hover:shadow-purple-400/30"
  }
];

const QuickActions = () => {

  const hasAttendance = attendanceLogs.length > 0;

  const handleClick = (title, e) => {
    if (title === "Generate Payroll" && !hasAttendance) {
      e.preventDefault();
      alert("No attendance data available");
    }
  };

  return (
    <div className="
    bg-white/10 backdrop-blur-xl border border-white/20
    p-5 rounded-2xl shadow-xl text-white
    ">

      <h3 className="text-lg font-semibold mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-3 gap-3">

        {actions.map((action, index) => (

          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >

            <Link
              to={action.path}
              onClick={(e)=>handleClick(action.title, e)}
              className={`flex flex-col items-center justify-center
              h-20 p-3 rounded-lg
              bg-white/10 border border-white/10
              transition-all duration-300
              hover:bg-white/20 hover:border-white/30
              shadow-lg ${action.glow}`}
            >

              <motion.span
                whileHover={{ rotate: 8, scale: 1.1 }}
                className="text-xl mb-1"
              >
                {action.icon}
              </motion.span>

              <span className="text-xs font-semibold text-center text-gray-200">
                {action.title}
              </span>

            </Link>

          </motion.div>

        ))}

      </div>

    </div>
  );
};

export default QuickActions;