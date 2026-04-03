import { useState, useEffect } from "react";

const ManagerSettings = () => {

  /* ================= LOAD DATA ================= */

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    notifications: true
  });

  useEffect(() => {

    const stored = localStorage.getItem("managerSettings");

    if (stored) {
      setForm(JSON.parse(stored));
    } else {
      const defaultData = {
        name: "Manager Name",
        email: "manager@example.com",
        password: "",
        notifications: true
      };

      setForm(defaultData);
      localStorage.setItem("managerSettings", JSON.stringify(defaultData));
    }

  }, []);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ================= SAVE ================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔥 BASIC VALIDATION
    if (!form.name || !form.email) {
      alert("Name and Email required");
      return;
    }

    if (form.password && form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // 🔥 DO NOT STORE PASSWORD DIRECTLY (simulation)
    const dataToSave = {
      ...form,
      password: "" // clear password after save
    };

    localStorage.setItem("managerSettings", JSON.stringify(dataToSave));

    setForm(dataToSave);

    alert("Settings updated successfully!");
  };

  /* ================= RESET ================= */

  const handleReset = () => {

    const stored = localStorage.getItem("managerSettings");

    if (stored) {
      setForm(JSON.parse(stored));
    }
  };

  /* ================= UI ================= */

  return (
    <div className="
      mt-6 max-w-xl 
      bg-white/10 backdrop-blur-xl 
      border border-white/20 
      p-6 rounded-2xl text-white
    ">

      <h2 className="text-2xl font-semibold mb-6">
        Manager Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* NAME */}
        <div>
          <label className="block text-white/70 mb-1 text-sm">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-white/70 mb-1 text-sm">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block text-white/70 mb-1 text-sm">
            New Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter new password"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white"
          />
          <p className="text-xs text-white/50 mt-1">
            Leave empty if you don’t want to change password
          </p>
        </div>

        {/* NOTIFICATIONS */}
        <div className="flex items-center justify-between">

          <label className="text-white/80 text-sm">
            Email Notifications
          </label>

          <button
            type="button"
            onClick={() =>
              setForm(prev => ({
                ...prev,
                notifications: !prev.notifications
              }))
            }
            className={`
              w-12 h-6 flex items-center rounded-full p-1 transition
              ${form.notifications ? "bg-white/30" : "bg-white/10"}
            `}
          >
            <div className={`
              w-4 h-4 bg-white rounded-full transition
              ${form.notifications ? "translate-x-6" : "translate-x-0"}
            `}></div>
          </button>

        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">

          <button
            type="submit"
            className="flex-1 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10"
          >
            Reset
          </button>

        </div>

      </form>

    </div>
  );
};

export default ManagerSettings;