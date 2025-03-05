import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import logo from "../assets/core-stack logo.png";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ setCurrentUser }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loginErr, setLoginErr] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/auth/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      // localStorage.setItem("token", data.access);
      console.log(data);
      sessionStorage.setItem("accessToken", data.access);
      sessionStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("currentUser", JSON.stringify(data)); // Store in local storage
      console.log(data.user);
      setCurrentUser(data);
      navigate("/activateBlock");
    } catch (err) {
      setLoginErr(err.message || "Login failed");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register"); // Redirect to registration page
  };

  return (
    <div className="min-h-screen bg-[#1e2532] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-[#1e2532] p-8">
        <div className="text-center">
          <img src={logo} alt="NRM Logo" className="mx-auto h-20 w-20" />
          <h2 className="mt-4 text-2xl font-bold text-white">NRM Dashboard</h2>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full rounded bg-[#2a3441] pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="User Name"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded bg-[#2a3441] pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in
          </button>
          {loginErr && (
            <p className="mt-4 text-sm text-red-400 text-center">{loginErr}</p>
          )}
          <div className="text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <span
                onClick={handleRegisterRedirect}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Register here
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
