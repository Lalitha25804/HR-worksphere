import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { attendanceLogs } from "../../data/attendanceLogs";
import { getShiftTypeFromTime, getAttendanceStatus, getWorkHours, getOvertimeHours, getShiftAllowance } from "../../utils/hrLogic";

const EmployeeDetail = () => {

  const { id } = useParams(); // empId

  const [month,setMonth] = useState("2026-03");

  /* 🔥 EMPLOYEE (TEMP — BACKEND LATER) */
  const employee = {
    empId: id,
    name: "Rahul Sharma",
    department: "Engineering",
    role: "Frontend Developer",
    basic: 40000
  };

  /* FILTER LOGS */
  const logs = useMemo(() => {

    return attendanceLogs.filter(log =>
      log.empId === id && log.date.startsWith(month)
    );

  },[id,month]);

  /* SHIFT TYPE */
  const getShiftType = (time) => {
    return getShiftTypeFromTime(time);
  };

  /* CALCULATE */
  const calculate = () => {

    let present = 0;
    let leave = 0;
    let ot = 0;
    let allowance = 0;

    logs.forEach(log => {

      const status = getAttendanceStatus(log.checkin, log.checkout);
      if (status === "Absent" || status === "Partial") {
        leave++;
        return;
      }

      present++;

      const hours = getWorkHours(log.checkin, log.checkout);
      ot += getOvertimeHours(log.checkin, log.checkout);

      const shift = getShiftType(log.checkin);
      allowance += getShiftAllowance(shift, hours);

    });

    const payroll =
      employee.basic +
      allowance +
      (ot * 200);

    return {
      present,
      leave,
      ot: Math.round(ot),
      allowance: Math.round(allowance),
      payroll
    };

  };

  const summary = calculate();

  return (

    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <p className="text-white/60 text-sm">
            {employee.empId} • {employee.role}
          </p>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e)=>setMonth(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded"
        />

      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-5 gap-4">

        <Card title="Present" value={summary.present}/>
        <Card title="Leave" value={summary.leave}/>
        <Card title="OT Hours" value={summary.ot}/>
        <Card title="Allowance" value={`₹${summary.allowance}`}/>
        <Card title="Payroll" value={`₹${summary.payroll}`}/>

      </div>

      {/* TABLE */}
      <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden">

        <div className="max-h-[400px] overflow-y-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-900 text-white/70 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Shift</th>
                <th className="px-4 py-3 text-left">Check In</th>
                <th className="px-4 py-3 text-left">Check Out</th>
                <th className="px-4 py-3 text-center">OT</th>
                <th className="px-4 py-3 text-center">Allowance</th>
              </tr>
            </thead>

            <tbody>

              {logs.map((log,i)=>{

                const shift = getShiftType(log.checkin);

                return(
                  <tr key={i} className="border-b border-white/10">

                    <td className="px-4 py-3">{log.date}</td>

                    <td className="px-4 py-3">
                      {shift}
                    </td>

                    <td className="px-4 py-3">
                      {log.checkin || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {log.checkout || "-"}
                    </td>

                    <td className="text-center">
                      {log.checkin ? "✔" : 0}
                    </td>

                    <td className="text-center text-blue-400">
                      {log.checkin
                        ? `₹${getShiftAllowance(shift, getWorkHours(log.checkin, log.checkout)).toFixed(0)}`
                        : "₹0"}
                    </td>

                  </tr>
                )

              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

const Card = ({title,value}) => (
  <div className="bg-white/10 p-4 rounded-xl text-center">
    <p className="text-sm text-white/60">{title}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

export default EmployeeDetail;