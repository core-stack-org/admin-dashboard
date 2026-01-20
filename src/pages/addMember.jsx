import React, { useState, useEffect } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const AddMember = ({
  closeModal,
  currentUser,
  onClose,
  isSuperAdmin,
  onUserCreated,
}) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const [errors, setErrors] = useState({});
  const [userGroups, setUserGroups] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (currentUser?.user?.organization) {
      setFormData((prev) => ({
        ...prev,
        organization: currentUser.user.organization,
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadOrganization();
    }
  }, [isSuperAdmin]);

  const passwordRequirements = [
    "At least 8 characters long",
    "At least 1 number",
    "At least 1 lowercase letter",
    "At least 1 uppercase letter",
    "At least 1 special character (^ $ * . [ ] { } ( ) ? - \" ! @ # % & / \\ , < > ' : ; | _ ~ ` + =)",
  ];

  const loadOrganization = async () => {
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

  const fetchUserGroups = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        toast.error("Authentication token is missing.");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/groups/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Unexpected API response format:", data);
        return;
      }

      setUserGroups(data);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      toast.error("Failed to load user groups.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/auth/register/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        const errorMessages = Object.values(data).flat().join(", ");
        toast.error(errorMessages || "Registration failed.");
        return;
      }

      toast.success("User registered successfully!");

      const newUserId = data.id;

      if (selectedRole) {
        const token = sessionStorage.getItem("accessToken");
        const roleRes = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/users/${newUserId}/set_group/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ group_id: Number(selectedRole) }),
          }
        );
        if (roleRes.ok) {
          toast.success("Role assigned successfully!");
          navigate("/dashboard");
        } else {
          const errData = await roleRes.json();
          toast.error(
            `Role assignment failed: ${errData.message || "Unknown error"}`
          );
        }
      }

      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An error occurred.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen py-12">
      <ToastContainer position="bottom-right" />

      {/* Card Container */}
      <div className="flex flex-col bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto my-6 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white px-4 py-4 sm:px-6 sm:py-6 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">
            Register User to an Organization
          </h2>
          <button
            onClick={() => navigate(-1)}
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative w-full">
                <input
                  name="first_name"
                  required
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 pl-4 pr-3 py-3 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!formData.first_name && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <span className="text-red-500">* </span>First Name
                  </span>
                )}
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div className="relative w-full">
                <input
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 pl-4 pr-3 py-3 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!formData.last_name && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    Last Name
                  </span>
                )}
                {errors.last_name && (
                  <p className="text-red-500 text-sm">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="relative w-full">
              <input
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 pl-4 pr-3 py-3 sm:py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!formData.username && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <span className="text-red-500">* </span>Username
                </span>
              )}
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 pl-4 pr-3 py-3 sm:py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter valid email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <input
                name="contact_number"
                value={formData.contact_number || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    setFormData({ ...formData, contact_number: value });
                  }
                }}
                className="w-full rounded border border-gray-300 pl-4 pr-3 py-3 sm:py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="relative w-full">
              {currentUser?.user?.is_superadmin ? (
                <select
                  name="organization"
                  value={formData.organization || ""}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 pl-4 pr-10 py-3 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    * Select Organization
                  </option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="organization"
                  value={currentUser?.user?.organization_name || ""}
                  className="w-full rounded pl-4 pr-3 py-3 sm:py-4 bg-gray-200 text-gray-700 focus:outline-none"
                  readOnly
                />
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password || ""}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 pl-4 pr-10 py-3 sm:py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  name="password_confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.password_confirm || ""}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 pl-4 pr-10 py-3 sm:py-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm Password"
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
            </div>

            {/* Role */}
            <div>
              <label className="block font-medium mb-2">Assign Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-3 border rounded"
              >
                <option value="">Select Role</option>
                {userGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name === "App User" ? "Plan Editor" : group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMember;
