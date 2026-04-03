const defaultConfig = {
  companySettings: {
    companyName: "ABC Pvt Ltd",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    workStartTime: "09:00",
    workEndTime: "18:00",
    timezone: "Asia/Kolkata"
  },
  shiftSettings: {
    shifts: [
      { name: "Morning", start: "09:00", end: "13:00", allowance: 0 },
      { name: "General", start: "13:00", end: "20:00", allowance: 100 },
      { name: "Afternoon", start: "20:00", end: "22:00", allowance: 150 },
      { name: "Night", start: "22:00", end: "06:00", overnight: true, allowance: 400 }
    ],
    lateThreshold: "09:00",
    earlyThreshold: "06:00"
  },
  payrollSettings: {
    overtimeRate: 200,
    nightAllowance: 400,
    afternoonAllowance: 200,
    morningAllowance: 0,
    pfPercent: 12,
    taxPercent: 10,
    hraPercent: 20,
    salaryCycle: "monthly",
    bonusType: "fixed"
  },
  attendanceRules: {
    lateAfterMinutes: 15,
    halfDayHours: 4,
    fullDayHours: 8,
    overtimeAfterHours: 8,
    minHours: 8,
    maxHours: 12
  }
};

export const getHrSettings = () => {
  const stored = localStorage.getItem("hrSettings");
  if (!stored) return defaultConfig;

  try {
    const parsed = JSON.parse(stored);
    return {
      ...defaultConfig,
      ...parsed,
      companySettings: { ...defaultConfig.companySettings, ...parsed.companySettings },
      shiftSettings: { ...defaultConfig.shiftSettings, ...parsed.shiftSettings },
      payrollSettings: { ...defaultConfig.payrollSettings, ...parsed.payrollSettings },
      attendanceRules: { ...defaultConfig.attendanceRules, ...parsed.attendanceRules }
    };
  } catch {
    return defaultConfig;
  }
};

export const parseTimeToDecimal = (time) => {
  if (!time) return null;

  if (typeof time === "number") {
    return time;
  }

  if (typeof time === "string") {
    if (time.includes("T")) {
      const date = new Date(time);
      if (!isNaN(date)) {
        return date.getHours() + date.getMinutes() / 60;
      }
    }

    const [hh, mm] = time.split(":");
    const h = Number(hh);
    const m = Number(mm || "0");

    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      return h + m / 60;
    }

    const numeric = Number(time);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return null;
};

export const getShiftTypeFromTime = (checkIn) => {
  const settings = getHrSettings();
  const decimal = parseTimeToDecimal(checkIn);
  if (decimal === null || Number.isNaN(decimal)) return "Missing";

  const shifts = settings.shiftSettings.shifts || [];

  for (const shift of shifts) {
    const start = parseTimeToDecimal(shift.start);
    const end = parseTimeToDecimal(shift.end);

    if (shift.overnight) {
      if (decimal >= start || decimal < end) return shift.name;
    } else {
      if (decimal >= start && decimal < end) return shift.name;
    }
  }

  return "General";
};

export const getWorkHours = (checkIn, checkOut) => {
  const settings = getHrSettings();
  const attendanceRules = settings.attendanceRules || {};

  const inDecimal = parseTimeToDecimal(checkIn);
  const outDecimal = parseTimeToDecimal(checkOut);

  if (inDecimal === null || outDecimal === null) return 0;

  let out = outDecimal;
  let inT = inDecimal;

  if (out < inT) out += 24;

  const hours = out - inT;
  if (hours <= 0 || hours > (attendanceRules.maxHours || 16)) return 0;

  return Number(hours.toFixed(2));
};

export const getOvertimeHours = (checkIn, checkOut) => {
  const activity = getWorkHours(checkIn, checkOut);
  const rules = getHrSettings().attendanceRules || {};
  const overtimeAfter = rules.overtimeAfterHours || 8;

  if (activity <= overtimeAfter) return 0;
  return Number((activity - overtimeAfter).toFixed(2));
};

export const getAttendanceStatus = (checkIn, checkOut) => {
  const settings = getHrSettings();
  const attendanceRules = settings.attendanceRules || {};

  if (!checkIn || !checkOut) return "Absent";

  const hours = getWorkHours(checkIn, checkOut);
  if (hours === 0) return "Absent";

  const checkInDecimal = parseTimeToDecimal(checkIn);
  const workStart = parseTimeToDecimal(settings.companySettings.workStartTime);
  const lateAfter = (attendanceRules.lateAfterMinutes || 15) / 60;

  if (checkInDecimal - workStart > lateAfter) {
    return "Late";
  }

  if (hours < (attendanceRules.fullDayHours || 8)) {
    if (hours >= (attendanceRules.halfDayHours || 4)) return "Half Day";
    return "Partial";
  }

  return "Present";
};

export const getShiftAllowance = (shift, hours) => {
  const settings = getHrSettings();
  const payrollSettings = settings.payrollSettings || {};
  const shiftSetting = settings.shiftSettings.shifts?.find((s) => s.name === shift);

  if (shiftSetting && typeof shiftSetting.allowance === "number") {
    if (hours >= 6) return shiftSetting.allowance;
    return Number(((shiftSetting.allowance / 6) * hours).toFixed(2));
  }

  if (shift === "Night") {
    const rate = payrollSettings.nightAllowance || 400;
    return hours >= 6 ? rate : Number((rate * (hours / 6)).toFixed(2));
  }

  if (shift === "Afternoon") {
    const rate = payrollSettings.afternoonAllowance || 200;
    return hours >= 6 ? rate : Number((rate * (hours / 6)).toFixed(2));
  }

  if (shift === "Morning") {
    return payrollSettings.morningAllowance || 0;
  }

  return 0;
};

export const calculatePayrollForEmployee = (emp, attendanceLogs, month) => {
  const settings = getHrSettings();
  const payrollSettings = settings.payrollSettings || {};

  const logs = attendanceLogs.filter((l) =>
    l.empId === emp.empId && l.date.startsWith(month)
  );

  let present = 0;
  let leave = 0;
  let ot = 0;
  let allowance = 0;

  logs.forEach((log) => {
    const status = getAttendanceStatus(log.checkin, log.checkout);

    if (status === "Absent" || status === "Partial") {
      leave += 1;
      return;
    }

    present++;

    const hours = getWorkHours(log.checkin, log.checkout);
    ot += getOvertimeHours(log.checkin, log.checkout);

    const shift = getShiftTypeFromTime(log.checkin);
    allowance += getShiftAllowance(shift, hours);
  });

  const otPay = Number((ot * (payrollSettings.overtimeRate || 200)).toFixed(2));

  const pf = Number(((emp.salary * (payrollSettings.pfPercent || 12)) / 100).toFixed(2));
  const tax = Number(((emp.salary * (payrollSettings.taxPercent || 10)) / 100).toFixed(2));
  const hra = Number(((emp.salary * (payrollSettings.hraPercent || 20)) / 100).toFixed(2));

  const payroll = Math.round(emp.salary - pf - tax - hra + allowance + otPay);

  return {
    present,
    leave,
    ot: Math.round(ot),
    allowance: Math.round(allowance),
    otPay: Math.round(otPay),
    payroll: Math.round(payroll)
  };
};
