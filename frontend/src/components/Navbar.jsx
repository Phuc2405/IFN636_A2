import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-[#0a0a0a] text-white p-4 flex justify-between items-center gap-4 border-b border-gray-800 sticky top-0 z-50">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-3 group"
      >
        <span className="text-xl font-bold hidden sm:block tracking-wide group-hover:text-orange-500 transition-colors">
          Felix Music
        </span>
      </Link>

      {/* User Authentication */}
      <div className="flex items-center gap-3">
        {token ? (
          <>
            {user?.type === "admin" && (
              <Link
                to="/admin"
                className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all active:scale-95"
              >
                Admin Panel
              </Link>
            )}
            {user && (
              <Link
                to="/reviews"
                className="bg-green-500/10 text-green-400 border border-green-500/20 px-6 py-2.5 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all active:scale-95"
              >
                My Reviews
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-2.5 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-center shadow-[0_0_15px_rgba(249,115,22,0.15)]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#333] hover:bg-[#444] text-white px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-center hidden sm:block"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
