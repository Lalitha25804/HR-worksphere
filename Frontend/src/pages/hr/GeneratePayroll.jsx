import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import { DownloadCloud, Calculator, AlertCircle, FileText, IndianRupee, Ban, TrendingUp, TrendingDown } from "lucide-react";
import payrollImg from "../../assets/payroll.jpg"; // Keeping image for visual if desired, or can use lucide icons
import { getEmployeesAPI } from "../../api/employeesApi";
import { getPayrollAPI } from "../../api/payrollApi";

const GeneratePayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payrollData, setPayrollData] = useState(null);

  // Determine current month in YYYY-MM format to restrict future selections
  const today = new Date();
  const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

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
    doc.text(`+ ---`, 150, 120); 

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden relative">
        
        {/* Soft Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="p-8 md:p-12 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-8 border-b border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
               <FileText className="w-10 h-10 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Generate Payroll</h1>
              <p className="text-indigo-200 mt-2 font-medium">Dynamically calculate monthly salaries using the Global HR Engine.</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 rounded-xl bg-red-500/20 border border-red-400/30 text-red-100 flex items-center gap-3 backdrop-blur-md">
               <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
               <p className="font-medium">{error}</p>
             </motion.div>
          )}

          {/* Form Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-100 tracking-wide ml-1">Select Employee</label>
              <select
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-900/50 border border-white/10 text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm appearance-none"
              >
                <option value="" disabled>Choose an employee...</option>
                {employees.map(e => (
                   <option key={e._id} value={e._id} className="bg-slate-800 text-white">{e.name} (EMP ID: {e.empId})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-100 tracking-wide ml-1">Payroll Cycle (Month / Year)</label>
              <input
                type="month"
                max={currentMonthYear}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-900/50 border border-white/10 text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Execute Action */}
          <div className="flex justify-center md:justify-end mb-10 border-b border-white/10 pb-10">
             <button
              onClick={generateDynamicPayroll}
              disabled={loading || !selectedEmp || !selectedMonth}
              className={`px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center gap-2
                ${loading || !selectedEmp || !selectedMonth 
                  ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/5' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border border-white/20'}`}
             >
               <Calculator className="w-5 h-5" />
               {loading ? "Computing Payroll..." : "Calculate Payroll"}
             </button>
          </div>

          {/* Output Dashboard */}
          {payrollData && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="bg-slate-900/60 rounded-3xl p-8 border border-white/10 shadow-inner relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none"></div>

                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
                     <IndianRupee className="w-7 h-7 text-emerald-400" /> Salary Breakdown
                  </h3>
                  <div className="text-sm font-medium text-slate-400">
                    Cycle: <span className="text-white">{selectedMonth}</span>
                  </div>
                </div>
                
                {/* Breakdowns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-200">
                  
                  {/* Base & Additions */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Base Salary</span>
                        <span className="font-bold text-lg">₹{payrollData.grossSalary}</span>
                     </div>
                     <div className="flex items-center justify-between text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Shift Allowance</span>
                        <span className="font-bold">+ ₹{payrollData.totalAllowance}</span>
                     </div>
                     <div className="flex items-center justify-between text-emerald-300">
                        <span className="flex items-center gap-2 text-sm"><ClockIcon className="w-4 h-4"/> Overtime ({payrollData.totalOvertime}hrs)</span>
                        <span className="font-bold text-sm">Included</span>
                     </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                     <div className="flex items-center justify-between text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        <span className="flex items-center gap-2"><Ban className="w-4 h-4"/> Leave Deductions</span>
                        <span className="font-bold">- ₹{payrollData.deduction}</span>
                     </div>
                     <div className="flex items-center justify-between text-slate-300 pt-2">
                        <span className="text-sm text-slate-400">Leaves Taken</span>
                        <span className="font-bold">{payrollData.leaveDays} days</span>
                     </div>
                     <div className="flex items-center justify-between text-orange-300 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                        <span className="flex items-center gap-2"><TrendingDown className="w-4 h-4"/> Taxes & PF</span>
                        <span className="font-bold">- ₹{(payrollData.taxAmount + payrollData.pfAmount).toFixed(2)}</span>
                     </div>
                  </div>
                </div>

                {/* Net Total & Download */}
                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-6 justify-between items-center">
                   <div className="flex items-baseline gap-4 bg-emerald-500/10 py-3 px-6 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                     <span className="text-slate-300 font-semibold uppercase tracking-widest text-sm">Net Payable</span>
                     <span className="text-4xl font-black text-emerald-400 tracking-tight">₹{payrollData.salary}</span>
                   </div>

                   <button
                      onClick={downloadPayslip}
                      className="px-8 py-4 bg-white text-indigo-900 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 rounded-xl font-extrabold flex items-center gap-3 transition-all duration-300"
                    >
                      <DownloadCloud className="w-5 h-5 text-indigo-600" />
                      Download Final Payslip
                   </button>
                </div>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
};

// Mini helper component for missing lucide icon
const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

export default GeneratePayroll;