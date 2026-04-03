import { useState } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { bulkAddEmployeesAPI } from "../../api/employeesApi";
import { useNavigate } from "react-router-dom";
import uploadImg from "../../assets/addemployee.jpg"; // Re-using image as placeholder

const ImportData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];

        const json = XLSX.utils.sheet_to_json(ws);
        
        // Map excel columns to expected db shape
        // We expect Excel to have: Name, Email, Department, Role, Base Salary
        const formatted = json.map(row => ({
          name: row["Name"] || row["name"],
          email: row["Email"] || row["email"],
          dept: row["Department"] || row["department"] || row["dept"],
          role: row["Role"] || row["role"] || "Employee",
          baseSalary: row["Base Salary"] || row["baseSalary"] || row["salary"] || 0,
          pfPercentage: row["PF %"] || 12,
          taxPercentage: row["Tax %"] || 10
        })).filter(r => r.name && r.email && r.dept && r.baseSalary); // strip invalid rows

        setData(formatted);
        setError(null);
        setSuccessMsg(null);
      } catch (err) {
        setError("Error parsing the file. Please ensure it's a valid Excel or CSV.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await bulkAddEmployeesAPI(data);
      setSuccessMsg(response.data.message || `Successfully imported ${response.data.successCount} employees.`);
      setData([]);
      
      // Notify them that auth wasn't created yet or was bypassed
      if (response.data.failedCount > 0) {
        setError(`Warning: ${response.data.failedCount} records failed to import (Check emails for duplicates).`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold mb-4">Import Real Data</h1>
        <p className="text-center text-gray-300 mb-8">Upload an Excel (.xlsx) or CSV file provided by HR containing initial Employee listings.</p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-300/40 text-red-100 flex items-center gap-3">
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-300/40 text-green-100 font-semibold">
            {successMsg}
          </div>
        )}

        <div className="flex justify-center mb-10">
          <label className="\n            cursor-pointer\n            px-8 py-4 \n            bg-gradient-to-r from-indigo-500 to-purple-600 \n            rounded-xl shadow-lg border border-indigo-400\n            text-lg font-bold hover:shadow-indigo-500/30 transition\n          ">
            Select .XLSX / .CSV File
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {data.length > 0 && (
          <div className="bg-black/20 rounded-xl p-4 overflow-hidden border border-white/10">
            <h3 className="font-semibold text-lg mb-4">Preview ({data.length} records found)</h3>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/10 text-gray-200">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Dept</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Base Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-gray-300">
                  {data.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="p-3">{row.name}</td>
                      <td className="p-3">{row.email}</td>
                      <td className="p-3">{row.dept}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${row.role === 'Manager' ? 'bg-orange-500/40' : 'bg-blue-500/40'}`}>
                          {row.role}
                        </span>
                      </td>
                      <td className="p-3">₹{row.baseSalary}</td>
                    </tr>
                  ))}
                  {data.length > 50 && (
                    <tr>
                      <td colSpan="5" className="p-3 text-center text-gray-400 italic">...and {data.length - 50} more records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setData([])}
                className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition font-semibold"
              >
                Clear
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className={`px-8 py-2 rounded-lg text-white font-bold transition ${loading ? 'opacity-50 cursor-not-allowed bg-blue-700' : 'bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-green-500/30'}`}
              >
                {loading ? "Importing..." : "Confirm & Import Database"}
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default ImportData;
