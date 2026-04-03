import { useMemo } from "react";
import { attendanceLogs } from "../../data/attendanceLogs";

const PerformanceTracking = () => {

  /* ================= DATA ================= */

  const employees =
    JSON.parse(localStorage.getItem("team")) || [];

  const leaves =
    JSON.parse(localStorage.getItem("leaveRequests")) || [];

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  /* ================= CALCULATION ================= */

  const performanceData = useMemo(() => {

    return employees.map(emp => {

      // attendance in selected month
      const empLogs = attendanceLogs.filter(
        log =>
          log.empId === emp.empId &&
          log.date.startsWith(month)
      );

      // present = has checkin
      const presentDays = empLogs.filter(
        l => l.checkin
      ).length;

      // leave
      const leaveDays = leaves.filter(
        l =>
          l.empId === emp.empId &&
          l.status === "Approved" &&
          l.date.startsWith(month)
      ).length;

      const totalDays = 30; // simple assumption

      // 🔥 performance
      const performance =
        totalDays === 0
          ? 0
          : Math.round((presentDays / totalDays) * 100);

      return {
        name: emp.name,
        empId: emp.empId,
        performance
      };

    });

  }, [employees, leaves]);

  /* ================= UI ================= */

  return (
    <div className="
      bg-white/10 backdrop-blur-xl 
      border border-white/20 
      rounded-2xl p-6
    ">

      <h3 className="text-lg font-semibold text-white mb-4">
        Performance Tracking
      </h3>

      <div className="space-y-5">

        {performanceData.map((emp, index) => (

          <div key={index}>

            {/* HEADER */}
            <div className="flex justify-between text-sm mb-1">

              <span className="text-white/80">
                {emp.empId} - {emp.name}
              </span>

              <span className="text-white/60">
                {emp.performance}%
              </span>

            </div>

            {/* BAR */}
            <div className="
              w-full bg-white/10 border border-white/20 
              rounded-full h-3 overflow-hidden
            ">
              <div
                className="
                  h-3 rounded-full bg-white/40 
                  transition-all duration-500
                "
                style={{ width: `${emp.performance}%` }}
              ></div>
            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default PerformanceTracking;