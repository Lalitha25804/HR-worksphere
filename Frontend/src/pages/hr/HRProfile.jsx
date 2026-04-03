import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getMeAPI, updateProfileAPI } from "../../api/authApi";

const HRProfile = () => {

  const [isEdit, setIsEdit] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "Human Resources",
    role: "HR"
  });

  /* LOAD FROM STORAGE */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMeAPI();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          department: "Human Resources",
          role: "HR"
        });
      } catch (err) {
        console.error("Failed to fetch pure HR Profile:", err);
      }
    };
    fetchProfile();
  }, []);

  /* SAVE */

  const handleSave = async () => {
    try {
      await updateProfileAPI({ name: profile.name, phone: profile.phone, address: profile.address });
      setIsEdit(false);
      
      // Keep navbar visual cache perfectly synced globally for UI continuity
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
         user.name = profile.name;
         localStorage.setItem("user", JSON.stringify(user));
         window.dispatchEvent(new Event("auth-update"));
      }
    } catch (err) {
      console.error("Update failed:", err.response?.data?.error || err.message);
      alert("Error: " + (err.response?.data?.error || "Update failed"));
    }
  };

  /* INPUT CHANGE */

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="p-6 text-white space-y-6">

      <h2 className="text-2xl font-bold">
        HR Profile
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 max-w-xl"
      >

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">

          <img
            src="https://i.pravatar.cc/80"
            className="w-16 h-16 rounded-full border border-white/20"
          />

          <div>
            <p className="text-lg font-semibold">
              {profile.name}
            </p>
            <p className="text-gray-400 text-sm">
              {profile.role}
            </p>
          </div>

        </div>

        {/* FORM */}

        <div className="space-y-4">

          {["name","email","department","role"].map(field => (

            <div key={field}>
              <label className="text-sm text-gray-400 capitalize">
                {field}
              </label>

              <input
                name={field}
                value={profile[field]}
                onChange={handleChange}
                disabled={!isEdit || field === "email" || field === "department" || field === "role"}
                className={`w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded ${(!isEdit || field === "email" || field === "department" || field === "role") ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500 text-white'}`}
              />
            </div>

          ))}

        </div>

        {/* ACTIONS */}

        <div className="flex gap-4 mt-6">

          {!isEdit ? (

            <button
              onClick={() => setIsEdit(true)}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Edit Profile
            </button>

          ) : (

            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                Save
              </button>

              <button
                onClick={() => setIsEdit(false)}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </>

          )}

        </div>

      </motion.div>

    </div>
  );
};

export default HRProfile;