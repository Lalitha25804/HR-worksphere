import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const EmployeeLogin = () => {
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

      // ✅ Verify user is Employee
      if (user.role !== "Employee") {
        setError(`Only Employees can login here. You are registered as ${user.role}.`);
        setLoading(false);
        return;
      }

      login({ token, role: user.role, name: user.name, email: user.email, id: user._id || user.id });
      navigate("/employee-dashboard");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full relative">

        <div className="absolute -inset-4 bg-green-500 blur-3xl opacity-25 rounded-xl"></div>

        <div className="relative bg-green-50 rounded-xl p-8 shadow-2xl">

          <div className="text-center mb-6">
            <User className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <h2 className="text-3xl font-bold text-slate-800">Employee Login</h2>
            <p className="text-sm text-slate-600 mt-2">
              Login to view your tasks and attendance
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@company.com"
                className="mt-1 w-full px-4 py-2 border rounded-md
                           focus:outline-none focus:ring-2
                           focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full px-4 py-2 border rounded-md
                           focus:outline-none focus:ring-2
                           focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-md
                         hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Back to{" "}
            <Link to="/get-started" className="text-green-600 hover:underline">
              Get Started
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
};

export default EmployeeLogin;