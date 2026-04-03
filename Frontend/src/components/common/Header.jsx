import { Link, NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          HR<span className="text-blue-400">WorkSphere</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-sm">
          <NavLink to="/" className="hover:text-blue-400">
            Home
          </NavLink>
          <NavLink to="/hr-login" className="hover:text-blue-400">
            HR
          </NavLink>
          <NavLink to="/manager-login" className="hover:text-blue-400">
            Manager
          </NavLink>
          <NavLink to="/employee-login" className="hover:text-blue-400">
            Employee
          </NavLink>
        </nav>

        {/* Login */}
        <Link
          to="/employee-login"
          className="px-4 py-2 bg-blue-600 rounded-md text-sm hover:bg-blue-700 transition"
        >
          Login
        </Link>

      </div>
    </header>
  );
};

export default Header;