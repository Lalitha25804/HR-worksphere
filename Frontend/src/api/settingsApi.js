import API from "./axios";

// 🔥 Get Global Settings
export const getSettingsAPI = () =>
  API.get("/settings");

// 🔥 Save Global Settings (HR Only)
export const saveSettingsAPI = (settingsData) =>
  API.post("/settings", settingsData);
