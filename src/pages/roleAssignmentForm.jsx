import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const RoleAssignmentForm = ({ closeModal, onClose }) => {
  const [formData, setFormData] = useState({ userId: "", roleId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [userGroups, setUserGroups] = useState([]);
  const [users, setUsers] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    loadUsers();
    fetchUserGroups();
  }, []);

  const loadUsers = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/users/`,
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
      const sortedUsers = data.sort((a, b) =>
        a.first_name.localeCompare(b.first_name)
      );

      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const assignRole = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedRole) {
      toast.error("Please select both a user and a role.");
      return;
    }

    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        toast.error("Authentication token is missing.");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/users/${selectedUser}/set_group/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
          body: JSON.stringify({
            group_id: Number(selectedRole),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Role assigned successfully!");
        setTimeout(() => {
          if (closeModal) closeModal();
          if (onClose) onClose();
        }, 2000);
      } else {
        toast.error(
          `Failed to assign role: ${data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("An error occurred while assigning the role.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Assign Role</h2>
          <button
            onClick={() => {
              if (closeModal) closeModal();
              if (onClose) onClose();
            }}
            className="text-white hover:bg-amber-700 rounded-full p-2 focus:outline-none"
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
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <form onSubmit={assignRole} className="space-y-4">
              {/* Select User */}
              <div className="w-full">
                <label className="block text-lg font-medium mb-3">
                  User Name
                </label>
                <Select
                  options={users.map((user) => ({
                    value: user.id,
                    label: `${user.username} (${user.first_name}  ${user.last_name})`,
                  }))}
                  value={
                    selectedUser
                      ? {
                          value: selectedUser,
                          label:
                            users.find((u) => u.id === selectedUser)
                              ?.username || "",
                        }
                      : null
                  }
                  onChange={(selectedOption) =>
                    setSelectedUser(selectedOption ? selectedOption.value : "")
                  }
                  placeholder="Search or select a user..."
                  isSearchable
                  className="w-full text-lg"
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px",
                      borderColor: "#d1d5db",
                      borderRadius: "0.5rem",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#9ca3af" },
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 99999,
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 99999,
                    }),
                  }}
                />
              </div>

              {/* Select Role */}
              <div>
                <label className="block text-lg font-medium mb-3">
                  Select Role
                </label>
                <Select
                  options={userGroups.map((group) => ({
                    value: group.id,
                    label:
                      group.name === "App User" ? "Plan Editor" : group.name,
                  }))}
                  value={
                    selectedRole
                      ? {
                          value: selectedRole,
                          label:
                            userGroups.find((g) => g.id === selectedRole)
                              ?.name === "App User"
                              ? "Plan Editor"
                              : userGroups.find((g) => g.id === selectedRole)
                                  ?.name || "",
                        }
                      : null
                  }
                  onChange={(selectedOption) =>
                    setSelectedRole(selectedOption ? selectedOption.value : "")
                  }
                  placeholder="Search or select a role..."
                  isSearchable
                  className="w-full text-lg"
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px",
                      borderColor: "#d1d5db",
                      borderRadius: "0.5rem",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#9ca3af" },
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 99999,
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 99999,
                    }),
                  }}
                />
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition text-lg flex items-center justify-center w-full"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="w-5 h-5 mr-2 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 2L12 12M12 12L16 16M12 12L8 16"
                        ></path>
                      </svg>
                      Assigning...
                    </>
                  ) : (
                    "Assign Role"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentForm;
