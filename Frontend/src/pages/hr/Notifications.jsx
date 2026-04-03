import { useState } from "react";
import { motion } from "framer-motion";

const Notifications = () => {

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "New employee added",
      time: "2 mins ago",
      read: false
    },
    {
      id: 2,
      text: "Payroll processed successfully",
      time: "1 hour ago",
      read: true
    },
    {
      id: 3,
      text: "Leave request pending approval",
      time: "3 hours ago",
      read: false
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (

    <div className="p-6 text-white space-y-6">

      <h2 className="text-2xl font-bold">
        Notifications
      </h2>

      <div className="space-y-4">

        {notifications.map(n => (

          <motion.div
            key={n.id}
            whileHover={{ scale: 1.01 }}
            className={`
              p-4 rounded-xl border
              ${n.read 
                ? "bg-white/5 border-white/10"
                : "bg-indigo-500/10 border-indigo-500/30"}
            `}
          >

            <div className="flex justify-between items-center">

              <div>
                <p className="font-medium">{n.text}</p>
                <p className="text-xs text-gray-400">{n.time}</p>
              </div>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-xs px-3 py-1 bg-indigo-600 rounded"
                >
                  Mark Read
                </button>
              )}

            </div>

          </motion.div>

        ))}

      </div>

    </div>

  );
};

export default Notifications;