import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllLeavesAPI, updateLeaveStatusAPI } from "../../api/leaveApi";

const PendingApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const res = await getAllLeavesAPI();
      // Only keep actual Pending requests for the actionable queue
      const pendingLeaves = res.data.filter(leave => leave.status === "Pending");
      setRequests(pendingLeaves);
    } catch (err) {
      console.error("Failed to load global pending approvals", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ACTIONS
  ========================= */

  const updateStatus = async (id, status) => {
    try {
      // 1. Mutate Database State
      await updateLeaveStatusAPI(id, status);
      
      // 2. Visually remove the approved/rejected card from the actionable queue
      setRequests(prev => prev.filter(r => r._id !== id));
      
    } catch (err) {
      console.error(`Failed to execute ${status} action`, err);
      alert("Error: Could not process request action");
    }
  };

  /* =========================
     DATE FORMATTER
  ========================= */

  const formatDates = (start, end) => {
     if (!start) return "--";
     if (start === end) return new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric' });
     return `${new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${new Date(end).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-xl shadow-xl text-white">

      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
        Pending Approvals
        {requests.length > 0 && (
           <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full border border-orange-500/40">
             {requests.length} Remaining
           </span>
        )}
      </h3>

      <div className="overflow-x-auto min-h-[160px]">
        {loading ? (
             <div className="text-sm text-white/50 text-center py-8 animate-pulse">Syncing Approval Queue...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-300 border-b border-white/20">
                <th className="pb-3 px-2">Employee</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Dates</th>
                <th className="pb-3 text-right px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2 opacity-50">👍</div>
                    <div className="font-semibold text-white/70">All caught up!</div>
                    <div className="text-xs">No pending requests found in the database.</div>
                  </td>
                </tr>
              )}

              {requests.map((r, i) => (
                <motion.tr
                  key={r._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  <td className="py-3 px-2 font-medium">
                     {r.employeeId?.name || "Unknown"}
                     <span className="block text-[10px] text-white/40">{r.employeeId?.empId}</span>
                  </td>
                  
                  <td className="text-white/80">
                      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-xs">
                         {r.leaveType || "Leave"}
                      </span>
                  </td>

                  <td className="text-gray-300 text-xs">
                     {formatDates(r.fromDate, r.toDate)}
                  </td>

                  <td className="text-right px-2 whitespace-nowrap">
                    <button
                      onClick={() => updateStatus(r._id, "Approved")}
                      className="text-green-400 mr-4 font-semibold hover:text-green-300 hover:scale-105 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(r._id, "Rejected")}
                      className="text-red-400 font-semibold hover:text-red-300 hover:scale-105 transition"
                    >
                      Reject
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default PendingApprovals;