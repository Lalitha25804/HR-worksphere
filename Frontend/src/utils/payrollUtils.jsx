import { calculatePayrollForEmployee } from "./hrLogic";

export const calculateEmployeeSummary = (emp, attendanceLogs, month) => {
  return calculatePayrollForEmployee(emp, attendanceLogs, month);
};