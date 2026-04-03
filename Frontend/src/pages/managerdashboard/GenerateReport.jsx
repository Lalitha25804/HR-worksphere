import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import reportImg from "../../assets/report.jpg";

const GenerateReport = () => {

  const [reportType, setReportType] = useState("performance");
  const [employee, setEmployee] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePDF = () => {

    if (!startDate || !endDate) {
      alert("Please select report date range");
      return;
    }

    setLoading(true);

    setTimeout(() => {

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Employee Report", 14, 15);

      doc.setFontSize(11);
      doc.text(`Report Type: ${reportType}`, 14, 25);
      doc.text(`Employee: ${employee}`, 14, 32);
      doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 39);

      let tableData = [];

      if (reportType === "performance") {
        tableData = [
          ["John", "18 Tasks", "Excellent"],
          ["Sara", "14 Tasks", "Good"],
          ["David", "10 Tasks", "Average"]
        ];
      }

      if (reportType === "attendance") {
        tableData = [
          ["John", "Present", "95%"],
          ["Sara", "Late", "90%"],
          ["David", "Absent", "85%"]
        ];
      }

      if (reportType === "leave") {
        tableData = [
          ["John", "2 Days", "Approved"],
          ["Sara", "1 Day", "Approved"],
          ["David", "3 Days", "Pending"]
        ];
      }

      autoTable(doc, {
        startY: 50,
        head: [["Employee", "Details", "Status"]],
        body: tableData
      });

      doc.save(`${reportType}-report.pdf`);

      setLoading(false);

    }, 1000);

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-6">

      <div className="w-full max-w-3xl p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

        <div className="flex justify-center mb-4">
          <img
            src={reportImg}
            alt="report"
            className="w-24 h-24 rounded-full border border-white/30"
          />
        </div>

        <h1 className="text-white text-2xl text-center font-bold mb-6">
          Generate Performance Report
        </h1>

        {/* Report Type */}
        <div className="mb-4">
          <label className="text-white text-sm">Report Type</label>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-slate-800 text-white"
          >
            <option value="performance">Performance</option>
            <option value="attendance">Attendance</option>
            <option value="leave">Leave</option>
            <option value="productivity">Productivity</option>
          </select>
        </div>

        {/* Employee Filter */}
        <div className="mb-4">
          <label className="text-white text-sm">Select Employee</label>

          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-slate-800 text-white"
          >
            <option value="all">All Employees</option>
            <option value="John">John</option>
            <option value="Sara">Sara</option>
            <option value="David">David</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <div>
            <label className="text-white text-sm">Start Date</label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 rounded bg-slate-800 text-white"
            />
          </div>

          <div>
            <label className="text-white text-sm">End Date</label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 rounded bg-slate-800 text-white"
            />
          </div>

        </div>

        {/* Generate Button */}
        <div className="flex justify-center">

          <button
            onClick={generatePDF}
            disabled={loading}
            className="px-8 py-3 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 transition"
          >
            {loading ? "Generating..." : "Generate PDF Report"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default GenerateReport;