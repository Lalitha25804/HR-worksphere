import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

const ManagerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password
      });

      const { token, user } = res.data;

      if (user.role !== "Manager") {
        setError(`Only Managers can login here. You are registered as ${user.role}.`);
        setLoading(false);
        return;
      }

      login({ token, role: user.role, name: user.name, email: user.email });
      navigate("/manager-dashboard");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 relative overflow-hidden px-4">
      {/* Modern Professional SaaS Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
      
      {/* Enhanced Animated Theme Glows */}
      <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] bg-emerald-500/30 rounded-full blur-[100px] z-0 pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] bg-teal-500/30 rounded-full blur-[100px] z-0 pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[900px] flex rounded-3xl overflow-hidden bg-white shadow-2xl relative z-10 mx-auto"
      >
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-center items-start w-1/2 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950 p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-wider">Manager Hub</h1>
            </div>

            <h2 className="text-3xl font-extrabold mb-4 leading-tight">
              Lead your<br />Team to Success.
            </h2>
            <p className="text-emerald-100/80 text-sm mb-8 leading-relaxed max-w-xs">
              Access real-time productivity metrics, manage leave requests, and orchestrate shift schedules directly.
            </p>

            <div className="flex gap-3">
               <div className="text-center py-2 px-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                  <h4 className="font-bold text-lg text-white">Shifts</h4>
                  <p className="text-[10px] text-emerald-200 uppercase tracking-widest mt-0.5">Orchestrate</p>
               </div>
               <div className="text-center py-2 px-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                  <h4 className="font-bold text-lg text-white">Approvals</h4>
                  <p className="text-[10px] text-emerald-200 uppercase tracking-widest mt-0.5">Manage</p>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 bg-gray-50 flex flex-col justify-center relative">
          
          <div className="flex items-center justify-between mb-8">
            <Link to="/get-started" className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 font-semibold transition-colors text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <div className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-full tracking-wider border border-emerald-200">
              Leadership Access
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1.5">Manager Login</h2>
            <p className="text-gray-500 font-medium text-xs">
              Enter your credentials provided by the HR Administrator.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-red-700 text-xs font-semibold">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Manager Email"
                required
                autoComplete="new-password"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm tracking-wide"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm tracking-wide"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2.5 rounded-lg shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-70 group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                  {loading ? "Authenticating..." : "Access Dashboard"}
                </span>
              </button>
            </div>

          </form>

        </div>
      </motion.div>
    </main>
  );
};

export default ManagerLogin;