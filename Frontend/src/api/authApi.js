import API from "./axios";

// 🔥 Fetch Currently Authenticated User Profile (Resolves dynamically to HR or Employee)
export const getMeAPI = () => API.get("/auth/me");

// 🔥 Securely Sync updated generic Profile Attributes back to the Main Database Identity
export const updateProfileAPI = (data) => API.put("/auth/update-profile", data);
