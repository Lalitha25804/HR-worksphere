import { Link } from "react-router-dom";
import {
  Users,
  Clock,
  CreditCard,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

import heroImg from "../../assets/hero.jpg";
import hrImg from "../../assets/Hrcard.jpg";
import managerImg from "../../assets/managercard.jpg";
import employeeImg from "../../assets/employee.jpg";

const Landing = () => {
  return (
    <main className="font-sans relative bg-slate-50 overflow-hidden">
      {/* Global Glowing Mesh Background */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
      
      {/* Highly vibrant animated background orbs across the whole page */}
      <div className="absolute top-[10%] left-[-10%] w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[10%] left-[20%] w-[700px] h-[700px] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '12s' }}></div>

      {/* ================= HERO ================= */}
      <section
        className="relative bg-cover bg-center min-h-[90vh] flex items-center overflow-hidden border-b border-indigo-900/30"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        {/* Colorful deep overlay over the image without blur, reduced opacity so image is clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-indigo-900/40 to-transparent z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2bg-white/10 border border-white/20 rounded-full text-blue-200 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-2xl"
          >
             <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
             The Future of Work is Here
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight drop-shadow-lg text-slate-100"
          >
            Manage Your Workforce <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 drop-shadow-md">Smarter.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md"
          >
            HRWorkSphere helps organizations manage employees, attendance,
            payroll, performance, and leave — all in one powerful dashboard.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row justify-center gap-6"
          >
            <Link
              to="/get-started"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.7)] hover:-translate-y-1 transition-all duration-300 text-lg border border-white/20 flex items-center justify-center gap-3"
            >
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#features"
              className="px-8 py-4 bg-slate-900/40 backdrop-blur-md text-white font-extrabold rounded-2xl border border-white/30 hover:bg-white hover:text-indigo-950 transition-all duration-300 text-lg shadow-xl flex items-center justify-center gap-2"
            >
              Discover Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* ================= ROLES ================= */}
      <section className="relative py-28 bg-slate-200/50 backdrop-blur-xl z-10 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 relative">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Every Role</span>
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-500 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">

            {/* HR Role */}
            <Link
              to="/hr-login"
              className="group bg-white rounded-[2rem] shadow-xl hover:shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:-translate-y-3 transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full relative"
            >
              {/* Colorful hover border top */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20"></div>
              
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-blue-900/20 to-transparent group-hover:via-transparent transition-colors z-10"></div>
                <img
                  src={hrImg}
                  alt="HR role"
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700"
                />
                <div className="absolute bottom-4 left-6 z-20">
                   <div className="bg-blue-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider inline-block border border-blue-400/50">Admin</div>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col bg-gradient-to-b from-white to-blue-50/30">
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">Human Resources</h3>
                <p className="mt-4 text-slate-500 font-medium leading-relaxed flex-grow text-lg">
                  Complete workforce oversight. Manage employees, payroll engines, policies, and complex approvals seamlessly.
                </p>
                <div className="mt-6 flex items-center text-blue-600 font-bold group-hover:gap-2 transition-all">
                  Open Portal <ArrowRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            </Link>

            {/* Manager Role */}
            <Link
              to="/manager-login"
              className="group bg-white rounded-[2rem] shadow-xl hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:-translate-y-3 transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full relative"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20"></div>

              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-emerald-900/20 to-transparent group-hover:via-transparent transition-colors z-10"></div>
                <img
                  src={managerImg}
                  alt="Manager role"
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700"
                />
                <div className="absolute bottom-4 left-6 z-20">
                   <div className="bg-emerald-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider inline-block border border-emerald-400/50">Leadership</div>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col bg-gradient-to-b from-white to-emerald-50/30">
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">Team Manager</h3>
                <p className="mt-4 text-slate-500 font-medium leading-relaxed flex-grow text-lg">
                  Track vital team attendance metrics, approve complex leaves, and monitor shift schedules dynamically.
                </p>
                <div className="mt-6 flex items-center text-emerald-600 font-bold group-hover:gap-2 transition-all">
                  Open Portal <ArrowRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            </Link>

            {/* Employee Role */}
            <Link
              to="/employee-login"
              className="group bg-white rounded-[2rem] shadow-xl hover:shadow-[0_20px_50px_rgba(168,85,247,0.3)] hover:-translate-y-3 transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full relative"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20"></div>

              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-purple-900/20 to-transparent group-hover:via-transparent transition-colors z-10"></div>
                <img
                  src={employeeImg}
                  alt="Employee role"
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700"
                />
                <div className="absolute bottom-4 left-6 z-20">
                   <div className="bg-purple-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider inline-block border border-purple-400/50">Staff</div>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col bg-gradient-to-b from-white to-purple-50/30">
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-purple-700 transition-colors">
                  Employee Core
                </h3>
                <p className="mt-4 text-slate-500 font-medium leading-relaxed flex-grow text-lg">
                  Submit time-off requests, view automated real-time attendance, and download accurate payslips securely.
                </p>
                <div className="mt-6 flex items-center text-purple-600 font-bold group-hover:gap-2 transition-all">
                  Open Portal <ArrowRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ================= CORE FEATURES (VIBRANT GRADIENT CARDS) ================= */}
      <section
        id="features"
        className="relative py-32 z-10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 relative">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Core Features</span>
            </h2>
            <p className="mt-6 text-slate-500 max-w-2xl mx-auto text-xl font-medium">Equipped with ultra-modern modules designed to run your human resources effortlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Employee Management",
                icon: <Users className="w-10 h-10 text-white" />,
                grad: "from-blue-500 to-indigo-600",
                shadow: "shadow-blue-500/30",
                desc: "Centralized directory for secure & fast employee onboarding."
              },
              {
                title: "Attendance Tracking",
                icon: <Clock className="w-10 h-10 text-white" />,
                grad: "from-emerald-400 to-teal-600",
                shadow: "shadow-emerald-500/30",
                desc: "Real-time clock-in mechanisms and manager verifications."
              },
              {
                title: "Payroll Processing",
                icon: <CreditCard className="w-10 h-10 text-white" />,
                grad: "from-purple-500 to-fuchsia-600",
                shadow: "shadow-purple-500/30",
                desc: "Automated salary calculations with robust export solutions."
              },
              {
                title: "Leave Management",
                icon: <CalendarCheck className="w-10 h-10 text-white" />,
                grad: "from-orange-400 to-red-500",
                shadow: "shadow-orange-500/30",
                desc: "Automated dynamic multi-tier approval flows for time off."
              },
              {
                title: "Performance Analytics",
                icon: <BarChart3 className="w-10 h-10 text-white" />,
                grad: "from-pink-500 to-rose-600",
                shadow: "shadow-pink-500/30",
                desc: "Visual charts representing attendance and payroll metrics."
              },
              {
                title: "Role-Based Access",
                icon: <ShieldCheck className="w-10 h-10 text-white" />,
                grad: "from-slate-700 to-slate-900",
                shadow: "shadow-slate-800/30",
                desc: "Bank-level zero-trust policies dictating accurate data flow."
              },
            ].map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                key={item.title}
                className={`bg-gradient-to-br ${item.grad} rounded-3xl p-8 shadow-xl ${item.shadow}
                           hover:shadow-2xl hover:scale-105 hover:-translate-y-2
                           transition-all duration-300 group border border-white/20 relative overflow-hidden`}
              >
                {/* Internal aesthetic shine */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>

                <div className="flex flex-col items-start gap-6 relative z-10">
                  <div className={`w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:rotate-6 transition-transform duration-300 shadow-inner`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/80 font-medium text-lg leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative bg-slate-950 text-white overflow-hidden z-10 border-t-4 border-indigo-500">
        {/* Dark mesh grid for CTA */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Vibrant dual CTA glows */}
        <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/40 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
        <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/40 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-32">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-2xl mb-8">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Simplify</span> HR?
          </h2>
          <p className="mt-8 text-2xl text-indigo-100/90 font-medium max-w-3xl mx-auto leading-relaxed">
            Start managing your workforce efficiently with the advanced integrations inside HRWorkSphere.
          </p>
          <div className="mt-14 inline-flex items-center justify-center relative group">
             {/* Outward glow for the button itself */}
             <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
             
             <Link
               to="/get-started"
               className="relative px-12 py-5 bg-white text-indigo-900 font-extrabold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 hover:bg-slate-50 transition-all duration-300 text-xl tracking-wide flex items-center gap-3"
             >
               Launch Application <ArrowRight className="w-6 h-6 text-indigo-600 group-hover:translate-x-2 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Landing;