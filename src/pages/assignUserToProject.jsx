import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const AssignUserToProject = ({
  currentUser,
  closeModal,
  mode = "assign",
  onUserCreated,
}) => {
  const [organization, setOrganization] = useState(null);
  const [userId, setUserId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [groups, setGroups] = useState([]);
  const [userProjectId, setUserProjectId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.user?.organization) {
      setOrganization(currentUser.user.organization);
      setUserId(currentUser.user.id);
    }
  }, [currentUser]);

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
        const sortedProjects = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setProjects(sortedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

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
          setUsers(usersData.users);
        } else {
          console.error("Unexpected users API response:", usersData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
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

        const groupData = await response.json();

        if (Array.isArray(groupData)) {
          setGroups(groupData);
        } else {
          console.error("Unexpected groups API response:", groupData);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchUserProjectId = async () => {
      if (!selectedProject || !selectedUser || mode !== "remove") return;

      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.REACT_APP_BASEURL}api/v1/projects/${selectedProject}/users/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUserProjectId(data[0].id);
        } else {
          console.warn("No project-user relation found.");
        }
      } catch (err) {
        console.error("Error fetching userProjectId:", err);
      }
    };

    fetchUserProjectId();
  }, [selectedUser, selectedProject, mode]);

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);

    const user = users.find((u) => u.id.toString() === userId);

    if (mode === "assign") {
      // Show all roles
      setUserRoles(groups);
    } else {
      setUserRoles(user?.groups || []);
    }

    setSelectedRole("");
  };

  const handleAssignOrUpdate = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const checkRes = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${selectedProject}/users/${selectedUser}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const checkData = await checkRes.json();
      const isAssigned = Array.isArray(checkData) && checkData.length > 0;

      let apiUrl = "";
      let method = "";
      let body = {};

      if (isAssigned) {
        method = "PATCH";
        apiUrl = `${process.env.REACT_APP_BASEURL}/api/v1/projects/${selectedProject}/users/${checkData[0].id}/`;

        body = {
          group: selectedRole,
        };
      } else {
        method = "POST";
        apiUrl = `${process.env.REACT_APP_BASEURL}/api/v1/projects/${selectedProject}/users/`;

        body = {
          user: selectedUser,
          group: selectedRole,
        };
      }

      const finalRes = await fetch(apiUrl, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!finalRes.ok) {
        throw new Error("API failed");
      }

      toast.success(
        isAssigned
          ? "Role updated successfully!"
          : "Role assigned successfully!"
      );
      onUserCreated();
      closeModal();
    } catch (err) {
      console.error("Error assigning/updating role:", err);
      toast.error("Something went wrong.");
    }
  };

  const removeUserFromProject = async () => {
    const token = sessionStorage.getItem("accessToken");

    const response = await fetch(
      `${process.env.REACT_APP_BASEURL}api/v1/projects/${selectedProject}/users/${userProjectId}/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove project role");
    }

    toast.success("Project role removed successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProject || !selectedUser || !selectedRole) {
      toast.error("Please select a project, user, and role.");
      return;
    }

    try {
      if (mode === "assign") {
        await handleAssignOrUpdate();
      } else {
        await removeUserFromProject();
      }
      onUserCreated();
      closeModal();
    } catch (error) {
      console.error("Error in submit:", error);
      toast.error("Operation failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer position="bottom-left" />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div
          className={`${
            mode === "assign" ? "bg-fuchsia-600" : "bg-red-600"
          } text-white px-6 py-4 flex justify-between items-center`}
        >
          <h2 className="text-xl font-semibold">
            {mode === "assign" ? "Assign Project Role" : "Remove Project Role"}
          </h2>
          <button
            onClick={closeModal}
            className={`text-white ${
              mode === "assign" ? "hover:bg-fuchsia-700" : "hover:bg-red-700"
            } rounded-full p-2 focus:outline-none`}
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-lg font-medium mb-3">
                User Name
              </label>

              <Select
                options={users.map((user) => ({
                  value: user.id,
                  label: `${user.username} (${user.first_name || ""} ${
                    user.last_name || ""
                  })`,
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
                  handleUserChange({
                    target: {
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                placeholder="Search or select a user..."
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

            {/* Role Name */}
            <div>
              <label className="block text-lg font-medium mb-3">
                Role Name
              </label>

              <Select
                options={userRoles.map((group) => ({
                  value: group.id,
                  label: group.name === "App User" ? "Plan Editor" : group.name,
                }))}
                value={
                  selectedRole
                    ? {
                        value: selectedRole,
                        label:
                          userRoles.find((r) => r.id === selectedRole)?.name ===
                          "App User"
                            ? "Plan Editor"
                            : userRoles.find((r) => r.id === selectedRole)
                                ?.name || "",
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  setSelectedRole(selectedOption ? selectedOption.value : "")
                }
                placeholder="Search or select a role..."
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
                className={`px-8 py-3 text-white rounded-md transition text-lg ${
                  mode === "assign"
                    ? "bg-fuchsia-600 hover:bg-fuchsia-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {mode === "assign" ? "Assign Role" : "Remove Role"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignUserToProject;
