import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getEmployeesAPI } from "../../api/employeesApi";
import { getAllAttendanceAPI } from "../../api/attendanceApi";

const MyTeam = () => {
  const navigate = useNavigate();

  // Network State
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectionFilter, setSelectionFilter] = useState("All");

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Polling Server Matrix
  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, attRes] = await Promise.all([
        getEmployeesAPI(),
        getAllAttendanceAPI()
      ]);
      setEmployees(empRes.data || []);
      setAttendance(attRes.data || []);
    } catch (err) {
      console.error("Failed to map team roster dependencies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Cross-Referenced Matrix Mapping
  const todayIso = new Date().toISOString().split("T")[0];

  const processedData = employees.map(emp => {
    const todayDoc = attendance.find(a => a.employeeId?._id === emp._id && a.date === todayIso);
    return {
      ...emp,
      todayHours: todayDoc?.hoursWorked || "-",
      todayShift: todayDoc?.shift || "Standard",
      todayStatus: todayDoc ? todayDoc.status : (emp.isActive === false ? "Blocked" : "Absent"),
      isActive: emp.isActive !== false
    };
  });

  // Derived Metrics for Summary Widget Layer
  const totalMembers = processedData.length;
  const presentToday = processedData.filter(e => e.todayStatus.includes("Present")).length;
  const onLeave = processedData.filter(e => e.todayStatus.toLowerCase() === "leave").length;
  const absent = processedData.filter(e => e.todayStatus === "Absent").length;

  // Multi-Filter Compute Engine
  const filteredGrid = processedData.filter(e => {
    const s = search.toLowerCase();
    const matchSearch = (e.name?.toLowerCase().includes(s) || false) || (e.empId?.toLowerCase().includes(s) || false);
    const matchStatus = statusFilter === "All" || e.todayStatus?.includes(statusFilter);
    const matchSelection = selectionFilter === "All" || selectedIds.includes(e._id);
    return matchSearch && matchStatus && matchSelection;
  });

  /* ================= HANDLERS ================= */

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filteredGrid.map(f => f._id));
    else setSelectedIds([]);
  };

  const downloadCSV = () => {
    let csv = "ID,Name,Role,Status,Today Hours,Shift,IsActive\n";
    filteredGrid.forEach(e => {
      csv += `${e.empId},"${e.name}",${e.role},${e.todayStatus},${e.todayHours},${e.todayShift},${e.isActive}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Team_Report_${todayIso}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const extractUnique = (field) => ["All", ...new Set(processedData.map(d => d[field]))];

  if (loading) return <div className="text-white p-6">Authenticating Matrix Layout...</div>;

  /* ================= UI RENDER ================= */
  return (
    <div className="text-white space-y-6">

      <h2 className="text-2xl font-bold">My Team & Roster Tracker</h2>

      {/* SUMMARY WIDGET TILES */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-indigo-900/50 p-5 rounded-xl border border-indigo-500/30">
          <p className="text-white/60 text-sm">Total Team Members</p>
          <p className="text-3xl font-bold mt-2">{totalMembers}</p>
        </div>
        <div className="bg-green-900/40 p-5 rounded-xl border border-green-500/30">
          <p className="text-white/60 text-sm">Present Today</p>
          <p className="text-3xl font-bold mt-2 text-green-400">{presentToday}</p>
        </div>
        <div className="bg-blue-900/40 p-5 rounded-xl border border-blue-500/30">
          <p className="text-white/60 text-sm">On Leave</p>
          <p className="text-3xl font-bold mt-2 text-blue-400">{onLeave}</p>
        </div>
        <div className="bg-red-900/30 p-5 rounded-xl border border-red-500/30">
          <p className="text-white/60 text-sm">Absent</p>
          <p className="text-3xl font-bold mt-2 text-red-400">{absent}</p>
        </div>
      </div>

      {/* FILTER & METADATA BAR */}
      <div className="flex flex-wrap gap-3 bg-white/5 p-4 rounded-xl border border-white/10 items-center">
        <input 
          placeholder="Search by Name/ID..." 
          value={search} onChange={e=>setSearch(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-white/20 rounded focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
        />

        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-900 rounded">
          <option value="All">Status: All</option>
          <option value="Present">Status: Present</option>
          <option value="On Leave">Status: On Leave</option>
          <option value="Absent">Status: Absent</option>
        </select>

        <select value={selectionFilter} onChange={e=>setSelectionFilter(e.target.value)} className="px-3 py-2 bg-slate-900 rounded text-indigo-300">
          <option value="All">View All Scope</option>
          <option value="Selected">View Selected ({selectedIds.length})</option>
        </select>
      </div>

      {/* ACTION TOOLBAR */}
      <div className="flex gap-3 justify-end items-center">
        <button onClick={downloadCSV} className="bg-slate-700 px-5 py-2 rounded-lg border border-white/20 hover:bg-slate-600">📥 Download Report</button>
      </div>

      {/* DYNAMIC DATA GRID */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-gray-300 border-b border-white/20">
            <tr>
              <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredGrid.length && filteredGrid.length > 0} className="w-4 h-4 rounded appearance-none checked:bg-indigo-500 border border-white/30 cursor-pointer"/></th>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Today Hours</th>
              <th className="p-4">Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredGrid.length === 0 ? (
               <tr><td colSpan="7" className="p-8 text-center text-white/50 italic">No mapped connections.</td></tr>
            ) : filteredGrid.map((emp) => (
              <tr key={emp._id} className={`hover:bg-white/5 transition ${!emp.isActive ? 'opacity-40' : ''}`}>
                <td className="p-4">
                  <input type="checkbox" checked={selectedIds.includes(emp._id)} onChange={() => handleSelect(emp._id)} className="w-4 h-4 rounded appearance-none checked:bg-indigo-500 border border-white/30 cursor-pointer"/>
                </td>
                <td className="p-4">
                  <p className="font-semibold">{emp.name}</p>
                  <p className="text-xs text-indigo-300">{emp.empId}</p>
                </td>
                <td className="p-4">{emp.role}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${emp.todayStatus.includes("Present") ? "bg-green-500/20 text-green-300" : (emp.todayStatus === "Absent" ? "bg-red-500/20 text-red-300" : "bg-orange-500/20 text-orange-300")}`}>{emp.todayStatus}</span>
                </td>
                <td className="p-4 text-gray-300">{emp.todayHours} hrs</td>
                <td className="p-4">
                  <span className="bg-white/10 px-2 py-1 rounded text-xs text-white/80 border border-white/10">{emp.todayShift}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
export default MyTeam;