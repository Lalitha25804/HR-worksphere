import { Link } from "react-router-dom";
import {
  Users,
  Clock,
  CreditCard,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

import heroImg from "../../assets/hero.jpg";
import hrImg from "../../assets/Hrcard.jpg";
import managerImg from "../../assets/managercard.jpg";
import employeeImg from "../../assets/employee.jpg";

const Landing = () => {
  return (
    <main className="bg-gray-50">

      {/* ================= HERO ================= */}
      <section
        className="relative bg-cover bg-center min-h-[85vh] flex items-center"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold">
            Manage Your Workforce Smarter
          </h1>

          <p className="mt-6 text-lg text-gray-200 max-w-3xl mx-auto">
            HRWorkSphere helps organizations manage employees, attendance,
            payroll, performance, and leave — all in one place.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/get-started"
              className="px-6 py-3 bg-blue-600 rounded-md hover:bg-blue-700 transition"
            >
              Get Started
            </Link>

            <a
              href="#features"
              className="px-6 py-3 border border-white rounded-md hover:bg-white hover:text-black transition"
            >
              View Features
            </a>
          </div>
        </div>
      </section>

      {/* ================= ROLES ================= */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center text-slate-800">
            Built for Every Role
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">

            <Link
              to="/hr-login"
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={hrImg}
                alt="HR role"
                loading="lazy"
                className="h-48 w-full object-cover group-hover:scale-105 transition"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-blue-600">HR</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Manage employees, payroll, policies, and approvals.
                </p>
              </div>
            </Link>

            <Link
              to="/manager-login"
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={managerImg}
                alt="Manager role"
                loading="lazy"
                className="h-48 w-full object-cover group-hover:scale-105 transition"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-green-600">Manager</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Track attendance, approve leaves, and monitor teams.
                </p>
              </div>
            </Link>

            <Link
              to="/employee-login"
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={employeeImg}
                alt="Employee role"
                loading="lazy"
                className="h-48 w-full object-cover group-hover:scale-105 transition"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-purple-600">
                  Employee
                </h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Apply for leave, view attendance, and download payslips.
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ================= FEATURES (ICONS + SINGLE BLUR BACKGROUND) ================= */}
      <section
        id="features"
        className="relative bg-gray-50 py-20 overflow-hidden"
      >
        {/* Section-level blur background */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-300 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-green-300 rounded-full blur-3xl opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center text-slate-800">
            Core Features
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Employee Management",
                icon: <Users className="w-6 h-6 text-blue-600" />,
              },
              {
                title: "Attendance Tracking",
                icon: <Clock className="w-6 h-6 text-green-600" />,
              },
              {
                title: "Payroll Processing",
                icon: <CreditCard className="w-6 h-6 text-purple-600" />,
              },
              {
                title: "Leave Management",
                icon: <CalendarCheck className="w-6 h-6 text-yellow-600" />,
              },
              {
                title: "Performance Evaluation",
                icon: <BarChart3 className="w-6 h-6 text-pink-600" />,
              },
              {
                title: "Secure Role-Based Access",
                icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 shadow-md
                           hover:shadow-lg hover:-translate-y-1
                           transition-all duration-500
                           animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <p className="font-medium text-slate-800">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-slate-900 text-white py-16 text-center">
        <h2 className="text-3xl font-semibold">
          Ready to Simplify HR Operations?
        </h2>
        <p className="mt-4 text-gray-300">
          Start managing your workforce efficiently with HRWorkSphere.
        </p>
        <Link
          to="/employee-login"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          Login Now
        </Link>
      </section>

    </main>
  );
};

export default Landing;