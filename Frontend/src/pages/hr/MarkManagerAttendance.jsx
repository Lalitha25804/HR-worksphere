import { useState, useEffect } from "react";
import { Clock, LogOut, Briefcase } from "lucide-react";
import { getEmployeesAPI } from "../../api/employeesApi";
import { checkInAPI, checkOutAPI, getMyAttendanceAPI } from "../../api/attendanceApi";

const MarkManagerAttendance = () => {
  const todayString = new Date().toISOString().split("T")[0];

  const [managers, setManagers] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all employees and filter managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const { data } = await getEmployeesAPI();
        // Filter out only those with role === "Manager"
        const managerList = data.filter(emp => emp.role === "Manager");
        setManagers(managerList);
      } catch (err) {
        setError("Failed to load managers");
      }
    };
    fetchManagers();
  }, []);

  // Fetch specific manager's attendance when selected
  const fetchAttendance = async (targetId) => {
    if (!targetId) {
      setAttendanceData([]);
      setTodayRecord(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await getMyAttendanceAPI({ targetEmployeeId: targetId });
      setAttendanceData(data);
      
      const today = data.find((r) => r.date === todayString);
      setTodayRecord(today || null);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to fetch member attendance");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedEmpId);
  }, [selectedEmpId, todayString]);

  const handleCheckIn = async () => {
    if (!selectedEmpId) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await checkInAPI({ targetEmployeeId: selectedEmpId });
      setSuccess("Check-in successful");
      await fetchAttendance(selectedEmpId);
    } catch (err) {
      setError(err.response?.data?.error || "Check-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedEmpId) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await checkOutAPI({ targetEmployeeId: selectedEmpId });
      setSuccess("Check-out successful");
      await fetchAttendance(selectedEmpId);
    } catch (err) {
      setError(err.response?.data?.error || "Check-out failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const isTodayCheckedIn = !!todayRecord?.checkIn;
  const isTodayCheckedOut = !!todayRecord?.checkOut;

  return (
    <div className="space-y-6">
      
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl text-white">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Briefcase size={24} /> Mark Manager Attendance
        </h2>
        <p className="text-white/60 text-sm mb-4">
          Select a Manager to view or override their attendance for today.
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-300/40 text-red-100 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-teal-500/20 border border-teal-300/40 text-teal-100 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="max-w-md">
          <label className="text-sm text-white/60 block mb-2">Select Manager</label>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="" className="text-black">-- Choose a Manager --</option>
            {managers.map(emp => (
              <option key={emp._id} value={emp._id} className="text-black">
                {emp.name} ({emp.empId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedEmpId && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl text-white">
          <h3 className="text-lg font-semibold mb-4">Today's Check-In / Check-Out</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-2">Check-In</p>
              <p className="text-lg font-semibold text-teal-300 mb-3">
                {todayRecord?.checkIn ? formatTime(todayRecord.checkIn) : "Not checked in"}
              </p>
              <button
                onClick={handleCheckIn}
                disabled={isTodayCheckedIn || isLoading}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  isTodayCheckedIn || isLoading
                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                    : "bg-teal-500 hover:bg-teal-600 text-white"
                }`}
              >
                <Clock size={18} />
                Check In
              </button>
            </div>

            <div>
              <p className="text-sm text-white/60 mb-2">Check-Out</p>
              <p className="text-lg font-semibold text-red-300 mb-3">
                {todayRecord?.checkOut ? formatTime(todayRecord.checkOut) : "Not checked out"}
              </p>
              <button
                onClick={handleCheckOut}
                disabled={!isTodayCheckedIn || isTodayCheckedOut || isLoading}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  !isTodayCheckedIn || isTodayCheckedOut || isLoading
                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                <LogOut size={18} />
                Check Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MarkManagerAttendance;
