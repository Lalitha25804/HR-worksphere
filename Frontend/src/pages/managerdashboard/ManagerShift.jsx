import { useState } from "react";

const days = ["Mon","Tue","Wed","Thu","Fri"];

const ManagerShift = () => {

  const [employees] = useState(
    JSON.parse(localStorage.getItem("team")) || []
  );

  return (
    <div className="text-white space-y-6 mt-6">

      <h2 className="text-2xl font-semibold">
        Team Shift Schedule
      </h2>

      <div className="bg-white/10 border border-white/20 rounded-xl overflow-auto">

        <table className="min-w-[900px] w-full text-sm">

          <thead className="bg-white/10">
            <tr>
              <th className="p-3">Emp ID</th>
              <th className="p-3">Name</th>

              {days.map(d => (
                <th key={d} className="p-3 text-center">{d}</th>
              ))}
            </tr>
          </thead>

          <tbody>

            {employees.map(emp => (

              <tr key={emp.empId} className="border-t border-white/10">

                <td className="p-3">{emp.empId}</td>
                <td className="p-3">{emp.name}</td>

                {days.map(d => (
                  <td key={d} className="text-center text-white/60">
                    -
                  </td>
                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ManagerShift;