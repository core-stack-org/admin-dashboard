import React, { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddMember = ({
  closeModal,
  currentUser,
  onClose,
  isSuperAdmin,
  onUserCreated,
}) => {
  console.log(currentUser.user.organization_name);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [organizations, setOrganizations] = useState([]); // Store fetched organizations

  const [showPasswordRules, setShowPasswordRules] = useState(false);
  useEffect(() => {
    if (currentUser?.user?.organization) {
      setFormData((prev) => ({
        ...prev,
        organization: currentUser.user.organization, // Store ID only
      }));
    }
  }, [currentUser]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    organization: currentUser?.user?.organization || "",
  });

  useEffect(() => {
    if (isSuperAdmin) {
      loadOrganization();
    }
  }, [isSuperAdmin]);

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
      if (Array.isArray(data)) {
        setOrganizations(data);
      } else {
        console.error("Unexpected API response format:", data);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  };

  const passwordRequirements = [
    "At least 8 characters long",
    "At least 1 number",
    "At least 1 lowercase letter",
    "At least 1 uppercase letter",
    "At least 1 special character (^ $ * . [ ] { } ( ) ? - \" ! @ # % & / \\ , < > ' : ; | _ ~ ` + =)",
  ];

  const [errors, setErrors] = useState({});

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
          `${process.env.REACT_APP_BASEURL}api/v1/auth/register/`,
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
          onUserCreated();

          setTimeout(() => {
            toast.dismiss(); // Dismiss all toasts before navigating
            navigate("/dashboard");
          }, 5000);
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
        // toast.error("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Register User to an Organization{" "}
          </h2>
          <button
            onClick={() => {
              if (closeModal) closeModal();
              if (onClose) onClose();
            }}
            className="text-white hover:bg-green-700 rounded-full p-2 focus:outline-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className=" mb-4">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 pl-4 pr-3 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter First Name"
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-sm">
                          {errors.first_name}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 pl-4 pr-3 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter Last Name"
                      />
                      {errors.last_name && (
                        <p className="text-red-500 text-sm">
                          {errors.last_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full rounded border border-gray-300 pl-4 pr-3 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter User Name"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded border border-gray-300 pl-4 pr-3 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="off"
                      placeholder="Enter valid email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div>
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
                      className="w-full rounded border border-gray-300 pl-4 pr-3 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {/* Organization Selection */}
                  <div>
                    {currentUser?.user?.is_superadmin ? (
                      // Show dropdown for super admin
                      <select
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 pl-4 pr-3 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Organization</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Show prefilled and read-only organization name for org admin
                      <input
                        name="organization"
                        value={currentUser?.user?.organization_name || ""}
                        className="w-full rounded pl-10 pr-3 py-4 bg-gray-200 text-gray-700 focus:outline-none"
                        readOnly
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Password Field */}
                    <div>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="off"
                          onFocus={() => setShowPasswordRules(true)}
                          onBlur={() => setShowPasswordRules(false)} // ✅ Hide rules when moving to another field
                          className="w-full rounded border border-gray-300 pl-4 pr-3 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm">
                          {errors.password}
                        </p>
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
                      <div className="relative">
                        <input
                          name="password_confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.password_confirm}
                          onChange={handleChange}
                          className="w-full rounded border border-gray-300 pl-4 pr-3 py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Re-Enter password "
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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
                      className="px-4 py-4 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMember;
