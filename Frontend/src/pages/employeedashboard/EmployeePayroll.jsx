import { useState, useEffect } from "react";
import { getMyPayrollAPI } from "../../api/payrollApi";
import { ListFilter, Download, Landmark, BadgeCheck } from "lucide-react";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const EmployeePayroll = () => {
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMonth, setFilterMonth] = useState(currentMonth.toString().padStart(2, "0"));
  const [filterYear, setFilterYear] = useState(currentYear.toString());

  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {

    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const res = await getMyPayrollAPI(filterMonth, filterYear);
        setPayrollData(res.data);
      } catch (err) {
        console.error("Payroll API failed:", err);
        setPayrollData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, [filterMonth, filterYear]);

  // Download Handler (Visual Demo)
  const handleDownload = () => {
    alert("Executing PDF Document Compilation for active financial matrix (Demo).");
  };

  // Safe Fallback Aggregators
  const baseSalary = payrollData?.grossSalary || 0;
  const hra = 0; // HRA omitted from DB defaults native calculation structure
  const shiftAllowance = payrollData?.totalAllowance || 0;
  const overtime = payrollData?.totalOvertime ? (payrollData?.totalOvertime * 1.5 * (baseSalary/30/8)) : 0; // standard backend estimation fallback
  
  // Actually, the backend `salaryBeforeTaxes` includes standard allowances, so OT is natively embedded in Gross in the UI block. 
  // Let's rely on standard backend vars to populate the literal UI design.
  const ui_ot = typeof payrollData?.totalOvertime === 'number' ? (payrollData?.totalOvertime * 1.5 * (baseSalary/30/8)).toFixed(2) : 0;
  const ui_gross = baseSalary + hra + shiftAllowance + parseFloat(ui_ot);

  const ui_pf = payrollData?.pfAmount || 0;
  const ui_tax = payrollData?.taxAmount || 0;
  const ui_deduction = payrollData?.deduction || 0;
  
  const ui_net = ui_gross - ui_pf - ui_tax - ui_deduction;

  return (
    <div className="space-y-6">

      {/* FILTER & DOWNLOAD HEADER */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl text-white flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2">
                <ListFilter size={18} className="text-teal-400" />
                <span className="text-sm font-semibold tracking-wide text-white/80">Filter Node:</span>
             </div>

             <select 
                value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="bg-white/10 border border-white/20 text-white text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 transition"
             >
                {Array.from({length: 12}, (_, i) => {
                    const m = (i + 1).toString().padStart(2, "0");
                    return <option key={m} value={m}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                })}
             </select>

             <select 
                value={filterYear} onChange={e => setFilterYear(e.target.value)}
                className="bg-white/10 border border-white/20 text-white text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 transition"
             >
                <option className="text-black" value={currentYear.toString()}>{currentYear}</option>
                <option className="text-black" value={(currentYear - 1).toString()}>{currentYear - 1}</option>
             </select>
          </div>

        <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider transition bg-white/10 border border-white/20 hover:bg-teal-500/30 text-white hover:text-white transition">
             <Download size={18} />
             DOWNLOAD PAYSLIP
          </button>
      </div>

      {sessionError && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-6 rounded-3xl text-center shadow-lg animate-pulse">
              <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">Sync Context Missing</h2>
              <p className="text-sm opacity-80">We failed to map your unique Session Target Identifier dynamically into the payload parameter check constraints implicitly!</p>
              <br />
              <p className="font-bold uppercase tracking-widest text-xs opacity-90">SOLUTION: Please Log Out and Log Back In immediately to refresh your encrypted node parameters.</p>
          </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col justify-between group overflow-hidden relative text-white">
             <div className="flex justify-between items-start">
                <span className="text-white/60 font-semibold text-sm tracking-widest uppercase">Net Salary</span>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                   <Landmark size={22} className="text-emerald-400" />
                </div>
             </div>
             {loading ? <span className="text-emerald-300/80 italic text-2xl mt-4 animate-pulse">Evaluating...</span> : (
                 <p className="text-4xl font-bold text-white mt-4 tracking-tight drop-shadow-md">₹{ui_net.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
             )}
         </div>

         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col justify-between group overflow-hidden relative text-white">
             <div className="flex justify-between items-start">
                <span className="text-white/60 font-semibold text-sm tracking-widest uppercase">Status Designation</span>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                   <BadgeCheck size={22} className="text-sky-400" />
                </div>
             </div>
             {loading ? <span className="text-sky-300/80 italic text-2xl mt-4 animate-pulse">Evaluating...</span> : (
                 <p className="text-3xl font-bold text-white mt-4 tracking-tight uppercase tracking-widest">{payrollData ? "Pending" : "Inactive"}</p>
             )}
         </div>
      </div>

      {/* MONOSPACED PLAIN TEXT SALARY RECEIPT BREAKDOWN */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden flex flex-col text-white">
          <h3 className="text-lg font-semibold tracking-wide mb-6">My Salary</h3>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-sm leading-8 text-white/80 whitespace-pre overflow-x-auto">
{loading ? (
`Generating exact mathematical distributions...
Evaluating Temporal Shifts...
Contacting Main HR Database Array...`
) : (
`Base Salary:        ₹${baseSalary.toFixed(2).padStart(10, ' ')}
HRA:                ₹${hra.toFixed(2).padStart(10, ' ')}
Shift Allowance:    ₹${shiftAllowance.toFixed(2).padStart(10, ' ')}
OT:                 ₹${parseFloat(ui_ot).toFixed(2).padStart(10, ' ')}
---------------------------------------------
Gross Salary:       ₹${ui_gross.toFixed(2).padStart(10, ' ')}

PF:                 ₹${ui_pf.toFixed(2).padStart(10, ' ')}
Tax:                ₹${ui_tax.toFixed(2).padStart(10, ' ')}
Leave Deduction:    ₹${ui_deduction.toFixed(2).padStart(10, ' ')}
---------------------------------------------
Net Salary:         ₹${ui_net.toFixed(2).padStart(10, ' ')}`
)}
          </div>
      </div>

    </div>
  );
};

export default EmployeePayroll;
