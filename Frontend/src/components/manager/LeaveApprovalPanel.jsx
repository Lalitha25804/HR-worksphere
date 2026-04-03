import { useState } from "react";
import { applyLeaveAPI } from "../../api/leaveApi";

const LeaveApprovalPanel = () => {

  const [formData, setFormData] = useState({
     fromDate: "",
     toDate: "",
     reason: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
         setSuccessMsg("System successfully executed dispatch to HR database!");
         setFormData({ fromDate: "", toDate: "", reason: "" });
     } catch (err) {
         setErrorMsg("Application dispatch failed. Verify parameters.");
         console.error(err);
     } finally {
         setLoading(false);
     }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl flex flex-col h-full relative overflow-hidden">
      <h3 className="text-lg font-bold mb-5 text-indigo-300">
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
         {successMsg && <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 p-2 rounded-lg text-xs mt-2 text-center font-bold tracking-wide animate-pulse">{successMsg}</div>}
         {errorMsg && <div className="bg-red-500/20 text-red-300 border border-red-500/30 p-2 rounded-lg text-xs mt-2 text-center font-bold">{errorMsg}</div>}

         <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg tracking-widest uppercase text-xs border border-indigo-400 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
         >
            {loading ? "Generating Payload..." : "Request"}
         </button>

      </form>
    </div>
  );
};

export default LeaveApprovalPanel;