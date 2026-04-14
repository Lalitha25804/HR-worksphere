import { Link, useNavigate } from "react-router-dom";
import { Users, UserCog, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

const GetStarted = () => {

  const navigate = useNavigate();

  // ✅ REDIRECT LOGIC
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "HR") navigate("/hr-dashboard");
      else if (role === "Manager") navigate("/manager-dashboard");
      else if (role === "Employee") navigate("/employee-dashboard");
    }
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden px-4 py-12 font-sans">
      
      {/* Modern High-End Tech Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950 z-0 pointer-events-none"></div>
      
      {/* Intense Colored Orbs deeply illuminating the background */}
      <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] bg-indigo-600/30 rounded-full blur-[140px] z-0 pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute bottom-[0%] right-[-5%] w-[700px] h-[600px] bg-emerald-600/20 rounded-full blur-[140px] z-0 pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute top-[20%] right-[30%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] z-0 pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">

        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-indigo-300 text-[11px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-2xl">
             <ShieldCheck className="w-4 h-4 text-indigo-400" />
             Zero-Trust Enterprise Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">HRWorkSphere</span>
          </h1>
          <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Select your assigned role module to securely authenticate and access your personalized management dashboard.
          </p>
        </motion.div>

        {/* Role Cards Container */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl"
        >

          {/* ================= HR ================= */}
          <motion.div variants={itemVariants} className="relative group h-full">
            <Link
              to="/hr-login"
              className="relative h-full flex flex-col rounded-[2rem] p-8 bg-gradient-to-br from-indigo-600 to-blue-800 text-white shadow-2xl hover:shadow-indigo-500/50 hover:-translate-y-2 transition-all duration-300 z-10 border border-white/10 overflow-hidden"
            >
              {/* Internal decorative flare */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-all"></div>

              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6 border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight">HR Portal</h3>
              <p className="mt-3 text-indigo-100/90 leading-relaxed flex-grow font-medium">
                Complete access to employee lifecycles, automated payroll engine, and company-wide policies.
              </p>
              
              {/* Colored Button inside the card */}
              <div className="mt-8">
                 <div className="inline-flex w-full items-center justify-center gap-2 bg-white text-indigo-700 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg">
                   Sign In as HR <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </Link>
          </motion.div>


          {/* ================= MANAGER ================= */}
          <motion.div variants={itemVariants} className="relative group h-full">
            <Link
              to="/manager-login"
              className="relative h-full flex flex-col rounded-[2rem] p-8 bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-2xl hover:shadow-emerald-500/50 hover:-translate-y-2 transition-all duration-300 z-10 border border-white/10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-all"></div>

              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6 border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                <UserCog className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight">Manager</h3>
              <p className="mt-3 text-emerald-100/90 leading-relaxed flex-grow font-medium">
                Orchestrate your department's attendance, oversee shift schedules, and approve leave requests real-time.
              </p>
              
              <div className="mt-8">
                 <div className="inline-flex w-full items-center justify-center gap-2 bg-white text-emerald-700 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg">
                   Sign In as Manager <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </Link>
          </motion.div>


          {/* ================= EMPLOYEE ================= */}
          <motion.div variants={itemVariants} className="relative group h-full">
            <Link
              to="/employee-login"
              className="relative h-full flex flex-col rounded-[2rem] p-8 bg-gradient-to-br from-cyan-600 to-blue-900 text-white shadow-2xl hover:shadow-cyan-500/50 hover:-translate-y-2 transition-all duration-300 z-10 border border-white/10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-all"></div>

              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6 border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight">Staff Base</h3>
              <p className="mt-3 text-cyan-100/90 leading-relaxed flex-grow font-medium">
                Connect to your personalized workspace to view allocated tasks, track active shifts, and access payroll.
              </p>
              
              <div className="mt-8">
                 <div className="inline-flex w-full items-center justify-center gap-2 bg-white text-cyan-700 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg">
                   Sign In Securely <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </Link>
          </motion.div>

        </motion.div>

        {/* Register CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 text-center border-t border-white/10 pt-8 w-full max-w-lg relative"
        >
          {/* Subtle colored glow behind the registration section */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-indigo-500/30 blur-3xl z-0 rounded-full pointer-events-none"></div>

          <p className="text-slate-400 text-sm mb-5 font-medium relative z-10">Are you a new HR Administrator setting up?</p>
          <Link to="/register" className="relative z-10">
            <button className="bg-indigo-600/30 backdrop-blur-xl border border-indigo-400/40 text-blue-50 hover:bg-indigo-500/50 hover:border-indigo-300/60 shadow-[0_0_20px_rgba(99,102,241,0.2)] px-8 py-3 rounded-xl font-extrabold transition-all duration-300 text-sm tracking-wide">
              Create HR Platform Account
            </button>
          </Link>
        </motion.div>

      </div>
    </main>
  );
};

export default GetStarted;