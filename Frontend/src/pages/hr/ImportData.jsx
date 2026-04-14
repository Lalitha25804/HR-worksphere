import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { bulkAddEmployeesAPI, uploadDocumentAPI, getImportHistoryAPI, deleteImportHistoryAPI } from "../../api/employeesApi";
import { useNavigate } from "react-router-dom";
import uploadImg from "../../assets/addemployee.jpg";

const ImportData = () => {
  const [data, setData] = useState([]);
  const [fileObj, setFileObj] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getImportHistoryAPI();
      setHistory(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

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
        
        // Map excel columns to expected db shape Case-Insensitively
        const formatted = json.map(row => {
          const getVal = (keys) => {
             const foundKey = Object.keys(row).find(k => keys.includes(k.trim().toLowerCase()));
             return foundKey ? row[foundKey] : undefined;
          };

          return {
            name: getVal(["name", "employee name", "fullname", "full name"]),
            email: getVal(["email", "email id", "email address", "work email"]),
            dept: getVal(["department", "dept", "team"]),
            role: getVal(["role", "designation", "job title"]) || "Employee",
            baseSalary: getVal(["base salary", "salary", "basic pay", "ctc"]) || 0,
            pfPercentage: getVal(["pf %", "pf", "provident fund"]) || 12,
            taxPercentage: getVal(["tax %", "tax"]) || 10
          };
        }).filter(r => r.name || r.email); // Keep if they have at least name or email

        setData(formatted);
        setFileObj(file);
        if (formatted.length === 0 && json.length > 0) {
          // generic file fallback, do nothing
        }
        setSuccessMsg(null);
      } catch (err) {
        // If it's not an excel file or parsing fails, just treat it as a generic document
        setData([]);
        setFileObj(file);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!fileObj) return;
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Upload File
      const formData = new FormData();
      formData.append("file", fileObj);
      const uploadRes = await uploadDocumentAPI(formData);
      
      const fileInfo = {
        fileName: fileObj.name,
        fileUrl: uploadRes.data.fileUrl,
        size: fileObj.size
      };

      // 2. Perform Bulk Insert with File Context
      const response = await bulkAddEmployeesAPI({ employeesData: data || [], fileInfo });
      
      if (response.data.successCount > 0) {
        setSuccessMsg(response.data.message || `Successfully imported ${response.data.successCount} employees.`);
      } else {
        setSuccessMsg("Document uploaded and saved successfully to session history.");
      }
      setData([]);
      setFileObj(null);
      fetchHistory(); // Refresh table
      
      if (response.data.failedCount > 0 && response.data.successCount === 0) {
        setSuccessMsg("Document uploaded securely (No valid new employee records parsed).");
      }
    } catch (err) {
      alert("Import failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this import session? The physical file will be removed permanently, but any employees successfully imported will remain.")) return;
    try {
       await deleteImportHistoryAPI(id);
       setSuccessMsg("Session deleted successfully.");
       fetchHistory();
    } catch (err) {
       alert("Failed to delete record: " + (err.response?.data?.error || err.message));
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

        <h1 className="text-center text-3xl font-bold mb-4">Import Files & Data</h1>
        <p className="text-center text-gray-300 mb-8">Upload HR listings (.xlsx / .csv) or any other generic document formats (.pdf, .doc, etc.) up to 50MB.</p>

        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-300/40 text-green-100 font-semibold">
            {successMsg}
          </div>
        )}

        <div className="flex justify-center mb-4">
          <label className="\n            cursor-pointer\n            px-8 py-4 \n            bg-gradient-to-r from-indigo-500 to-purple-600 \n            rounded-xl shadow-lg border border-indigo-400\n            text-lg font-bold hover:shadow-indigo-500/30 transition\n          ">
            Select Any File To Upload
            <input type="file" accept="*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        
        {fileObj && (
          <div className="flex flex-col items-center mb-8 gap-3">
             <p className="text-center text-teal-300 font-semibold">
               File Loaded: {fileObj.name}
             </p>
             <div className="flex gap-4">
               <button
                 onClick={() => { setData([]); setFileObj(null); setError(null); }}
                 className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition font-semibold text-sm"
               >
                 Clear File
               </button>
               <button
                 onClick={handleImport}
                 disabled={loading}
                 className={`px-6 py-2 rounded-lg text-white font-bold transition text-sm ${loading ? 'opacity-50 cursor-not-allowed bg-blue-700' : 'bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-green-500/30'}`}
               >
                 {loading ? "Uploading..." : (data.length > 0 ? `Confirm & Import ${data.length} Records` : "Confirm & Upload Document")}
               </button>
             </div>
          </div>
        )}

        {data.length > 0 && (
          <div className="bg-black/20 rounded-xl p-4 overflow-hidden border border-white/10 mb-8">
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
          </div>
        )}

        {/* IMPORT HISTORY TABLE */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Past Import Sessions</h2>
          {history.length > 0 ? (
            <div className="bg-black/20 rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/10 text-gray-200">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">File Name</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-gray-300">
                  {history.map(item => (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium truncate max-w-[250px]">
                        {item.fileName}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <a 
                            href={`http://localhost:5000${item.fileUrl}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs font-semibold px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded border border-blue-500/40 transition"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => handleDeleteHistory(item._id)}
                            className="text-xs font-semibold px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded border border-red-500/40 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 bg-black/10 rounded-xl border border-white/5 text-white/40 italic">
              No previous import history records found.
            </div>
          )}
        </div>

      </motion.div>
    </div>

  );
};

export default ImportData;
