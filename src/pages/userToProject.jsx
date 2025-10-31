import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const UserToProject = ({ closeModal, onClose }) => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/projects/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "420",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          const sortedProjects = data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setProjects(sortedProjects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
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
        const usersData = await response.json();

        if (Array.isArray(usersData)) {
          const sortedUsers = usersData.sort((a, b) =>
            a.first_name.localeCompare(b.first_name)
          );
          setUsers(sortedUsers);
        } else if (usersData && Array.isArray(usersData.users)) {
          const sortedUsers = usersData.users.sort((a, b) =>
            a.username.localeCompare(b.username)
          );
          setUsers(sortedUsers);
        } else {
          console.error("Unexpected users API response:", usersData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Handle assign
  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedProject) {
      toast.error("Please select both user and project.");
      return;
    }

    const user = users.find((u) => u.id.toString() === selectedUser);
    if (!user || !user.groups || user.groups.length === 0) {
      toast.error("This user has no group assigned.");
      return;
    }

    const groupId = user.groups[0].id;

    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/projects/${selectedProject}/users/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user.id,
            group: groupId,
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("API Error:", errText);
        throw new Error("Failed to assign user.");
      }

      toast.success("User assigned to project successfully!");
      setSelectedUser("");
      setSelectedProject("");
      closeModal?.(); // close modal if provided
    } catch (err) {
      console.error("Error assigning user:", err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer position="bottom-left" />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-fuchsia-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Assign Project Role to User</h2>
          <button
            onClick={() => {
              if (closeModal) closeModal();
              if (onClose) onClose();
            }}
            className="text-white hover:bg-fuchsia-700 rounded-full p-2 focus:outline-none"
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
          <form onSubmit={handleAssign} className="space-y-6">
            {/* User Selection */}
            <div>
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
                          users.find((u) => u.id === selectedUser)?.username ||
                          "",
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

            {/* Project Selection */}
            <div>
              <label className="block text-lg font-medium mb-3">
                Project Name
              </label>
              <Select
                options={projects.map((project) => ({
                  value: project.id,
                  label: project.name,
                }))}
                value={
                  selectedProject
                    ? {
                        value: selectedProject,
                        label:
                          projects.find((p) => p.id === selectedProject)
                            ?.name || "",
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  setSelectedProject(selectedOption ? selectedOption.value : "")
                }
                placeholder="Search or select a project..."
                isSearchable
                required
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
                className="px-8 py-3 text-white rounded-md transition text-lg bg-fuchsia-600 hover:bg-fuchsia-700"
              >
                Assign Project to User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserToProject;
