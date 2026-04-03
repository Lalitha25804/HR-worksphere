import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getAllAttendanceAPI
} from "../../api/attendanceApi";

const Attendance = () => {

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatTime = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return 0;
    const inDate = new Date(inTime);
    const outDate = new Date(outTime);
    let diff = (outDate - inDate) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    return Number(diff.toFixed(2));
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAllAttendanceAPI();
      const formatted = res.data.map((a) => {
        const employee = a.employeeId || {};
        const inTime = formatTime(a.checkIn);
        const outTime = formatTime(a.checkOut);
        const hours = a.hoursWorked ?? calculateHours(a.checkIn, a.checkOut);

        return {
          id: a._id,
          empId: employee.empId || "EMP",
          name: employee.name || "Unknown",
          dept: employee.dept || "N/A",
          date: a.date || "-",
          checkIn: inTime || "-",
          checkOut: outTime || "-",
          hoursWorked: Number(hours.toFixed ? hours.toFixed(2) : hours),
          status: a.status || "Present"
        };
      });

      setAttendanceData(formatted);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to fetch attendance");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filtered = attendanceData.filter((emp) => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      emp.name.toLowerCase().includes(term) ||
      emp.empId.toLowerCase().includes(term) ||
      emp.dept.toLowerCase().includes(term);

    const matchesMonth = !month || emp.date.startsWith(month);

    const matchesRange =
      (!startDate || new Date(emp.date) >= new Date(startDate)) &&
      (!endDate || new Date(emp.date) <= new Date(endDate));

    return matchesSearch && matchesMonth && matchesRange;
  });

  const total = filtered.length;
  const present = filtered.filter((e) => e.status === "Present").length;
  const absent = filtered.filter((e) => e.status !== "Present").length;

  const exportCSV = () => {
    let csv = "EmpID,Name,Department,Date,Check In,Check Out,Hours,Status\n";
    filtered.forEach((row) => {
      csv += `${row.empId},${row.name},${row.dept},${row.date},${row.checkIn},${row.checkOut},${row.hoursWorked},${row.status}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 text-white">

      <div className="flex flex-wrap justify-between gap-3 items-start">
        <h2 className="text-2xl font-bold">Attendance Dashboard</h2>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/10 border border-white/20 rounded-xl">
          <div className="text-sm text-gray-300">Total Records</div>
          <div className="text-3xl font-bold">{total}</div>
        </div>
        <div className="p-4 bg-white/10 border border-white/20 rounded-xl">
          <div className="text-sm text-gray-300">Present</div>
          <div className="text-3xl font-bold">{present}</div>
        </div>
        <div className="p-4 bg-white/10 border border-white/20 rounded-xl">
          <div className="text-sm text-gray-300">Absent</div>
          <div className="text-3xl font-bold">{absent}</div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          placeholder="Search by name/ID/department"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded"
        />
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-300/40 text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-white/60">Loading attendance...</div>
      ) : (
        <div className="bg-white/10 border border-white/20 rounded-2xl overflow-auto max-h-[500px]">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-slate-900 sticky top-0 text-white/70">
              <tr>
                <th className="px-4 py-3 text-left">EmpID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Dept</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Check In</th>
                <th className="px-4 py-3 text-left">Check Out</th>
                <th className="px-4 py-3 text-center">Hours</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-white/50">
                    No attendance records found for the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <motion.tr key={emp.id} className="border-t border-white/10">
                    <td className="px-4 py-2">{emp.empId}</td>
                    <td className="px-4 py-2">{emp.name}</td>
                    <td className="px-4 py-2">{emp.dept}</td>
                    <td className="px-4 py-2">{emp.date}</td>
                    <td className="px-4 py-2">{emp.checkIn}</td>
                    <td className="px-4 py-2">{emp.checkOut}</td>
                    <td className="px-4 py-2 text-center">{emp.hoursWorked}</td>
                    <td className="px-4 py-2 text-center">{emp.status}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default Attendance;
