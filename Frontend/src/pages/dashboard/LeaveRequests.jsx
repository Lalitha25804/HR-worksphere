import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getAllLeavesAPI,
  updateLeaveStatusAPI
} from "../../api/leaveApi";

const LeaveRequests = () => {

  const [leaveData,setLeaveData] = useState([]);
  const [selected,setSelected] = useState([]);
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const [startDate,setStartDate] = useState("");
  const [endDate,setEndDate] = useState("");

  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await getAllLeavesAPI();

      const formatted = res.data.map(l => ({
        id: l._id,
        empId: l.employeeId?.empId || l.employeeId?._id?.toString().slice(-4) || "EMP",
        name: l.employeeId?.name || "Employee",
        type: l.reason || "Leave",
        from: l.fromDate,
        to: l.toDate,
        status: l.status,
        avatar: "https://i.pravatar.cc/40"
      }));

      setLeaveData(formatted);

    } catch (err) {
      console.error(err);
      alert("Failed to fetch leaves");
    }
  };

  const updateStatus = async (id,newStatus)=>{
    try {
      await updateLeaveStatusAPI(id,newStatus);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const calculateLeaveDays = (leave)=>{
    const start=new Date(leave.from);
    const end=new Date(leave.to);
    return (end-start)/(1000*60*60*24)+1;
  };

  const filteredLeaves = leaveData.filter(l=>{

    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.empId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filter==="All" || l.status===filter;

    const matchesDate =
      (!startDate || new Date(l.from)>=new Date(startDate)) &&
      (!endDate || new Date(l.to)<=new Date(endDate));

    return matchesSearch && matchesStatus && matchesDate;

  });

  return(

    <div className="space-y-6 text-white">

      <h2 className="text-2xl font-bold">Leave Requests</h2>

      <div className="flex flex-wrap gap-4 bg-white/10 p-4 rounded-xl">

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="px-3 py-2 bg-slate-900 rounded"
        />

        <select
          value={filter}
          onChange={(e)=>setFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 rounded"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <input type="date"
          value={startDate}
          max={todayDate}
          onChange={(e)=>setStartDate(e.target.value)}
          className="px-3 py-2 bg-slate-900 rounded"/>

        <input type="date"
          value={endDate}
          max={todayDate}
          onChange={(e)=>setEndDate(e.target.value)}
          className="px-3 py-2 bg-slate-900 rounded"/>

      </div>

      <div className="bg-white/10 rounded-xl overflow-hidden">

        <table className="w-full text-sm text-left border-collapse">

          <thead className="bg-slate-900 text-gray-300">

            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3 text-center">Days</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>

          </thead>

          <tbody>

            {filteredLeaves.map(l=>(

              <motion.tr
                key={l.id}
                className="border-b border-white/10"
              >

                <td className="px-4 py-3">{l.empId}</td>
                <td className="px-4 py-3">{l.name}</td>
                <td className="px-4 py-3">{l.from}</td>
                <td className="px-4 py-3">{l.to}</td>

                <td className="px-4 py-3 text-center">
                  {calculateLeaveDays(l)}
                </td>

                <td className="px-4 py-3">{l.status}</td>

                <td className="px-4 py-3 text-center">

                  <button
                    onClick={()=>updateStatus(l.id,"Approved")}
                    className="px-3 py-1 bg-green-500/20 rounded mr-2">
                    Approve
                  </button>

                  <button
                    onClick={()=>updateStatus(l.id,"Rejected")}
                    className="px-3 py-1 bg-red-500/20 rounded">
                    Reject
                  </button>

                </td>

              </motion.tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default LeaveRequests;