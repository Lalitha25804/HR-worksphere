import API from "./axios";

export const checkInAPI = () => API.post("/attendance/checkin");
export const checkOutAPI = () => API.post("/attendance/checkout");

export const getMyAttendanceAPI = () =>
  API.get("/attendance/me");

export const getAllAttendanceAPI = () =>
  API.get("/attendance");