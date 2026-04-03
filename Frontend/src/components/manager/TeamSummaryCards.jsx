import { useState, useEffect, useMemo } from "react";
import { getEmployeesAPI } from "../../api/employeesApi";
import { getAllAttendanceAPI } from "../../api/attendanceApi";
import { getAllLeavesAPI } from "../../api/leaveApi";

const TeamSummaryCards = () => {

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrix = async () => {
       try {
          const [empRes, attRes, levRes] = await Promise.all([
             getEmployeesAPI(),
             getAllAttendanceAPI(),
             getAllLeavesAPI()
          ]);
          setEmployees(empRes.data || []);
          setAttendance(attRes.data || []);
          setLeaves(levRes.data || []);
       } catch(e) {}
       finally { setLoading(false); }
    };
    fetchMatrix();
  }, []);

  /* ================= TODAY ================= */
  const today = new Date().toISOString().split("T")[0];

  /* ================= CALCULATIONS ================= */

  const summary = useMemo(() => {

    const total = employees.length;

    // Isolate today's scoped check-ins mapped strictly to active team payload
    const activeEmpIds = employees.map(e => e._id.toString());

    const present = attendance.filter(log => 
       log.date === today && activeEmpIds.includes(log.employeeId?._id?.toString() || log.employeeId)
    ).length;

    const leaveStats = leaves.filter(l => {
       if (l.status !== "Approved") return false;
       const rawEmp = l.employeeId?._id ? l.employeeId._id.toString() : l.employeeId?.toString();
       if (!activeEmpIds.includes(rawEmp)) return false;

       // Date overlapping
       const startStr = l.fromDate ? l.fromDate.substring(0,10) : "";
       const endStr = l.toDate ? l.toDate.substring(0,10) : "";
       return (today >= startStr && today <= endStr);
    }).length;

    // 🔥 PERFORMANCE (simple logic)
    const performance =
      total === 0
        ? 0
        : Math.round((present / total) * 100);

    return { total, present, leave: leaveStats, performance };

  }, [employees, attendance, leaves]);

  /* ================= UI ================= */

  if (loading) return <div className="text-indigo-200/50 p-4 animate-pulse italic text-sm">Evaluating live database...</div>;

  return (
    <div className="grid grid-cols-4 gap-6">
      <Card title="Team Members" value={summary.total} />
      <Card title="Present Today" value={summary.present} />
      <Card title="On Approved Leave" value={summary.leave} />
      <Card title="Avg Performance" value={`${summary.performance}%`} />
    </div>
  );
};

/* ================= CARD ================= */

const Card = ({ title, value }) => {
  return (
    <div className="
      bg-white/10 backdrop-blur-xl 
      border border-white/20 
      rounded-2xl p-5 
      transition duration-300
      hover:bg-white/15
      hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]
    ">
      <h3 className="text-sm text-white/60 mb-2">
        {title}
      </h3>

      <p className="text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
};

export default TeamSummaryCards;