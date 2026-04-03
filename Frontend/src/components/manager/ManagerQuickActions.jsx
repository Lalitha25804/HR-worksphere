import { ClipboardList, Clock, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ManagerQuickActions = () => {

  const navigate = useNavigate();

  const actions = [
    {
      label: "Assign Task",
      icon: ClipboardList,
      path: "/manager-dashboard/assign-task"
    },
    {
      label: "Assign Shift",
      icon: Clock,
      path: "/manager-dashboard/assign-shift"
    },
    {
      label: "Generate Report",
      icon: FileText,
      path: "/manager-dashboard/generate-report"
    },
    {
      label: "Export Data",
      icon: Download,
      path: "/manager-dashboard/export-data"
    }
  ];

  return (

    <div className="
    bg-white/10
    backdrop-blur-xl
    border border-white/20
    p-6
    rounded-xl
    text-white
    ">

      <h3 className="text-lg font-semibold mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-4">

        {actions.map((action, index) => {

          const Icon = action.icon;

          return (

            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className="
              flex items-center gap-3
              p-3
              rounded-xl
              bg-white/5
              border border-white/10
              hover:bg-white/10
              transition
              "
            >

              <div className="
              p-2
              rounded-lg
              bg-indigo-500/20
              text-indigo-300
              ">
                <Icon size={18} />
              </div>

              <span className="text-sm font-medium">
                {action.label}
              </span>

            </motion.button>

          );

        })}

      </div>

    </div>

  );
};

export default ManagerQuickActions;