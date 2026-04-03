import { useState } from "react";
import * as XLSX from "xlsx";
import exportImg from "../../assets/export.jpg";

const ExportData = () => {

  const [dataset, setDataset] = useState("attendance");

  const exportExcel = () => {

    let data = [];

    if (dataset === "attendance") {
      data = [
        { Employee: "John", Date: "2026-03-01", Status: "Present" },
        { Employee: "Sara", Date: "2026-03-01", Status: "Late" },
        { Employee: "David", Date: "2026-03-01", Status: "Absent" }
      ];
    }

    if (dataset === "performance") {
      data = [
        { Employee: "John", Tasks: 18, Rating: "Excellent" },
        { Employee: "Sara", Tasks: 14, Rating: "Good" },
        { Employee: "David", Tasks: 10, Rating: "Average" }
      ];
    }

    if (dataset === "employees") {
      data = [
        { Name: "John", Department: "Engineering", Role: "Developer" },
        { Name: "Sara", Department: "HR", Role: "Manager" },
        { Name: "David", Department: "Finance", Role: "Accountant" }
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // This automatically downloads the file
    XLSX.writeFile(workbook, `${dataset}-report.xlsx`);

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-6">

      <div className="w-full max-w-3xl p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

        <div className="flex justify-center mb-4">
          <img
            src={exportImg}
            alt="export"
            className="w-24 h-24 rounded-full border border-white/30"
          />
        </div>

        <h1 className="text-white text-2xl text-center font-bold mb-6">
          Export Data
        </h1>

        <div className="mb-6">

          <label className="text-white text-sm">
            Select Data to Export
          </label>

          <select
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            className="w-full mt-2 p-3 rounded-lg bg-white/20 border border-white/30 text-white"
          >
            <option value="attendance">Attendance Report</option>
            <option value="performance">Performance Report</option>
            <option value="employees">Employee List</option>
          </select>

        </div>

        <div className="flex justify-center">

          <button
            onClick={exportExcel}
            className="px-8 py-3 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 transition"
          >
            Download Excel
          </button>

        </div>

      </div>

    </div>
  );
};

export default ExportData;