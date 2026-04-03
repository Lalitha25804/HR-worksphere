import { useState, useEffect } from "react";
import { getSettingsAPI, saveSettingsAPI } from "../../api/settingsApi";

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
      { name: "Morning", start: "09:00", end: "18:00", allowance: 0 },
      { name: "Evening", start: "14:00", end: "23:00", allowance: 150 },
      { name: "Night", start: "22:00", end: "06:00", allowance: 400 }
    ]
  },
  payrollSettings: {
    pfPercent: 12,
    taxPercent: 10,
    hraPercent: 20,
    salaryCycle: "monthly",
    bonusType: "fixed"
  },
  leavePolicy: {
    paidLeavesPerMonth: 2,
    maxConsecutiveLeaves: 5,
    leaveTypes: ["Sick", "Casual", "Paid"],
    leaveApprovalRequired: true,
    leaveDeductionPerDay: true
  },
  attendanceRules: {
    lateAfterMinutes: 15,
    halfDayHours: 4,
    fullDayHours: 8,
    overtimeAfterHours: 8
  }
};

const menu = [
  { id: "company", label: "COMPANY SETTINGS" },
  { id: "shift", label: "SHIFT SETTINGS" },
  { id: "payroll", label: "PAYROLL SETTINGS" },
  { id: "leave", label: "LEAVE POLICY" },
  { id: "attendance", label: "ATTENDANCE RULES" }
];

