import { useState, useEffect } from "react";
import { Download, Clock, LogOut } from "lucide-react";
import { checkInAPI, checkOutAPI, getMyAttendanceAPI } from "../../api/attendanceApi";
import { getShiftTypeFromTime, getAttendanceStatus } from "../../utils/hrLogic";

const MyAttendance = () => {
  const todayString = new Date().toISOString().split("T")[0];

  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredData, setFilteredData] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [2024, 2025, 2026, 2027];

  const formatTime = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const detectShift = (record) => {
    if (record.shift) return record.shift;
    if (record.checkIn) return getShiftTypeFromTime(record.checkIn);
    return "Missing";
  };

  const detectStatus = (record) => {
    if (record.status) return record.status;
    return getAttendanceStatus(record.checkIn, record.checkOut);
  };

  const fetchAttendance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await getMyAttendanceAPI();
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceData(sorted);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to fetch attendance");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    const filtered = attendanceData.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    });
    setFilteredData(filtered);

    const today = attendanceData.find((r) => r.date === todayString);
    setTodayRecord(today || null);
  }, [attendanceData, selectedMonth, selectedYear, todayString]);

  const handleCheckIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await checkInAPI();
      await fetchAttendance();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Check-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await checkOutAPI();
      await fetchAttendance();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Check-out failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const data = filteredData;
    let csv = "Date,Check-In,Shift,Check-Out,Status,Hours Worked\n";
    data.forEach((record) => {
      const checkIn = record.checkIn ? formatTime(record.checkIn) : "-";
      const shift = record.checkIn ? detectShift(record) : "Missing";
      const checkOut = record.checkOut ? formatTime(record.checkOut) : "-";
      csv += `${record.date},${checkIn},${shift},${checkOut},${record.status || "Present"},${record.hoursWorked || "-"}\n`;
    });

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
    element.setAttribute("download", `attendance_${selectedMonth + 1}_${selectedYear}.csv`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const presentCount = filteredData.filter((r) => detectStatus(r).includes("Present")).length;
  const absentCount = filteredData.filter((r) => detectStatus(r).includes("Absent")).length;
  const lateCount = filteredData.filter((r) => detectStatus(r).includes("Late")).length;

  const isTodayCheckedIn = !!todayRecord?.checkIn;
  const isTodayCheckedOut = !!todayRecord?.checkOut;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-300/40 text-red-100 p-3 rounded-lg inline-block">
          {error}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl text-white">
        <h3 className="text-lg font-semibold mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Present</p>
            <p className="text-xl font-semibold text-teal-300 mt-1">{presentCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Absent</p>
            <p className="text-xl font-semibold text-red-400 mt-1">{absentCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Late</p>
            <p className="text-xl font-semibold text-yellow-400 mt-1">{lateCount}</p>
          </div>
        </div>
      </div>


      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Monthly Attendance Report</h3>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            <Download size={18} />
            Download CSV
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div>
            <label className="text-sm text-white/60 block mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white outline-none"
            >
              {months.map((month, idx) => (
                <option key={month} value={idx}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white/60">Date</th>
                <th className="text-left py-3 px-4 text-white/60">Check-In</th>
                <th className="text-left py-3 px-4 text-white/60">Shift</th>
                <th className="text-left py-3 px-4 text-white/60">Check-Out</th>
                <th className="text-left py-3 px-4 text-white/60">Status</th>
                <th className="text-left py-3 px-4 text-white/60">Hours</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-white/60">Loading data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-white/60">No records found</td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <tr key={record._id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="py-3 px-4">{record.date}</td>
                    <td className="py-3 px-4">{record.checkIn ? formatTime(record.checkIn) : "-"}</td>
                    <td className="py-3 px-4">{record.checkIn ? detectShift(record) : "Missing"}</td>
                    <td className="py-3 px-4">{record.checkOut ? formatTime(record.checkOut) : "-"}</td>
                    <td className="py-3 px-4">
                      {(() => {
                        const status = detectStatus(record);
                        const statusClass =
                          status === "Present"
                            ? "bg-teal-500/30 text-teal-300"
                            : status === "Late"
                              ? "bg-yellow-500/30 text-yellow-300"
                              : status === "Half Day" || status === "Partial"
                                ? "bg-orange-500/30 text-orange-300"
                                : "bg-red-500/30 text-red-300";

                        return (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                            {status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4">{record.hoursWorked ? record.hoursWorked.toFixed(2) : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;