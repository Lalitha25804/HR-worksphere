import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useState, useEffect } from "react";
import { getEmployeesAPI } from "../../api/employeesApi";
import { getAllAttendanceAPI } from "../../api/attendanceApi";

const AttendanceChart = () => {

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Database Contexts
  useEffect(() => {
    const fetchMatrix = async () => {
       try {
           const [emp, att] = await Promise.all([
              getEmployeesAPI(),
              getAllAttendanceAPI()
           ]);
           setEmployees(emp.data || []);
           setAttendance(att.data || []);
       } catch(e) {} finally { setLoading(false); }
    };
    fetchMatrix();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  /* ================= CALCULATION ================= */

  const chartData = useMemo(() => {
    if (!employees.length) return [];

    const activeEmpIds = employees.map(e => e._id.toString());

    // Filter strictly to today's active team shifts
    const todayLogs = attendance.filter(log => {
        const id = log.employeeId?._id?.toString() || log.employeeId;
        return log.date === today && activeEmpIds.includes(id);
    });

    let morning = 0;
    let evening = 0;
    let night = 0;

    todayLogs.forEach(log => {
      // Evaluate explicit shift configuration directly from the database or default fallback
      const shiftType = log.shift || "Morning"; 
      
      if (shiftType.includes("Morning") || shiftType === "Standard") morning++;
      else if (shiftType.includes("Evening")) evening++;
      else if (shiftType.includes("Night")) night++;
      else morning++; // Fallback explicit classification
    });

    // Extract Absent counts securely directly against isolated bounds
    const presentCount = todayLogs.length;
    const absentCount = Math.max(0, employees.length - presentCount);

    return [
      { name: "Morning", value: morning },
      { name: "Evening", value: evening },
      { name: "Night", value: night },
      { name: "Absent", value: absentCount }
    ];

  }, [employees, attendance]);

  /* ================= UI ================= */

  return (
    <div className="
      bg-white/10 backdrop-blur-xl 
      border border-white/20 
      p-6 rounded-xl relative
    ">

      <h3 className="text-lg font-semibold mb-4 text-gray-200">
         Active Shift Distributions
      </h3>

      {loading && (
        <div className="absolute inset-0 bg-[#0f172a]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
           <span className="text-indigo-200/50 italic animate-pulse text-sm">Synchronizing parameters...</span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={250}>

        <BarChart data={chartData}>

          <XAxis
            dataKey="name"
            stroke="#cbd5f5"
          />

          <YAxis stroke="#cbd5f5" />

          <Tooltip
            contentStyle={{
              backgroundColor:"rgba(15,23,42,0.9)",
              border:"1px solid rgba(255,255,255,0.2)",
              borderRadius:"8px",
              color:"#fff"
            }}
          />

          <Bar
            dataKey="value"
            fill="#6366f1"
            radius={[6,6,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
};

export default AttendanceChart;