import React, { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import AsyncSelect from "react-select/async";

const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);

  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    console.log("Fetching organizations...");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/org/get_org`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      console.log("Data received:", data);
      return data.map((org) => ({
        value: org.id,
        label: org.name,
      }));
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  };

  const loadPermission = async (inputValue) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/user/permissions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      const planPermissions = data.plan || [];
      return planPermissions.map((permission) => ({
        value: permission.id,
        label: permission.name,
      }));
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return [];
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.userName) newErrors.userName = "User name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      const registrationData = {
        username: formData.userName,
        email: formData.email,
        password: formData.password,
        organization: selectedOption.value,
        entity_permission: selectedPermission ? selectedPermission.value : null,
      };
      console.log(registrationData);
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/user/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(registrationData),
          }
        );

        if (response.ok) {
          console.log("Registration successful");
          // Reset form
          setFormData({
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          setSelectedOption(null);
          setSelectedPermission([]);
          setErrors({});
        } else {
          console.error("Registration failed");
          // Handle server-side validation errors here
        }
      } catch (error) {
        console.error("Error during registration:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md mt-32">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          User Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-8">
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium mb-1"
              >
                User Name
              </label>
              <input
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                autoComplete="off"
                className={`w-full p-2 border rounded-lg ${
                  errors.userName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setShowPasswordRules(true)}
                  onBlur={() => setShowPasswordRules(false)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`w-full p-2 border rounded-lg ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
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

            {/* Confirm Password */}
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  type={showConfirmPassword ? "text" : "password"}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <label
              htmlFor="organisation"
              className="block text-sm font-medium mb-2"
            >
              Organisation
            </label>
            <AsyncSelect
              loadOptions={loadOrganization}
              defaultOptions
              onChange={(selected) => setSelectedOption(selected)}
              placeholder="Select or search for an Organisation"
              classNamePrefix="react-select"
            />

            <div>
              <label
                htmlFor="planPermission"
                className="block text-sm font-medium mb-8"
              >
                Permissions
              </label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadPermission}
                defaultOptions
                onChange={(selected) => setSelectedPermission(selected)}
                placeholder="Select or search for a permission"
                classNamePrefix="react-select"
              />
            </div>
          </div>{" "}
        </form>

        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