const Settings = () => {
  const [active, setActive] = useState("company");
  const [config, setConfig] = useState(defaultConfig);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSettingsAPI();
      if (res.data) {
        // Merge defaults to prevent crashes if a field is missing
        setConfig({
          companySettings: { ...defaultConfig.companySettings, ...res.data.companySettings },
          shiftSettings: { ...defaultConfig.shiftSettings, ...res.data.shiftSettings },
          payrollSettings: { ...defaultConfig.payrollSettings, ...res.data.payrollSettings },
          leavePolicy: { ...defaultConfig.leavePolicy, ...res.data.leavePolicy },
          attendanceRules: { ...defaultConfig.attendanceRules, ...res.data.attendanceRules }
        });
      }
    } catch (err) {
      console.error("Failed to load global settings", err);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setMessage("");
    try {
      await saveSettingsAPI(config);
      setMessage("Global Settings saved successfully.");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setMessage("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (section, key, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateJSON = (section, text) => {
    try {
      const parsed = JSON.parse(text);
      setConfig((prev) => ({ ...prev, [section]: parsed }));
      setMessage("JSON parsed successfully.");
    } catch (err) {
      setMessage("Invalid JSON format.");
    }
  };

  return (
    <div className="flex gap-6 text-white">
      <div className="w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
        <h3 className="font-semibold mb-4 text-gray-200">HR Settings</h3>
        <div className="space-y-2">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                active === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-gray-100">{menu.find((m) => m.id === active)?.label}</h2>
          {message && <span className="text-sm text-green-300">{message}</span>}
        </div>

        {active === "company" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              🎯 Purpose: Defines global company behavior
            </p>
            <label className="block text-sm">
              Company Name
              <input
                value={config.companySettings.companyName}
                onChange={(e) => updateField("companySettings", "companyName", e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
              />
            </label>
            <label className="block text-sm">
              Working Days (CSV)
              <input
                value={config.companySettings.workingDays.join(",")}
                onChange={(e) => updateField("companySettings", "workingDays", e.target.value.split(",").map((d) => d.trim()))}
                className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                Start Time
                <input
                  type="time"
                  value={config.companySettings.workStartTime}
                  onChange={(e) => updateField("companySettings", "workStartTime", e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                End Time
                <input
                  type="time"
                  value={config.companySettings.workEndTime}
                  onChange={(e) => updateField("companySettings", "workEndTime", e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
            </div>
            <label className="block text-sm">
              Timezone
              <input
                value={config.companySettings.timezone}
                onChange={(e) => updateField("companySettings", "timezone", e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
              />
            </label>

            <pre className="bg-slate-900 p-3 rounded text-xs overflow-auto">{JSON.stringify(config.companySettings, null, 2)}</pre>

            <p className="text-xs text-gray-400">
              Usage: Attendance late check, payroll working days calculation
            </p>
          </div>
        )}

        {active === "shift" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">🎯 Purpose: Controls shift detection + allowance</p>
            <textarea
              value={JSON.stringify(config.shiftSettings, null, 2)}
              onChange={(e) => updateJSON("shiftSettings", e.target.value)}
              className="w-full h-52 bg-slate-900 border border-white/10 p-3 rounded font-mono text-xs"
            />
            <p className="text-sm text-gray-300">🧠 Example: check-in=22:15 → Night shift → ₹400 added</p>
          </div>
        )}

        {active === "payroll" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">🎯 Purpose: Defines salary calculation rules</p>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                PF %
                <input
                  type="number"
                  value={config.payrollSettings.pfPercent}
                  onChange={(e) => updateField("payrollSettings", "pfPercent", Number(e.target.value))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                Tax %
                <input
                  type="number"
                  value={config.payrollSettings.taxPercent}
                  onChange={(e) => updateField("payrollSettings", "taxPercent", Number(e.target.value))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                HRA %
                <input
                  type="number"
                  value={config.payrollSettings.hraPercent}
                  onChange={(e) => updateField("payrollSettings", "hraPercent", Number(e.target.value))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                Cycle
                <input
                  value={config.payrollSettings.salaryCycle}
                  onChange={(e) => updateField("payrollSettings", "salaryCycle", e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm col-span-2">
                Bonus Type
                <input
                  value={config.payrollSettings.bonusType}
                  onChange={(e) => updateField("payrollSettings", "bonusType", e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
            </div>
            <pre className="bg-slate-900 p-3 rounded text-xs overflow-auto">{JSON.stringify(config.payrollSettings, null, 2)}</pre>
          </div>
        )}

        {active === "leave" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">🎯 Purpose: Controls leave rules + salary deduction</p>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                Paid Leaves / Month
                <input
                  type="number"
                  value={config.leavePolicy.paidLeavesPerMonth}
                  onChange={(e) => updateField("leavePolicy", "paidLeavesPerMonth", Number(e.target.value))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                Max Consecutive Leaves
                <input
                  type="number"
                  value={config.leavePolicy.maxConsecutiveLeaves}
                  onChange={(e) => updateField("leavePolicy", "maxConsecutiveLeaves", Number(e.target.value))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                Leave Types (csv)
                <input
                  value={config.leavePolicy.leaveTypes.join(",")}
                  onChange={(e) => updateField("leavePolicy", "leaveTypes", e.target.value.split(",").map((x) => x.trim()))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                Deduct Per Day?
                <select
                  value={config.leavePolicy.leaveDeductionPerDay ? "true" : "false"}
                  onChange={(e) => updateField("leavePolicy", "leaveDeductionPerDay", e.target.value === "true")}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </label>
              <label className="block text-sm">
                Approval Required?
                <select
                  value={config.leavePolicy.leaveApprovalRequired ? "true" : "false"}
                  onChange={(e) => updateField("leavePolicy", "leaveApprovalRequired", e.target.value === "true")}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </label>
            </div>
            <pre className="bg-slate-900 p-3 rounded text-xs overflow-auto">{JSON.stringify(config.leavePolicy, null, 2)}</pre>
          </div>
        )}

        {active === "attendance" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">🎯 Purpose: Defines status calculation</p>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                Late after (min)
                <input
                  type="number"
                  value={config.attendanceRules.lateAfterMinutes}
                  onChange={(e) => updateField("attendanceRules", "lateAfterMinutes", Number(e.target.value))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                Half day hours
                <input
                  type="number"
                  value={config.attendanceRules.halfDayHours}
                  onChange={(e) => updateField("attendanceRules", "halfDayHours", Number(e.target.value))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                Full day hours
                <input
                  type="number"
                  value={config.attendanceRules.fullDayHours}
                  onChange={(e) => updateField("attendanceRules", "fullDayHours", Number(e.target.value))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
              <label className="block text-sm">
                Overtime after
                <input
                  type="number"
                  value={config.attendanceRules.overtimeAfterHours}
                  onChange={(e) => updateField("attendanceRules", "overtimeAfterHours", Number(e.target.value))}
                  className="mt-1 w-full bg-slate-900 border border-white/10 px-3 py-2 rounded"
                />
              </label>
            </div>
            <pre className="bg-slate-900 p-3 rounded text-xs overflow-auto">{JSON.stringify(config.attendanceRules, null, 2)}</pre>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <button
            onClick={saveConfig}
            disabled={loading}
            className={`px-6 py-2 rounded transition font-medium ${loading ? 'bg-indigo-400 cursor-not-allowed text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
