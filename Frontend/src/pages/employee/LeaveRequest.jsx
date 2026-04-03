import { useState, useEffect } from "react";
import { applyLeaveAPI, getMyLeavesAPI } from "../../api/leaveApi";

const LeaveRequest = () => {
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "Casual Leave"
  });
  
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const res = await getMyLeavesAPI();
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg("");

    try {
      await applyLeaveAPI(formData);
      setSuccessMsg("Leave request submitted successfully.");
      setFormData({ fromDate: "", toDate: "", reason: "Casual Leave" });
      fetchMyLeaves(); // refresh table
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  // Filter leaves based on selected range
  const filteredLeaves = leaves.filter(l => {
    const matchesDate =
      (!startDate || new Date(l.fromDate) >= new Date(startDate)) &&
      (!endDate || new Date(l.toDate) <= new Date(endDate));
    return matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl text-white">
        <h3 className="text-lg font-semibold mb-4">Request Leave</h3>
        
        {error && <div className="mb-4 text-red-300 text-sm bg-red-500/20 p-2 rounded">{error}</div>}
        {successMsg && <div className="mb-4 text-green-300 text-sm bg-green-500/20 p-2 rounded">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
             <div className="w-1/2">
                <label className="text-sm text-white/60 mb-1 block">From Date</label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                />
             </div>
             <div className="w-1/2">
                <label className="text-sm text-white/60 mb-1 block">To Date</label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                />
             </div>
          </div>

          <div>
             <label className="text-sm text-white/60 mb-1 block">Leave Type</label>
             <select
               name="reason"
               value={formData.reason}
               onChange={handleChange}
               className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/40"
             >
               <option className="text-black">Casual Leave</option>
               <option className="text-black">Sick Leave</option>
               <option className="text-black">Emergency Leave</option>
             </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 rounded-xl border border-white/20 transition ${loading ? 'bg-teal-500/20 opacity-50' : 'bg-white/10 hover:bg-teal-500/30'}`}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl text-white">
        <h3 className="text-lg font-semibold mb-4">My Leave History</h3>
        
        <div className="flex gap-4 mb-4">
            <div>
               <label className="text-xs text-white/60 block mb-1">Start Range</label>
               <input 
                 type="date" 
                 value={startDate} 
                 onChange={(e) => setStartDate(e.target.value)} 
                 className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none"
               />
            </div>
            <div>
               <label className="text-xs text-white/60 block mb-1">End Range</label>
               <input 
                 type="date" 
                 value={endDate} 
                 onChange={(e) => setEndDate(e.target.value)} 
                 className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none"
               />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10 text-white/70">
              <tr>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                   <td colSpan="4" className="text-center py-6 text-white/50">No leave requests found in range.</td>
                </tr>
              ) : (
                filteredLeaves.map(l => (
                  <tr key={l._id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="px-4 py-3">{l.fromDate}</td>
                    <td className="px-4 py-3">{l.toDate}</td>
                    <td className="px-4 py-3 text-white/80">{l.reason}</td>
                    <td className="px-4 py-3">
                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${l.status === 'Approved' ? 'bg-green-500/20 text-green-300' : l.status === 'Rejected' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                         {l.status}
                       </span>
                    </td>
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

export default LeaveRequest;