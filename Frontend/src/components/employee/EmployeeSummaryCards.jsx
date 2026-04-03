import { useState, useEffect } from "react";
import { getMyAttendanceAPI } from "../../api/attendanceApi";
import { getMyLeavesAPI } from "../../api/leaveApi";
import { getPayrollAPI } from "../../api/payrollApi";

const EmployeeSummaryCards = () => {
  const [payroll, setPayroll] = useState("--");
  const [presentDays, setPresentDays] = useState("--");
  const [leavesTaken, setLeavesTaken] = useState("--");

  const profile = JSON.parse(localStorage.getItem("user")) || {};
  const employeeId = profile.id;

  useEffect(() => {
    if (!employeeId) return;

    const fetchSummary = async () => {
      try {
        const today = new Date();
        const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0");
        const currentYear = today.getFullYear().toString();
        const currentMonthStr = today.toISOString().substring(0, 7);

        const [attRes, leaveRes, payRes] = await Promise.all([
           getMyAttendanceAPI(),
           getMyLeavesAPI(),
           getPayrollAPI(employeeId, currentMonth, currentYear).catch(() => ({ data: { salary: 0 } }))
        ]);

        const logs = attRes.data || [];
        setPresentDays(logs.filter(l => l.date && l.date.startsWith(currentMonthStr) && l.checkIn).length.toString());

        const leaves = leaveRes.data || [];
        setLeavesTaken(leaves.filter(l => l.status === "Approved").length.toString());

        // Format Payroll
        const salary = payRes?.data?.salary || 0;
        setPayroll(`₹${salary.toLocaleString()}`);

      } catch (err) {
        console.error("Dashboard Summary Fetch Error", err);
      }
    };
    fetchSummary();
  }, [employeeId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* CARD 1 (Payroll Transformed) */}
      <div className="
        bg-white/10 backdrop-blur-xl border border-white/20
        p-5 rounded-2xl transition
        hover:bg-white/15 hover:shadow-[0_0_20px_rgba(0,255,200,0.1)]
      ">
        <h3 className="text-sm text-white/60">
          Payroll
        </h3>
        <p className="text-2xl font-semibold text-white mt-1">
          {payroll}
        </p>
      </div>

      {/* CARD 2 */}
      <div className="
        bg-white/10 backdrop-blur-xl border border-white/20
        p-5 rounded-2xl transition
        hover:bg-white/15 hover:shadow-[0_0_20px_rgba(0,255,200,0.1)]
      ">
        <h3 className="text-sm text-white/60">
          Present Days
        </h3>
        <p className="text-2xl font-semibold text-teal-300 mt-1">
          {presentDays}
        </p>
      </div>

      {/* CARD 3 */}
      <div className="
        bg-white/10 backdrop-blur-xl border border-white/20
        p-5 rounded-2xl transition
        hover:bg-white/15 hover:shadow-[0_0_20px_rgba(0,255,200,0.1)]
      ">
        <h3 className="text-sm text-white/60">
          Leaves Taken
        </h3>
        <p className="text-2xl font-semibold text-teal-400 mt-1">
          {leavesTaken}
        </p>
      </div>

    </div>
  );
};

export default EmployeeSummaryCards;