import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../assets/core-stack logo.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const LoginPage = ({ setCurrentUser }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loginErr, setLoginErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        `${process.env.REACT_APP_BASEURL}api/v1/auth/login/`,
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
      sessionStorage.setItem("accessToken", data.access);
      sessionStorage.setItem("refreshToken", data.refresh);
      setCurrentUser(data);
      toast.success("Login successful!");

      setTimeout(() => {
        toast.dismiss(); // Dismiss all toasts before navigating
        navigate("/dashboard");
      }, 1000);
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} closeOnClick />
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <img src={logo} alt="NRM Logo" className="mx-auto h-20 w-20" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            CoRE Stack Dashboard
          </h2>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 bg-white pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="User Name"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 bg-white pl-10 pr-10 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                />
                {/* Eye Icon for Toggling Password */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
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
            <p className="mt-4 text-sm text-red-500 text-center">{loginErr}</p>
          )}
          <div className="text-center">
            <p className="text-gray-600">
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
