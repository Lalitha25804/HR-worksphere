import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddManager = () => {
  const navigate = useNavigate();

  const [manager, setManager] = useState({
    name: "",
    email: "",
    password: "",
    department: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [addedManager, setAddedManager] = useState(null);

  const handleChange = (e) => {
    setManager({
      ...manager,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!manager.name || !manager.email || !manager.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      // Create user with Manager role via a custom endpoint
      const response = await axios.post(
        "http://localhost:5000/auth/create-manager",
        {
          name: manager.name,
          email: manager.email,
          password: manager.password,
          department: manager.department
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setSuccess(true);
      setAddedManager(response.data.user);
      setManager({
        name: "",
        email: "",
        password: "",
        department: ""
      });
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Failed to add manager"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
    min-h-screen
    flex items-center justify-center
    p-6
    bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800
    ">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
        w-full max-w-3xl
        p-8
        rounded-2xl
        bg-white/10
        backdrop-blur-xl
        border border-white/20
        shadow-2xl shadow-black/40
        text-white
        "
      >

        <div className="flex justify-center mb-6">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="
            w-24 h-24
            rounded-full
            bg-gradient-to-br from-purple-500 to-indigo-600
            flex items-center justify-center
            shadow-lg
            text-4xl
            "
          >
            👔
          </motion.div>
        </div>

        <h1 className="text-center text-2xl font-bold mb-8">
          Add New Manager
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-300/40 text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && addedManager && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-300/40 text-green-100"
          >
            <h3 className="font-semibold text-lg mb-3">✓ Manager Added Successfully!</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {addedManager.name}</p>
              <p><strong>Email:</strong> {addedManager.email}</p>
              <p><strong>Role:</strong> {addedManager.role}</p>
              <p><strong>Department:</strong> {manager.department || "N/A"}</p>
            </div>
            <p className="text-xs mt-3 p-2 bg-white/10 rounded">
              Manager can now login using their email and password
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigate("/hr-dashboard/credentials")}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
              >
                View All Credentials
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setAddedManager(null);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
              >
                Add Another
              </button>
            </div>
          </motion.div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`grid grid-cols-2 gap-4 ${success ? 'opacity-50 pointer-events-none' : ''}`}
        >

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={manager.name}
            onChange={handleChange}
            required
            className="
            p-3 rounded-lg
            bg-white/10 border border-white/20
            text-white placeholder-gray-300
            focus:outline-none
            focus:ring-2 focus:ring-indigo-500
            transition
            "
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={manager.email}
            onChange={handleChange}
            required
            className="
            p-3 rounded-lg
            bg-white/10 border border-white/20
            text-white placeholder-gray-300
            focus:outline-none
            focus:ring-2 focus:ring-indigo-500
            transition
            "
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={manager.password}
            onChange={handleChange}
            required
            className="
            p-3 rounded-lg
            bg-white/10 border border-white/20
            text-white placeholder-gray-300
            focus:outline-none
            focus:ring-2 focus:ring-indigo-500
            transition
            "
          />

          <select
            name="department"
            value={manager.department}
            onChange={handleChange}
            className="
            p-3 rounded-lg
            bg-white/10 border border-white/20
            text-white
            focus:outline-none
            focus:ring-2 focus:ring-indigo-500
            "
          >
            <option value="" className="text-black">Select Department</option>
            <option className="text-black">HR</option>
            <option className="text-black">Engineering</option>
            <option className="text-black">Marketing</option>
            <option className="text-black">Finance</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="
            col-span-2
            p-3 rounded-lg
            bg-gradient-to-r from-purple-600 to-indigo-600
            text-white font-semibold
            hover:from-purple-700 hover:to-indigo-700
            transition
            disabled:opacity-50
            "
          >
            {loading ? "Adding Manager..." : "Add Manager"}
          </button>

        </form>

      </motion.div>

    </div>
  );
};

export default AddManager;
