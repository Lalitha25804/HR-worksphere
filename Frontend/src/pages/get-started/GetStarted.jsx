import { Link, useNavigate } from "react-router-dom";
import { Users, UserCog, User } from "lucide-react";
import { useEffect } from "react";

const GetStarted = () => {

  const navigate = useNavigate();

  // ✅ FINAL CORRECT REDIRECT LOGIC
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "HR") navigate("/hr-dashboard");
      else if (role === "Manager") navigate("/manager-dashboard");
      else if (role === "Employee") navigate("/employee-dashboard");
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="max-w-5xl w-full">

        {/* Title */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-white">
            Get Started with HRWorkSphere
          </h1>
          <p className="mt-4 text-gray-400">
            Select your role to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

  {/* ================= HR ================= */}
  <div className="relative group">
    <div className="absolute -inset-4 bg-blue-500 blur-3xl opacity-20 rounded-xl group-hover:opacity-40 transition"></div>

    <Link
      to="/hr-login"
      className="relative rounded-xl p-8
                 bg-gradient-to-br from-blue-100 to-blue-50
                 text-slate-800
                 shadow-lg hover:shadow-2xl
                 hover:-translate-y-2
                 transition-all duration-300 block"
    >
      <Users className="w-10 h-10 text-blue-600 mb-4" />
      <h3 className="text-xl font-semibold">HR</h3>
      <p className="mt-2 text-sm text-slate-600">
        Manage employees, payroll, and policies.
      </p>
    </Link>
  </div>

  {/* ================= MANAGER ================= */}
  <div className="relative group">
    <div className="absolute -inset-4 bg-green-500 blur-3xl opacity-20 rounded-xl group-hover:opacity-40 transition"></div>

    <Link
      to="/manager-login"
      className="relative rounded-xl p-8
                 bg-gradient-to-br from-green-100 to-green-50
                 text-slate-800
                 shadow-lg hover:shadow-2xl
                 hover:-translate-y-2
                 transition-all duration-300 block"
    >
      <UserCog className="w-10 h-10 text-green-600 mb-4" />
      <h3 className="text-xl font-semibold">Manager</h3>
      <p className="mt-2 text-sm text-slate-600">
        Manage teams, attendance, and approvals.
      </p>
    </Link>
  </div>

  {/* ================= EMPLOYEE ================= */}
  <div className="relative group">
    <div className="absolute -inset-4 bg-purple-500 blur-3xl opacity-20 rounded-xl group-hover:opacity-40 transition"></div>

    <Link
      to="/employee-login"
      className="relative rounded-xl p-8
                 bg-gradient-to-br from-purple-100 to-purple-50
                 text-slate-800
                 shadow-lg hover:shadow-2xl
                 hover:-translate-y-2
                 transition-all duration-300 block"
    >
      <User className="w-10 h-10 text-purple-600 mb-4" />
      <h3 className="text-xl font-semibold">Employee</h3>
      <p className="mt-2 text-sm text-slate-600">
        View tasks, attendance, and apply leaves.
      </p>
    </Link>
  </div>

        </div>

        {/* Register */}
        <div className="text-center mt-10">
          <Link to="/register">
            <button className="bg-white text-slate-900 px-6 py-2 rounded-md">
              Create Account
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
};

export default GetStarted;