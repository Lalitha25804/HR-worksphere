import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "HR"  // ✅ Fixed to HR only
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/auth/register", form);

      setForm({ name: "", email: "", password: "", role: "HR" });
      alert("HR registered successfully");

      navigate("/hr-login");

    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 px-6">

      <div className="bg-white p-8 rounded-xl w-full max-w-md">

        <h2 className="text-2xl font-bold mb-2 text-center">
          HR Registration
        </h2>
        
        <p className="text-sm text-center text-gray-600 mb-6">
          Only HR can register. Managers and Employees are added by HR.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          {/* ✅ Role is fixed to HR - no dropdown */}
          <div className="p-2 bg-gray-100 border rounded rounded text-sm">
            <strong>Role:</strong> HR (only HR can register)
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register as HR"}
          </button>

        </form>

        <p className="text-sm mt-4 text-center">
          Already have account?{" "}
          <Link to="/hr-login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>

      </div>

    </main>
  );
};

export default Register;
