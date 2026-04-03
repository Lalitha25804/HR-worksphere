import API from "./axios";

export const applyLeaveAPI = (data) =>
  API.post("/leave/apply", data);

export const getMyLeavesAPI = () =>
  API.get("/leave/me");

export const getAllLeavesAPI = () =>
  API.get("/leave");

export const updateLeaveStatusAPI = (id, status) =>
  API.put(`/leave/${id}`, { status });