import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import payrollImg from "../../assets/payroll.jpg";
import { getEmployeesAPI } from "../../api/employeesApi";
import { getPayrollAPI } from "../../api/payrollApi";

const GeneratePayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [payrollData, setPayrollData] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployeesAPI();
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to load employees for payroll.");
    }
  };

  const generateDynamicPayroll = async () => {
    if (!selectedEmp || !selectedMonth) {
      setError("Please select both Employee and Month.");
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      const [year, month] = selectedMonth.split("-");
      const res = await getPayrollAPI(selectedEmp, month, year);
      setPayrollData(res.data);
    } catch (err) {
       setError(err.response?.data?.error || "Failed to calculate payroll.");
    } finally {
       setLoading(false);
    }
  };

  const downloadPayslip = () => {
    if (!payrollData) return;
    const empData = employees.find(e => e._id === selectedEmp);
    const empName = empData ? empData.name : "Unknown";

    const doc = new jsPDF();

    /* Company Header */
    doc.setFontSize(20);
    doc.text("HR WorkSphere Pvt Ltd", 60, 15);

    doc.setFontSize(14);
    doc.text("Employee Payslip", 80, 25);

    /* Employee Info */
    doc.setFontSize(12);
    doc.text(`Employee Name: ${empName}`, 20, 45);
    doc.text(`Month: ${selectedMonth}`, 20, 55);
    doc.text(`Worked Hours: ${payrollData.totalWorkHours} | OT Hours: ${payrollData.totalOvertime}`, 20, 65);

    /* Table Header */
    doc.text("Salary Component", 20, 85);
    doc.text("Amount (₹)", 150, 85);
    doc.line(20, 88, 190, 88);

    /* Salary Rows */
    doc.text("Base Salary", 20, 100);
    doc.text(`${payrollData.grossSalary}`, 150, 100);

    doc.text("Shift Allowance", 20, 110);
    doc.text(`+ ${payrollData.totalAllowance}`, 150, 110);
    
    doc.text("Overtime Pay", 20, 120);
    doc.text(`+ ---`, 150, 120); // Not splitting it cleanly in UI currently

    doc.text("Leave Deductions", 20, 130);
    doc.text(`- ${payrollData.deduction}`, 150, 130);

    doc.text(`Taxes`, 20, 140);
    doc.text(`- ${payrollData.taxAmount}`, 150, 140);

    doc.text(`Provident Fund`, 20, 150);
    doc.text(`- ${payrollData.pfAmount}`, 150, 150);

    doc.line(20, 155, 190, 155);

    doc.setFontSize(13);
    doc.text("Net Salary", 20, 170);
    doc.text(`₹ ${payrollData.salary}`, 150, 170);

    /* Signature */
    doc.setFontSize(11);
    doc.text("Authorized Signature", 140, 210);
    doc.line(140, 215, 190, 215);

    doc.save(`${empName.replace(/ /g, "_")}_${selectedMonth}_Payslip.pdf`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="w-full max-w-4xl p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="flex justify-center mb-4">
          <img src={payrollImg} alt="payroll" className="w-24 h-24 rounded-full border border-white/30" />
        </div>

        <h1 className="text-center text-white text-3xl font-bold mb-2">Dynamic Payroll</h1>
        <p className="text-center text-gray-300 text-sm mb-6">Calculated via Global HR Settings Engine.</p>

        {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-300/40 text-red-100 text-center">
              {error}
            </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <select
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
            className="p-3 rounded-lg bg-white/20 border border-white/30 text-white outline-none"
          >
            <option value="" className="text-black">Select Employee</option>
            {employees.map(e => (
               <option key={e._id} value={e._id} className="text-black">{e.name} (EMP ID: {e.empId})</option>
            ))}
          </select>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-3 rounded-lg bg-white/20 border border-white/30 text-white outline-none"
          />
        </div>

        <div className="flex justify-center mb-8">
           <button
            onClick={generateDynamicPayroll}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-bold text-white transition ${loading ? 'bg-indigo-400 opacity-50' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'}`}
           >
             {loading ? "Calculating..." : "Calculate Math"}
           </button>
        </div>

        {payrollData && (
          <div className="bg-black/20 rounded-xl p-6 border border-white/10 mt-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Salary Breakdown</h3>
              
              <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-gray-200">
                <div className="flex justify-between">
                   <span>Base Salary</span>
                   <span className="font-semibold">₹{payrollData.grossSalary}</span>
                </div>
                <div className="flex justify-between text-green-300">
                   <span>Shift Allowance (+{payrollData.totalAllowance > 0 ? 'Yes' : 'No'})</span>
                   <span className="font-semibold">+ ₹{payrollData.totalAllowance}</span>
                </div>
                <div className="flex justify-between text-green-300">
                   <span>Overtime ({payrollData.totalOvertime}hrs)</span>
                   <span className="font-semibold">+ (Calc included in net)</span>
                </div>
                <div className="flex justify-between text-red-300">
                   <span>Leave Deduction ({payrollData.leaveDays} days)</span>
                   <span className="font-semibold">- ₹{payrollData.deduction}</span>
                </div>
                <div className="flex justify-between text-red-300">
                   <span>Taxes & PF</span>
                   <span className="font-semibold">- ₹{(payrollData.taxAmount + payrollData.pfAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-white">
                 <span className="text-xl font-bold">Net Payable Salary:</span>
                 <span className="text-3xl font-extrabold text-green-400">₹{payrollData.salary}</span>
              </div>

              <div className="mt-8 flex justify-end">
                  <button
                    onClick={downloadPayslip}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold"
                  >
                    Download PDF Document
                  </button>
              </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GeneratePayroll;