import { useState, useEffect, useMemo } from "react";
import { getAllLeavesAPI, updateLeaveStatusAPI } from "../../api/leaveApi";
import { getEmployeesAPI } from "../../api/employeesApi";

const LeaveApprovals = () => {

  const [rawLeaves, setRawLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal State
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  // 🔥 Fetch Network Data Securely
  const fetchSecureData = async () => {
    try {
      setLoading(true);
      const [leavesRes, empRes] = await Promise.all([
        getAllLeavesAPI(),
        getEmployeesAPI()
      ]);
      setRawLeaves(leavesRes.data || []);
      setEmployees(empRes.data || []);
    } catch (err) {
      console.error("Context evaluation failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecureData();
  }, []);

  // 🔥 Compute Master Request Matrix
  const requests = useMemo(() => {
    if (!employees.length || !rawLeaves.length) return [];

    // Map allowed emp IDs for isolation barriers
    const validEmpIds = employees.map(e => e._id.toString());

    let formatted = [];
    rawLeaves.forEach(req => {
       const rawEmpId = req.employeeId?._id?.toString() || req.employeeId;
       
       // Hierarchical scoping check! Only load if employee exists in manager's assigned team registry.
       if (!validEmpIds.includes(rawEmpId)) return;

       // Duration mathematics
       let days = 0;
       if (req.fromDate && req.toDate) {
          const s = new Date(req.fromDate);
          const e = new Date(req.toDate);
          days = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
       }

       formatted.push({
          id: req._id,
          empDbId: rawEmpId,
          empId: req.employeeId?.empId || "EMP",
          name: req.employeeId?.name || "Unknown",
          type: req.reason || "General Leave",
          from: req.fromDate ? req.fromDate.substring(0,10) : "-",
          to: req.toDate ? req.toDate.substring(0,10) : "-",
          days: days > 0 ? days : 1, // Fallback safety
          status: req.status
       });
    });

    // Default newest first
    return formatted.sort((a,b) => new Date(b.from) - new Date(a.from));
  }, [rawLeaves, employees]);

  // 🔥 Apply Filters
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
       const mStatus = statusFilter === "All" || req.status === statusFilter;
       const s = search.toLowerCase();
       const mSearch = req.name.toLowerCase().includes(s) || req.empId.toLowerCase().includes(s);
       
       let mDate = true;
       if (startDate && req.from) {
          if (new Date(req.from) < new Date(startDate)) mDate = false;
       }
       if (endDate && req.to) {
          if (new Date(req.to) > new Date(endDate)) mDate = false;
       }

       return mStatus && mSearch && mDate;
    });
  }, [requests, statusFilter, search, startDate, endDate]);

  // 🔥 Top Widgets Calculation
  const counts = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0, totalDays = 0;
    
    // Total days strictly scales against the ACTIVE visual filter so they can slice dates contextually
    filteredRequests.forEach(req => {
      if (req.status === "Pending") pending++;
      else if (req.status === "Approved") approved++;
      else if (req.status === "Rejected") rejected++;

      if (req.status !== "Rejected") totalDays += req.days;
    });
    return { pending, approved, rejected, totalDays };
  }, [filteredRequests]);

  /* ================= UPDATE ENGINE ================= */
  const updateStatus = async (id, newStatus) => {
    try {
      await updateLeaveStatusAPI(id, newStatus);
      fetchSecureData(); 
    } catch (err) {
      console.error(err);
      alert("System failure synchronizing status!");
    }
  };

  /* ================= MODAL COMPUTATION ================= */
  // Extract all historical contexts specifically for the clicked profile
  const modalHistory = selectedEmpId ? requests.filter(r => r.empDbId === selectedEmpId) : [];
  const modalEmpName = modalHistory.length > 0 ? modalHistory[0].name : "Employee";
  const modalPendingReqs = modalHistory.filter(r => r.status === "Pending");

  if (loading) return <div className="text-white p-6 tracking-widest text-sm text-indigo-200">Evaluating Hierarchical Scope Constraints...</div>;

  return (
    <div className="mt-6 text-white space-y-6">
      <h2 className="text-2xl font-bold">Leave Control Dashboard</h2>

      {/* SUMMARY WIDGETS */}
      <div className="grid grid-cols-4 gap-6">
        <SummaryCard title="Pending Review" value={counts.pending} color="yellow" />
        <SummaryCard title="Approved Leaves" value={counts.approved} color="emerald" />
        <SummaryCard title="Rejected" value={counts.rejected} color="red" />
        <SummaryCard title="Impact Scope (Days)" value={counts.totalDays} color="indigo" />
      </div>

      {/* FILTER & METADATA BAR */}
      <div className="flex flex-wrap gap-4 p-4 bg-white/5 rounded-xl border border-white/10 items-center justify-between">
        <div className="flex gap-4">
            <input 
              placeholder="Search Employee..." 
              value={search} onChange={e=>setSearch(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
            />

            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="px-4 py-2 bg-slate-900 border border-white/20 rounded-lg font-semibold shadow-sm">
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Evaluation</option>
                <option value="Approved">Approved Contexts</option>
                <option value="Rejected">Rejected</option>
            </select>
        </div>

        <div className="flex gap-3 items-center bg-black/30 p-2 rounded-lg border border-white/5">
            <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-sm" title="Override Start Date" placeholder="Start"/>
            <span className="text-white/40 px-2">-</span>
            <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-sm" title="Override End Date" placeholder="End"/>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-sm relative">
              <thead className="border-b border-white/20 bg-slate-800 sticky top-0 z-10">
                <tr className="text-white/70">
                  <th className="p-4 w-28">Emp ID</th>
                  <th className="p-4">Employee Name</th>
                  <th className="p-4">From</th>
                  <th className="p-4">To</th>
                  <th className="p-4 font-mono text-indigo-300">Days</th>
                  <th className="p-4">Reason Context</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Action Interface</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredRequests.length === 0 ? (
                    <tr><td colSpan="8" className="p-8 text-center text-white/50 italic flex-1">Scope constraints resulted in 0 queries found.</td></tr>
                ) : filteredRequests.map(req => (
                  <tr key={req.id} className="border-b border-white/10 hover:bg-white/10 transition cursor-pointer group" onClick={() => setSelectedEmpId(req.empDbId)}>
                    <td className="p-4 font-mono text-indigo-300 text-xs">{req.empId}</td>
                    <td className="p-4 font-semibold group-hover:text-indigo-300 transition">{req.name}</td>
                    <td className="p-4 text-white/70">{req.from}</td>
                    <td className="p-4 text-white/70">{req.to}</td>
                    <td className="p-4 font-mono font-bold">{req.days} d</td>
                    <td className="p-4 text-white/60 truncate max-w-[200px]">{req.type}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs border bg-opacity-20 ${
                          req.status === "Approved" ? "bg-emerald-500 text-emerald-300 border-emerald-500" :
                          req.status === "Rejected" ? "bg-red-500 text-red-300 border-red-500" :
                          "bg-yellow-500 text-yellow-300 border-yellow-500"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {req.status === "Pending" ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => updateStatus(req.id, "Approved")} className="px-3 py-1.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 rounded-lg hover:bg-emerald-500 hover:text-white transition shadow-sm font-semibold text-xs">
                             Approve
                          </button>
                          <button onClick={() => updateStatus(req.id, "Rejected")} className="px-3 py-1.5 bg-red-600/30 text-red-300 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm font-semibold text-xs">
                             Reject
                          </button>
                        </div>
                      ) : (
                          <span className="text-xs text-white/40 italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* OVERLAY MODAL INTERFACE */}
      {selectedEmpId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
             <div className="bg-slate-900 border border-white/20 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                   <div>
                       <h3 className="text-xl font-bold text-white tracking-wide">{modalEmpName}</h3>
                       <p className="text-sm text-indigo-300 mt-1">Deep Context Isolation & Historical Review Profile</p>
                   </div>
                   <button onClick={() => setSelectedEmpId(null)} className="p-2 hover:bg-white/10 rounded-xl transition text-white/50 hover:text-white">
                      ✕
                   </button>
                </div>

                {/* Modal Layout */}
                <div className="p-6 overflow-y-auto space-y-6">
                    
                    {/* Active Pending Resolves Box */}
                    {modalPendingReqs.length > 0 && (
                        <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-5">
                            <h4 className="text-orange-300 font-semibold mb-4 text-sm tracking-wider uppercase">Active Evaluation Actions</h4>
                            <div className="space-y-3">
                                {modalPendingReqs.map(r => (
                                    <div key={r.id} className="bg-black/40 border border-white/10 rounded-lg p-4 flex justify-between items-center">
                                       <div>
                                           <p className="font-bold">{r.type}</p>
                                           <p className="text-xs text-white/60 mt-1">{r.from} &rarr; {r.to} <span className="font-mono text-orange-200 ml-2">({r.days} d)</span></p>
                                       </div>
                                       <div className="flex gap-2">
                                          <button onClick={() => updateStatus(r.id, "Approved")} className="px-4 py-2 bg-emerald-600/80 text-white border border-emerald-400 rounded-lg hover:bg-emerald-500 transition shadow-lg font-semibold text-sm">
                                             Approve Request
                                          </button>
                                          <button onClick={() => updateStatus(r.id, "Rejected")} className="px-4 py-2 bg-red-600/80 text-white border border-red-400 rounded-lg hover:bg-red-500 transition shadow-lg font-semibold text-sm">
                                             Reject Request
                                          </button>
                                       </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Full History Tree */}
                    <div>
                        <h4 className="text-indigo-300 font-semibold mb-4 text-sm tracking-wider uppercase">Complete Temporal Leaves Database</h4>
                        <table className="w-full text-left text-sm border-collapse">
                             <thead className="bg-white/5 text-white/50 border-y border-white/10">
                                <tr>
                                   <th className="p-3">From</th>
                                   <th className="p-3">To</th>
                                   <th className="p-3">Duration</th>
                                   <th className="p-3">Reason</th>
                                   <th className="p-3">Resolved Protocol</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                 {modalHistory.map(r => (
                                     <tr key={r.id} className="hover:bg-white/5 transition">
                                        <td className="p-3 text-white/80">{r.from}</td>
                                        <td className="p-3 text-white/80">{r.to}</td>
                                        <td className="p-3 font-mono font-bold">{r.days} Days</td>
                                        <td className="p-3 text-white/70 italic max-w-[200px] truncate">{r.type}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider border ${
                                                r.status === "Approved" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                                                r.status === "Rejected" ? "bg-red-500/20 text-red-300 border-red-500/30" :
                                                "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                            }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                     </tr>
                                 ))}
                             </tbody>
                        </table>
                    </div>

                </div>

             </div>
          </div>
      )}

    </div>
  );
};

/* THEMATIC SUMMARY CARDS */
const SummaryCard = ({ title, value, color }) => {
   const colorThemes = {
      yellow: "bg-yellow-900/30 border-yellow-500/30 text-yellow-300",
      emerald: "bg-emerald-900/30 border-emerald-500/30 text-emerald-300",
      red: "bg-red-900/30 border-red-500/30 text-red-300",
      indigo: "bg-indigo-900/30 border-indigo-500/30 text-indigo-300"
   };
   
   return (
      <div className={`border p-5 rounded-2xl flex flex-col justify-between ${colorThemes[color]}`}>
          <p className="opacity-80 text-sm font-medium tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-2 drop-shadow-md">{value}</p>
      </div>
   );
};

export default LeaveApprovals;