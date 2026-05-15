import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match before calling the API
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    try {
      // Create the payload matching the backend expectations (no userID)
      const payload = {
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        type: "user", // Default role
      };

      // Send registration request
      const response = await axiosInstance.post("/api/auth/register", payload);

      // Auto-login with the returned user data and token
      login(response.data);

      // Redirect to homepage
      navigate("/");
    } catch (error) {
      console.error("Registration Error:", error);
      const message =
        error.response?.data?.description ||
        error.response?.statusText ||
        error.message ||
        "Registration failed. Please try again.";
      alert(message);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans flex flex-col justify-center relative overflow-hidden bg-[#0a0a0a] py-12">
      {/* Background with Blur effect */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-80 blur-[2px] scale-110 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1587731556938-38755b4803a6?auto=format&fit=crop&w=2000&q=80')`,
        }}
      ></div>

      <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none fixed"></div>

      <div className="w-full max-w-md mx-auto px-8 flex flex-col justify-center relative z-10">
        {/* Registration Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col items-center">
          <img
            src="https://img.icons8.com/fluency/240/headphones.png"
            alt="Headphones Icon"
            className="w-20 h-20 object-contain mb-4 drop-shadow-[0_10px_10px_rgba(249,115,22,0.3)]"
          />

          <h1 className="text-3xl md:text-4xl font-black tracking-widest text-center mb-8 text-white uppercase drop-shadow-sm">
            Sign Up
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-full"
          >
            {/* Nickname Field */}
            <div className="flex flex-col">
              <div className="flex items-center bg-black/40 rounded-xl p-4 border border-white/10 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-300 group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-400 group-focus-within:text-orange-500 transition-colors flex-shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Nickname (e.g., Felix)"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="bg-transparent border-none outline-none text-white ml-4 w-full placeholder-gray-400"
                  required
                />
              </div>
              <p className="text-xs text-neutral-400 mt-2 ml-2 italic">
                Note: Once set, your nickname cannot be changed.
              </p>
            </div>

            {/* Email Field */}
            <div className="flex items-center bg-black/40 rounded-xl p-4 border border-white/10 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-300 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-gray-400 group-focus-within:text-orange-500 transition-colors flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-transparent border-none outline-none text-white ml-4 w-full placeholder-gray-400"
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex items-center bg-black/40 rounded-xl p-4 border border-white/10 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-300 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-gray-400 group-focus-within:text-orange-500 transition-colors flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-transparent border-none outline-none text-white ml-4 w-full placeholder-gray-400"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="flex items-center bg-black/40 rounded-xl p-4 border border-white/10 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all duration-300 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-gray-400 group-focus-within:text-orange-500 transition-colors flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="bg-transparent border-none outline-none text-white ml-4 w-full placeholder-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl mt-4 transition-all duration-300 active:scale-[0.98] text-lg shadow-lg shadow-orange-500/25 border border-orange-500/50"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-white font-semibold hover:text-orange-500 transition-colors underline decoration-gray-600 underline-offset-4 hover:decoration-orange-500"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
