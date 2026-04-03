import { useParams } from "react-router-dom";

const TeamMemberProfile = () => {

  const { id } = useParams();

  const members = JSON.parse(localStorage.getItem("teamMembers")) || [];
  const employee = members.find(m => m.id === Number(id));

  if (!employee) return <p className="text-white p-6">Not Found</p>;

  return (
    <div className="p-6 text-white">

      <div className="bg-white/10 border border-white/20 p-6 rounded-2xl max-w-2xl">

        <h2 className="text-xl font-semibold mb-4">{employee.name}</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">

          <Detail label="Role" value={employee.role} />
          <Detail label="Department" value={employee.department} />
          <Detail label="Email" value={employee.email} />
          <Detail label="Phone" value={employee.phone} />
          <Detail label="Experience" value={employee.experience} />
          <Detail label="Status" value={employee.status} />

        </div>

      </div>

    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="bg-white/5 border border-white/10 p-3 rounded">
    <p className="text-white/50 text-xs">{label}</p>
    <p>{value}</p>
  </div>
);

export default TeamMemberProfile;