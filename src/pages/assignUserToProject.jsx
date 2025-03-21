import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AssignUserToProject = ({ currentUser, closeModal }) => {
  const [organization, setOrganization] = useState(null);
  const [userId, setUserId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userRoles, setUserRoles] = useState([]); // Stores roles for selected user
  const [selectedRole, setSelectedRole] = useState(""); // Stores selected role
  const [groups, setGroups] = useState([]);

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
        setProjects(data);
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
          setUsers(usersData);
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
    console.log("Fetching roles...");
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
        console.log("Fetched Groups:", groupData);

        if (Array.isArray(groupData)) {
          setGroups(groupData); // Set groups properly
        } else {
          console.error("Unexpected groups API response:", groupData);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  // Handle user selection and update roles dynamically
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);

    const user = users.find((u) => u.id.toString() === userId);
    setUserRoles(user ? user.groups || [] : []);
    setSelectedRole(""); // Reset selected role when user changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProject || !selectedUser || !selectedRole) {
      toast.error("Please select a project, user, and role.");
      return;
    }

    // Find the selected user's name
    const user = users.find((u) => u.id.toString() === selectedUser);
    const userName = user ? user.username : "Unknown User";

    // Find the selected project's name
    const project = projects.find((p) => p.id.toString() === selectedProject);
    const projectName = project ? project.name : "Unknown Project";

    // Find the selected role's name
    const role = userRoles.find((r) => r.id.toString() === selectedRole);
    const roleName = role ? role.name : "Unknown Role";

    // Log values
    console.log("Selected User:", userName, `(ID: ${selectedUser})`);
    console.log("Selected Project:", projectName, `(ID: ${selectedProject})`);
    console.log("Selected Role:", roleName, `(ID: ${selectedRole})`);

    const formData = {
      user: selectedUser,
      group: selectedRole,
    };

    try {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/projects/${selectedProject}/users/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign project role");
      }

      toast.success("Project role assigned successfully!");
      closeModal();
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to assign project role.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer position="bottom-left" />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-fuchsia-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Assign Project Role</h2>
          <button
            onClick={closeModal}
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-lg font-medium mb-3">
                User Name
              </label>
              <select
                value={selectedUser}
                onChange={handleUserChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              >
                <option value="" disabled>
                  Select a user
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-lg font-medium mb-3">
                Project Name
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              >
                <option value="" disabled>
                  Select a project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Name */}
            <div>
              <label className="block text-lg font-medium mb-3">
                Role Name
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              >
                <option value="" disabled>
                  Select role
                </option>
                {groups
                  .filter(
                    (group) =>
                      group.name === "Organization Admin" ||
                      group.name === "Project Manager"
                  ) // Filter required roles
                  .map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-3 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 transition text-lg"
              >
                Assign Role
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignUserToProject;
