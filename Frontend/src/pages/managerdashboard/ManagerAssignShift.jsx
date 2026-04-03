import { useState } from "react";
import shiftImg from "../../assets/payroll.jpg";

const ManagerAssignShift = () => {

  const [shift, setShift] = useState({
    employee: "",
    shiftType: "",
    date: "",
    startTime: "",
    endTime: ""
  });

  const handleChange = (e) => {
    setShift({
      ...shift,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log("Shift Assigned:", shift);
    alert("Shift assigned successfully!");
  };

  return (

    <div className="min-h-screen flex items-center justify-center p-6
    bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">

      <div className="w-full max-w-3xl p-8 rounded-2xl
      bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

        <div className="flex justify-center mb-4">
          <img
            src={shiftImg}
            alt="shift"
            className="w-24 h-24 rounded-full border border-white/30"
          />
        </div>

        <h1 className="text-center text-white text-2xl font-bold mb-6">
          Assign Employee Shift
        </h1>

        {/* Form Inputs */}

        <div className="grid grid-cols-2 gap-4 mb-6">

          <select
            name="employee"
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/20 border border-white/30 text-white">

            <option className="text-black">Select Employee</option>
            <option className="text-black">Rahul Sharma</option>
            <option className="text-black">Priya Patel</option>
            <option className="text-black">Arjun Kumar</option>

          </select>

          <select
            name="shiftType"
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/20 border border-white/30 text-white">

            <option className="text-black">Select Shift</option>
            <option className="text-black">Morning</option>
            <option className="text-black">Evening</option>
            <option className="text-black">Night</option>

          </select>

          <input
            type="date"
            name="date"
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/20 border border-white/30 text-white"
          />

          <input
            type="time"
            name="startTime"
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/20 border border-white/30 text-white"
          />

          <input
            type="time"
            name="endTime"
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/20 border border-white/30 text-white"
          />

        </div>

        {/* Preview Table */}

        <table className="w-full text-white border border-white/20 mb-6">

          <tbody>

            <tr className="border-b border-white/20">
              <td className="p-3">Employee</td>
              <td className="p-3">{shift.employee}</td>
            </tr>

            <tr className="border-b border-white/20">
              <td className="p-3">Shift</td>
              <td className="p-3">{shift.shiftType}</td>
            </tr>

            <tr className="border-b border-white/20">
              <td className="p-3">Date</td>
              <td className="p-3">{shift.date}</td>
            </tr>

            <tr className="border-b border-white/20">
              <td className="p-3">Start Time</td>
              <td className="p-3">{shift.startTime}</td>
            </tr>

            <tr>
              <td className="p-3">End Time</td>
              <td className="p-3">{shift.endTime}</td>
            </tr>

          </tbody>

        </table>

        {/* Buttons */}

        <div className="flex justify-center gap-4">

          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white">

            Assign Shift

          </button>

          <button
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white">

            Save Schedule

          </button>

        </div>

      </div>

    </div>

  );
};

export default ManagerAssignShift;