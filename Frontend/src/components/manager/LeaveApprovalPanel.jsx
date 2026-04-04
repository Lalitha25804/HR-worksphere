import { useState, useEffect } from "react";
import { applyLeaveAPI, getMyLeavesAPI } from "../../api/leaveApi";

const LeaveApprovalPanel = () => {

  const [formData, setFormData] = useState({
     fromDate: "",
     toDate: "",
     reason: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [myLeaves, setMyLeaves] = useState([]);

  useEffect(() => {
     fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
     try {
        const res = await getMyLeavesAPI();
        setMyLeaves(res.data || []);
     } catch (err) {
        console.error("Failed to sync personal leaves");
     }
  };

  const handleChange = (e) => {
     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
     setLoading(true);
     setSuccessMsg("");
     setErrorMsg("");

     try {
         await applyLeaveAPI(formData);
         window.alert("You requested leave successfully!");
         setFormData({ fromDate: "", toDate: "", reason: "" });
         fetchLeaves(); // Sync newest log instantly
     } catch (err) {
         setErrorMsg("Application dispatch failed. Verify parameters.");
         console.error(err);
     } finally {
         setLoading(false);
     }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl flex flex-col h-full relative overflow-y-auto custom-scrollbar">
      <h3 className="text-lg font-bold mb-5 text-indigo-300 tracking-wide">
        Personal Manager Leave Request
      </h3>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
         
         <div className="flex gap-4">
             <div className="flex-1">
                 <label className="block text-xs text-white/60 mb-1 uppercase font-bold tracking-wider">From:</label>
                 <input 
                    type="date"
                    name="fromDate"
                    required
                    value={formData.fromDate}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition"
                 />
             </div>
             <div className="flex-1">
                 <label className="block text-xs text-white/60 mb-1 uppercase font-bold tracking-wider">To:</label>
                 <input 
                    type="date"
                    name="toDate"
                    required
                    value={formData.toDate}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition"
                 />
             </div>
         </div>

         <div className="flex-1 flex flex-col pt-1">
             <label className="block text-xs text-white/60 mb-1 uppercase font-bold tracking-wider">Reason:</label>
             <textarea 
                name="reason"
                required
                value={formData.reason}
                onChange={handleChange}
                placeholder="Explicit context mapping..."
                className="w-full flex-1 min-h-[80px] bg-slate-900/50 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition resize-none"
             ></textarea>
         </div>

         {/* ALERTS */}
         {errorMsg && <div className="bg-red-500/20 text-red-300 border border-red-500/30 p-2 rounded-lg text-xs mt-2 text-center font-bold">{errorMsg}</div>}

         <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg tracking-widest uppercase text-xs border border-indigo-400 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
         >
            {loading ? "Generating Payload..." : "Request"}
         </button>

      </form>

      {/* RECENT LEAVE STATUS TRACKER */}
      <div className="mt-8 border-t border-white/10 pt-4">
         <h4 className="text-xs tracking-widest uppercase font-bold text-white/50 mb-4">My Request Status</h4>
         <div className="space-y-3">
             {myLeaves.length === 0 ? (
                 <p className="text-xs text-white/30 italic">No historical leave logs tracked.</p>
             ) : (
                 myLeaves.slice(0, 3).map(lv => (
                     <div key={lv._id} className="bg-slate-900/50 border border-white/5 p-3 rounded-xl flex justify-between items-center group hover:border-white/20 transition">
                         <div>
                            <p className="text-xs font-bold text-white tracking-wide">{lv.fromDate} <span className="opacity-50 mx-1">-</span> {lv.toDate}</p>
                            <p className="text-[10px] text-white/40 mt-1 truncate max-w-[150px]">{lv.reason}</p>
                         </div>
                         <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shrink-0 ${
                             lv.status === "Approved" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                             lv.status === "Rejected" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                             "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                         }`}>
                             {lv.status}
                         </span>
                     </div>
                 ))
             )}
         </div>
      </div>
    </div>
  );
};

export default LeaveApprovalPanel;