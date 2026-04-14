import API from "./axios";

// 🔥 Get Calculated Payroll for an Employee in a specific month
export const getPayrollAPI = (employeeId, month, year) =>
  API.get(`/payroll/${employeeId}?month=${month}&year=${year}&t=${Date.now()}`);

export const getMyPayrollAPI = (month, year) =>
  API.get(`/payroll/me?month=${month}&year=${year}&t=${Date.now()}`);

// 🔥 Process and save payroll for selected employees
export const processPayrollAPI = (payrolls) =>
  API.post(`/payroll/process`, { payrolls });
