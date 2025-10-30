import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const UserMappingForm = ({ closeModal, onClose }) => {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [formData, setFormData] = useState({ userId: "", organizationId: "" });
  useEffect(() => {
    loadUsers();
    loadOrganization();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedOrganization) {
      toast.error("Both fields are required");
      return;
    }
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        toast.error("Authentication token missing");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/users/${selectedUser}/set_organization/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
          body: JSON.stringify({
            organization_id: selectedOrganization,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      toast.success("User mapped successfully");

      setTimeout(() => {
        if (closeModal) closeModal();
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error("Error mapping user:", error);
      toast.error("Failed to map user to organization");
    }
  };

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
        const sortedorgs = data.sort((a, b) => a.name.localeCompare(b.name));

        setOrganizations(sortedorgs);
      } else {
        console.error("Unexpected API response format:", data);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Map User to Organization</h2>
          <button
            onClick={() => {
              if (closeModal) closeModal();
              if (onClose) onClose();
            }}
            className="text-white hover:bg-slate-700 rounded-full p-2 focus:outline-none"
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select User */}

              <div>
                <label className="block text-lg font-medium mb-3">
                  Select User
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

              {/* Select Organization */}
              <div>
                <label className="block text-lg font-medium mb-3">
                  Select Organization
                </label>
                <Select
                  options={organizations.map((org) => ({
                    value: org.id,
                    label: org.name,
                  }))}
                  value={
                    selectedOrganization
                      ? {
                          value: selectedOrganization,
                          label:
                            organizations.find(
                              (o) => o.id === selectedOrganization
                            )?.name || "",
                        }
                      : null
                  }
                  onChange={(selectedOption) =>
                    setSelectedOrganization(
                      selectedOption ? selectedOption.value : ""
                    )
                  }
                  placeholder="Search or select an organization..."
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
                  className="px-8 py-3 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition text-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMappingForm;
