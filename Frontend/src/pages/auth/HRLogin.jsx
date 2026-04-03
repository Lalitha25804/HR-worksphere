import { Link, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const HRLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password
      });

      const { token, user } = res.data;

      login({ token, role: user.role, name: user.name, email: user.email });

      if (user.role === "HR") navigate("/hr-dashboard");
      else if (user.role === "Manager") navigate("/manager-dashboard");
      else navigate("/employee-dashboard");

    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full relative">
        <div className="absolute -inset-4 bg-blue-500 blur-3xl opacity-25 rounded-xl"></div>

        <div className="relative bg-blue-50 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <Users className="w-10 h-10 text-blue-600 mx-auto mb-2" />
            <h2 className="text-3xl font-bold text-slate-800">HR Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded"/>
            <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border rounded"/>
            <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
          </form>

          <p className="text-center mt-4">
            <Link to="/get-started">Back</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default HRLogin;