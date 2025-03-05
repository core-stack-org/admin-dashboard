import React, { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import logo from "../assets/core-stack logo.png";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);

  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    organization: "",
  });
  const passwordRequirements = [
    "At least 8 characters long",
    "At least 1 number",
    "At least 1 lowercase letter",
    "At least 1 uppercase letter",
    "At least 1 special character (^ $ * . [ ] { } ( ) ? - \" ! @ # % & / \\ , < > ' : ; | _ ~ ` + =)",
  ];

  const [errors, setErrors] = useState({});

  const loadOrganization = async () => {
    console.log("loading org");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/auth/register/available_organizations/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      console.log(data);
      return data.map((org) => ({
        value: org.id,
        label: org.name,
      }));
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : prevErrors[name],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.firstName = "First name is required";
    if (!formData.last_name) newErrors.lastName = "Last name is required";
    if (!formData.username) newErrors.userName = "User name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.contact_number) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Enter a valid 10-digit contact number";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = "Passwords do not match";
    }
    return newErrors;
  };
  const handleSubmit = async (e) => {
    console.log("hittingapi");
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number,
        organization: formData.organization,
      };
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/auth/register/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(registrationData),
          }
        );

        if (response.ok) {
          toast.success("User registered successfully!");
          setFormData({
            username: "",
            email: "",
            password: "",
            password_confirm: "",
            first_name: "",
            last_name: "",
            contact_number: "",
            organization: "",
          });
          setSelectedOption(null);
          setSelectedPermission([]);
          setErrors({});
        } else {
          const errorData = await response.json(); // Parse the JSON response
          console.log("API Error:", errorData); // Debug to see the error message structure
          const errorMessages = Object.values(errorData).flat().join(", ");
          toast.error(
            errorMessages || "Registration failed. Please try again."
          );
        }
      } catch (error) {
        console.error("Error during registration:", error);
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1e2532] flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <button
        className="absolute top-10 right-40 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        onClick={() => navigate("/login")}
      >
        Login from here
      </button>
      <div className="p-24">
        <img src={logo} alt="NRM Logo" className="mx-auto h-20 w-20" />
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          User Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              {/* <label className="block text-sm font-medium mb-1  text-white placeholder-gray-400 ">
                First Name
              </label> */}
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded bg-[#2a3441] pl-10 pr-3 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter First Name"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm">{errors.first_name}</p>
              )}
            </div>
            <div>
              {/* <label className="block text-sm font-medium mb-1 text-white placeholder-gray-400">
                Last Name
              </label> */}
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full rounded bg-[#2a3441] pl-10 pr-3 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Last Name"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            {/* <label className="block text-sm font-medium mb-1 text-white placeholder-gray-400">
              User Name
            </label> */}
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded bg-[#2a3441] pl-10 pr-3 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter User Name"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username}</p>
            )}
          </div>

          <div>
            {/* <label className="block text-sm font-medium mb-1 text-white placeholder-gray-400">
              Email
            </label> */}
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded bg-[#2a3441] pl-10 pr-3 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
              placeholder="Enter valid email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
            {/* <label className="block text-sm font-medium mb-1 text-white placeholder-gray-400">
              Contact Number
            </label> */}
            <input
              name="contact_number"
              value={formData.contact_number || ""} // Ensure it's never undefined
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers (remove non-numeric characters)
                if (/^\d{0,10}$/.test(value)) {
                  setFormData({ ...formData, contact_number: value });
                }
              }}
              className="w-full rounded bg-[#2a3441] pl-10 pr-3 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter 10-digit contact number"
            />
            {formData.contact_number?.length > 0 &&
              formData.contact_number.length !== 10 && (
                <p className="text-red-500 text-sm">
                  Incorrect number. Must be 10 digits.
                </p>
              )}
          </div>

          {/* Organization */}
          <div>
            {/* <label className="block text-sm font-medium mb-2 text-white placeholder-gray-400">
              Organization
            </label> */}
            <AsyncSelect
              loadOptions={loadOrganization}
              defaultOptions
              onChange={(selected) => {
                setSelectedOption(selected);
                setFormData({
                  ...formData,
                  organization: selected?.value, // Update organization in formData
                });
              }}
              placeholder="Select or search for an Organisation"
              classNamePrefix="react-select"
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: "lightblue",
                  primary: "blue",
                  neutral0: "#2a3441", // background color
                  neutral20: "#2a3441", // border color
                  neutral80: "white", // text color
                },
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Password Field */}
            <div>
              {/* <label className="block text-sm font-medium mb-1 text-white placeholder-gray-400">
                Password
              </label> */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="off"
                  onFocus={() => setShowPasswordRules(true)}
                  onBlur={() =>
                    setShowPasswordRules(formData.password.length > 0)
                  }
                  className="w-full rounded bg-[#2a3441] pl-10 pr-3 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}

              {/* Password Rules (Show on Focus) */}
              {showPasswordRules && (
                <div className="mt-2 p-2 bg-gray-100 border rounded-lg text-sm text-gray-700">
                  <p className="font-medium">Password must include:</p>
                  <ul className="list-disc ml-5">
                    {passwordRequirements.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              {/* <label className="block text-sm font-medium mb-1 text-white placeholder-gray-400">
                Confirm Password
              </label> */}
              <div className="relative">
                <input
                  name="password_confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="w-full rounded bg-[#2a3441] pl-10 pr-3 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-Enter password "
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.password_confirm && (
                <p className="text-red-500 text-sm">
                  {errors.password_confirm}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-4 py-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
