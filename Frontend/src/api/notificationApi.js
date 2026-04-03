import API from "./axios";

export const getMyNotificationsAPI = () =>
  API.get("/notifications");

export const markNotificationsReadAPI = () =>
  API.put("/notifications/read");
