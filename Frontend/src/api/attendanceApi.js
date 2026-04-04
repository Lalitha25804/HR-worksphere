import API from "./axios";

export const checkInAPI = (data = {}) => API.post("/attendance/checkin", data);
export const checkOutAPI = (data = {}) => API.post("/attendance/checkout", data);

export const getMyAttendanceAPI = (params = {}) =>
  API.get("/attendance/me", { params });

export const getAllAttendanceAPI = () =>
  API.get("/attendance");