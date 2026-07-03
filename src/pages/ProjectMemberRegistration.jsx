import React, { useState, useEffect } from "react";
import { CheckCircle2, Eye, EyeOff,UserPlus,User,Lock,Shield } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ProjectMemberRegistration = ({
  project,
  closeModal,
  currentUser,
  onClose,
  isSuperAdmin,
  onUserCreated,
  onSuccess,
  isEdit,
  member

}) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [isPublicVisible, setIsPublicVisible] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    contact_number: "",
    organization: "",
    gender: "",
    age: "",
    education_qualification: ""
  });

  const [errors, setErrors] = useState({});
  const [userGroups, setUserGroups] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [selectedProjectRole, setSelectedProjectRole] = useState("");

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

  useEffect(() => {
  if (isEdit && member) {
    setFormData({
      username: member.username || "",
      email: member.email || "",
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      contact_number: member.contact_number || "",
      organization: member.organization || "",
      gender: member.gender || "",
      age: member.age || "",
      education_qualification:
        member.education_qualification || "",
      password: "",
      password_confirm: "",
    });

    setSelectedRole(member.group_id || "");
  }
}, [isEdit, member]);
  

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

const registerUser = async () => {
  try {
    const token = sessionStorage.getItem("accessToken");

    const formDataToSend = new FormData();

    formDataToSend.append("username", formData.username);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("password_confirm", formData.password_confirm);
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("contact_number", formData.contact_number);
    formDataToSend.append("organization", formData.organization);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("age", formData.age);
    formDataToSend.append(
      "education_qualification",
      formData.education_qualification
    );

    // Register User
    const registerRes = await fetch(
      `${process.env.REACT_APP_BASEURL}/api/v1/auth/register/`,
      {
        method: "POST",
        body: formDataToSend,
      }
    );

    const registerData = await registerRes.json();

    if (!registerRes.ok) {
      const errorMessages = Object.values(registerData)
        .flat()
        .join(", ");

      toast.error(errorMessages || "Registration failed");
      return;
    }

    const newUserId = registerData.id;

    // Assign Role
    if (selectedRole) {
      const roleRes = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/users/${newUserId}/set_group/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            group_id: Number(selectedRole),
          }),
        }
      );

      const roleData = await roleRes.json();

      if (!roleRes.ok) {
        toast.error(
          roleData.detail ||
          roleData.message ||
          "Failed to assign role"
        );
        return;
      }
    }

    // Add To Project
    if (project?.id) {
      const projectRoleRes = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/projects/${project.id}/users/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: newUserId,
            group: Number(selectedRole),
          }),
        }
      );

      const projectRoleData = await projectRoleRes.json();

      if (!projectRoleRes.ok) {
        toast.error(
          projectRoleData.detail ||
          projectRoleData.message ||
          "Failed to add user to project"
        );
        return;
      }
    }

    toast.success(
      "User created, role assigned and added to project successfully!"
    );

setTimeout(() => {
  onUserCreated?.();
  onSuccess?.();
  onClose?.();
}, 1500);
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Something went wrong");
  }
};

const updateUser = async () => {
  try {
    const token = sessionStorage.getItem("accessToken");

    const payload = {
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      contact_number: formData.contact_number,
      gender: formData.gender,
      age: formData.age,
      education_qualification:
        formData.education_qualification,
      organization: formData.organization,
    };

    const response = await fetch(
      `${process.env.REACT_APP_BASEURL}/api/v1/users/${member.id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    toast.success("Member updated successfully");

        setTimeout(() => {
        onUserCreated?.();
        onSuccess?.();
        onClose?.();
        }, 1500);

  } catch (error) {
    toast.error(error.message);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validate();

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  if (isEdit) {
    await updateUser();
  } else {
    await registerUser();
  }
};

return (
  <>
    {/* <ToastContainer position="bottom-right" /> */}

    <div className="px-2">

<div className="bg-[#F5F1FF] border border-[#E7E0FF] rounded-2xl p-6 mb-6">
  <div className="flex items-center justify-between">

    <div className="flex items-center gap-4">

<div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center shadow-sm">        <UserPlus className="h-6 w-6 text-white" />
      </div>

      <div>
       <h2 className="text-3xl font-bold text-slate-900">
            {isEdit ? "Edit User" : "Register New User"}
            </h2>

            <p className="text-slate-500 text-base mt-1">
            {isEdit
                ? "Update user details"
                : "Create and assign a new user to this project"}
            </p>
      </div>

    </div>

    <button
      type="button"
      onClick={onClose}
        className="h-10 w-10 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition">
      ✕
    </button>

  </div>

</div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* PERSONAL INFORMATION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
            <User size={18} className="text-purple-600" />
            Personal Information
            </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm mb-1">First Name *</label>
              <input
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Last Name</label>
              <input
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Username *</label>
              <input
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                placeholder="Choose username"
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Contact Number
              </label>

              <input
                name="contact_number"
                value={formData.contact_number || ""}
                placeholder="Enter 10-digit mobile number"
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^\d{0,10}$/.test(value)) {
                    setFormData({
                      ...formData,
                      contact_number: value,
                    });
                  }
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Age</label>

              <input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Education Qualification
              </label>

            <select
                name="education_qualification"
                value={formData.education_qualification}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                >
                <option value="">Select Education Qualification</option>
                <option value="No Formal Education">No Formal Education</option>
                <option value="Primary">Primary (Class 1-5)</option>
                <option value="Middle">Middle (Class 6-8)</option>
                <option value="Secondary">Secondary (Class 9-10)</option>
                <option value="Higher Secondary">Higher Secondary (Class 11-12)</option>
                <option value="ITI">ITI / Vocational Training</option>
                <option value="Diploma">Diploma</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="Doctorate">Doctorate / PhD</option>
                </select>
            </div>

          </div>
        </div>

        {/* ACCOUNT INFORMATION */}
        {!isEdit && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
            <Lock size={18} className="text-purple-600" />
            Account Information
            </h3>

          <div className="grid grid-cols-2 gap-4">

            <div className="relative">
              <label className="block text-sm mb-1">
                Password
              </label>

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                value={formData.password || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-10"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm mb-1">
                Confirm Password
              </label>

              <input
                name="password_confirm"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={formData.password_confirm || ""}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-10"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

          </div>
        </div>
        )}

        {/* ROLE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
            <Shield size={18} className="text-purple-600" />
            User role
          </h3>

          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value)
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          >
            <option value="">Select Role</option>

            {userGroups.map((group) => (
              <option
                key={group.id}
                value={group.id}
              >
                {group.name === "App User"
                  ? "Facilitator/CRP"
                  : group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 pt-4 border-t">
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={isPublicVisible}
      onChange={(e) =>
        setIsPublicVisible(e.target.checked)
      }
      className="mt-1 h-4 w-4 accent-purple-600"
    />

    <div>
      <p className="font-medium text-slate-700">
        Visible on public platforms
      </p>
    </div>
  </label>
</div>


        <div className="flex justify-end gap-3 pt-4 border-t">

       <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 bg-white rounded-xl text-slate-700 hover:bg-slate-50 transition"
            >
            Cancel
            </button>

         <button
            type="submit"
            className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-sm"
            >
                {isEdit ? "Update User" : "Create User"}            </button>

        </div>

      </form>
    </div>
  </>
);
};

export default ProjectMemberRegistration;
