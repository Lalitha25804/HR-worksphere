import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { getAllAttendanceAPI } from "../../api/attendanceApi";
import { getEmployeesAPI } from "../../api/employeesApi";

const AttendanceOverview = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
     present: 0,
     absent: 0,
     total: 0,
     percent: 0,
     breakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 1-minute auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [attRes, empRes] = await Promise.all([
        getAllAttendanceAPI(),
        getEmployeesAPI()
      ]);

      const allLogs = attRes.data || [];
      const employees = empRes.data || [];
      
      const todayDate = new Date().toISOString().split("T")[0];

      // 1. Filter logs mathematically for today only
      const todayLogs = allLogs.filter(log => log.date === todayDate);

      // 2. Count distinct employees present today
      const presentUniqueIds = new Set(todayLogs.map(l => l.employeeId?._id || l.employeeId));
      const presentCount = presentUniqueIds.size;
      const totalEmployees = employees.length;
      const absentCount = Math.max(0, totalEmployees - presentCount);

      // 3. Dynamically group strictly by Shifts handled
      const shiftCounts = {};
      todayLogs.forEach(log => {
         let shiftName = log.shift || "Standard";
         shiftCounts[shiftName] = (shiftCounts[shiftName] || 0) + 1;
      });

      // 4. Map to Recharts array struct
      const chartData = Object.keys(shiftCounts).map(shiftName => ({
         name: shiftName,
         employees: shiftCounts[shiftName]
      }));
      // Append Absentees
      chartData.push({ name: "Absent", employees: absentCount });

      setData(chartData);

      // 5. Build localized Summary stats
      const percent = totalEmployees === 0 ? 0 : Math.round((presentCount / totalEmployees) * 100);
      const breakdown = Object.keys(shiftCounts).map(s => `✔️ ${s} Shift: ${shiftCounts[s]}`);
      breakdown.push(`❌ Absent: ${absentCount}`);

      setStats({
         present: presentCount,
         absent: absentCount,
         total: totalEmployees,
         percent,
         breakdown
      });

    } catch (err) {
      console.error("Failed to fetch live attendance overview", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-xl shadow-xl text-white"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
           Attendance Overview
           <span className="flex w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        </h3>
      </div>

      {loading && stats.total === 0 ? (
         <div className="text-sm text-white/50 py-10 text-center animate-pulse">Aggregating live biometrics...</div>
      ) : (
         <>
          <p className="text-sm mb-4 text-gray-300">
            Today's Attendance: <b className="text-teal-400 text-lg">{stats.percent}%</b>
          </p>

          <ul className="text-sm space-y-2 mb-6 text-gray-300">
            {stats.breakdown.map((str, i) => (
               <li key={i}>{str}</li>
            ))}
          </ul>

          <div className="h-44 bg-slate-900/50 border border-white/10 rounded-lg p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis
                  dataKey="name"
                  stroke="#cbd5f5"
                  tick={{ fill: "#cbd5f5", fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5f5', opacity: 0.2 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#cbd5f5"
                  tick={{ fill: "#cbd5f5", fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5f5', opacity: 0.2 }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "white"
                  }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar
                  dataKey="employees"
                  fill="#6366f1"
                  radius={[6,6,0,0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
         </>
      )}

    </motion.div>
  );
};

export default AttendanceOverview;