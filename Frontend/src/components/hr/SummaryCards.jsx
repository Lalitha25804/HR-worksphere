import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getEmployeesAPI } from "../../api/employeesApi";
import { getAllAttendanceAPI } from "../../api/attendanceApi";
import { getAllLeavesAPI } from "../../api/leaveApi";
import { getPayrollAPI } from "../../api/payrollApi";

const SummaryCards = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    leaveToday: 0,
    totalPayroll: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Silently refresh summary stats every 60 seconds for live presence tracking
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const today = new Date();
      const todayDateStr = today.toISOString().split("T")[0];
      const monthStr = String(today.getMonth() + 1).padStart(2, '0');
      const yearStr = String(today.getFullYear());

      // 1. Parallel fetch top-level generic resources
      const [empRes, attRes, leaveRes] = await Promise.all([
        getEmployeesAPI(),
        getAllAttendanceAPI(),
        getAllLeavesAPI()
      ]);

      const employees = empRes.data || [];
      const attendance = attRes.data || [];
      const leaves = leaveRes.data || [];

      const totalEmployees = employees.length;

      // 2. Compute Present Today (Unique IDs to prevent double counting if multiple check-ins)
      const presentUniqueIds = new Set(
         attendance
           .filter(log => log.date === todayDateStr)
           .map(l => l.employeeId?._id || l.employeeId)
      );
      const presentToday = presentUniqueIds.size;

      // 3. Compute On-Leave Today from Approved Global Tracker
      const leaveToday = leaves.filter(l => {
         if (l.status !== "Approved") return false;
         const start = new Date(l.fromDate).toISOString().split("T")[0];
         const end = new Date(l.toDate).toISOString().split("T")[0];
         return todayDateStr >= start && todayDateStr <= end;
      }).length;

      // 4. Compute Cumulative Net Payroll exactly matching Employee Payslips math mapping
      let totalPayroll = 0;
      await Promise.all(
         employees.map(async (emp) => {
           try {
              const payRes = await getPayrollAPI(emp._id, monthStr, yearStr);
              // Only sum valid processed numerical salary logic
              if (payRes.data?.salary && !isNaN(payRes.data.salary)) {
                 totalPayroll += payRes.data.salary;
              }
           } catch (e) {
              // Gracefully continue if an employee lacks data or throws a generic error
           }
         })
      );

      setStats({
        totalEmployees,
        presentToday,
        leaveToday,
        totalPayroll
      });
      
    } catch (err) {
       console.error("Failed to synchronize dashboard summary cards", err);
    } finally {
       setLoading(false);
    }
  };

  const data = [
    { label: "Total Employees", value: stats.totalEmployees, icon: "👥" },
    { label: "Present Today", value: stats.presentToday, icon: "✅" },
    { label: "On Leave", value: stats.leaveToday, icon: "🌴" },
    { 
      label: "Payroll This Month", 
      value: `₹${stats.totalPayroll.toLocaleString()}`, 
      icon: "💰" 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {data.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-xl shadow-xl text-white hover:bg-white/20 transition relative overflow-hidden group"
        >
          {/* subtle loading shimmer overlay */}
          {loading && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] pointer-events-none" />
          )}

          <div className="flex justify-between items-start">
             <p className="text-3xl filter drop-shadow-md">{item.icon}</p>
             {loading && <span className="flex w-2 h-2 bg-green-400/50 rounded-full animate-pulse blur-[1px]"></span>}
          </div>

          <p className="text-2xl font-bold mt-3 tracking-wide">
            {loading ? "..." : item.value}
          </p>

          <p className="text-sm text-gray-300 mt-1 font-medium">
            {item.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;