import API from "./axios";

export const addEmployeeAPI = (employeeData) =>
  API.post("/employees", employeeData);

export const bulkAddEmployeesAPI = (data) =>
  API.post("/employees/bulk", data);

export const getEmployeesAPI = (params) =>
  API.get("/employees", { params });

export const getEmployeeByIdAPI = (id) =>
  API.get(`/employees/${id}`);

export const updateEmployeeAPI = (id, employeeData) =>
  API.put(`/employees/${id}`, employeeData);

export const deleteEmployeeAPI = (id) =>
  API.delete(`/employees/${id}`);

// 🔥 Create login credentials for Employee
export const createEmployeeUserAPI = (userData) =>
  API.post("/auth/create-employee-user", userData);

// 🔥 Create login credentials for Manager
export const createManagerUserAPI = (userData) =>
  API.post("/auth/create-manager-user", userData);

