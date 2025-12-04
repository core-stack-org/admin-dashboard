import React, { useEffect, useState, useMemo } from "react";
import {
  IconButton,
  MenuItem,
  Popover,
  Box,
  TextField,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { ArrowLeftCircle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/users/`,
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
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleFilterClick = (event, type) => {
    setAnchorEl(event.currentTarget);
    setFilterType(type);
    setSearchText("");
  };
  const handleFilterClose = () => setAnchorEl(null);

  const organizations = useMemo(
    () =>
      Array.from(
        new Set(users.map((u) => u.organization_name).filter(Boolean))
      ),
    [users]
  );

  const roles = useMemo(() => {
    const allRoles = users.flatMap((u) => {
      const groupNames = u.groups?.map((g) => g.name) || [];
      return u.is_superadmin ? ["Superadmin", ...groupNames] : groupNames;
    });
    return Array.from(new Set(allRoles));
  }, [users]);

  const projects = useMemo(() => {
    const allProjects = users.flatMap(
      (u) => u.project_details?.map((p) => p.project_name) || []
    );
    return Array.from(new Set(allProjects));
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesOrg = selectedOrg
        ? u.organization_name === selectedOrg
        : true;
      const matchesStatus = selectedStatus
        ? (u.is_active ? "Active" : "Inactive") === selectedStatus
        : true;

      const groupNames = u.groups?.map((g) => g.name) || [];
      if (u.is_superadmin) groupNames.unshift("Superadmin");
      const matchesRole = selectedRole
        ? groupNames.includes(selectedRole)
        : true;

      const userProjects = u.project_details?.map((p) => p.project_name) || [];
      const matchesProject = selectedProject
        ? userProjects.includes(selectedProject)
        : true;

      return matchesOrg && matchesStatus && matchesRole && matchesProject;
    });
  }, [users, selectedOrg, selectedStatus, selectedRole, selectedProject]);

  const clearAllFilters = () => {
    setSelectedOrg("");
    setSelectedProject("");
    setSelectedRole("");
    setSelectedStatus("");
    setSearchText("");
    setAnchorEl(null); // close any open filter popover
  };

  return (
    <Box>
      <div className="h-screen flex flex-col">
        <div className="pt-6 bg-white rounded-xl mt-16 flex items-center px-6">
          <Tooltip title="Back to Dashboard">
            <IconButton onClick={() => navigate("/dashboard")}>
              <ArrowLeftCircle className="w-7 h-7 text-blue-600 hover:text-purple-600 transition-colors" />
            </IconButton>
          </Tooltip>

          {/* Centered Title */}
          <h1 className="flex-1 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-center drop-shadow-md">
            Users Information
          </h1>

          <span
            onClick={clearAllFilters}
            className="text-blue-500 hover:text-blue-700 cursor-pointer font-medium"
          >
            Clear All Filters
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="rounded-2xl shadow-lg border border-gray-200 bg-white overflow-y-auto h-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <CircularProgress />
              </div>
            ) : (
              <table className="min-w-full text-md text-left border-collapse">
                {/* Table Head */}
                <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-black top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">S. no.</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        Organization
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, "organization")}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </div>

                      <Popover
                        open={
                          Boolean(anchorEl) && filterType === "organization"
                        }
                        anchorEl={anchorEl}
                        onClose={handleFilterClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        <Box sx={{ p: 2, minWidth: 200 }}>
                          <TextField
                            size="small"
                            placeholder={`Search ${filterType}...`}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            fullWidth
                            sx={{ mb: 1 }}
                          />
                          <MenuItem
                            onClick={() => {
                              setSelectedOrg("");
                              setSearchText("");
                              handleFilterClose();
                            }}
                            sx={{ color: "blue" }}
                          >
                            All Organizations
                          </MenuItem>
                          {organizations
                            .filter((option) =>
                              option
                                .toLowerCase()
                                .includes(searchText.toLowerCase())
                            )
                            .map((option) => (
                              <MenuItem
                                key={option}
                                onClick={() => {
                                  setSelectedOrg(option);
                                  handleFilterClose();
                                }}
                              >
                                {option}
                              </MenuItem>
                            ))}
                        </Box>
                      </Popover>
                    </th>

                    <th className="px-6 py-4">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        Projects
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, "projects")}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </div>

                      <Popover
                        open={Boolean(anchorEl) && filterType === "projects"}
                        anchorEl={anchorEl}
                        onClose={handleFilterClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        <Box sx={{ p: 2, minWidth: 200 }}>
                          <TextField
                            size="small"
                            placeholder={`Search ${filterType}...`}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            fullWidth
                            sx={{ mb: 1 }}
                          />

                          <MenuItem
                            onClick={() => {
                              setSelectedProject("");
                              setSearchText("");
                              handleFilterClose();
                            }}
                            sx={{ color: "blue" }}
                          >
                            All Projects
                          </MenuItem>

                          {projects
                            .filter((option) =>
                              option
                                .toLowerCase()
                                .includes(searchText.toLowerCase())
                            )
                            .map((option) => (
                              <MenuItem
                                key={option}
                                onClick={() => {
                                  setSelectedProject(option);
                                  handleFilterClose();
                                }}
                              >
                                {option}
                              </MenuItem>
                            ))}
                        </Box>
                      </Popover>
                    </th>

                    <th className="px-6 py-4">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        Status
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, "status")}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </div>

                      <Popover
                        open={Boolean(anchorEl) && filterType === "status"}
                        anchorEl={anchorEl}
                        onClose={handleFilterClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        <Box sx={{ p: 2, minWidth: 200 }}>
                          <TextField
                            size="small"
                            placeholder={`Search ${filterType}...`}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            fullWidth
                            sx={{ mb: 1 }}
                          />
                          <MenuItem
                            onClick={() => {
                              setSelectedStatus("");
                              setSearchText("");
                              handleFilterClose();
                            }}
                            sx={{ color: "blue" }}
                          >
                            All Status
                          </MenuItem>
                          {["Active", "Inactive"]
                            .filter((option) =>
                              option
                                .toLowerCase()
                                .includes(searchText.toLowerCase())
                            )
                            .map((option) => (
                              <MenuItem
                                key={option}
                                onClick={() => {
                                  setSelectedStatus(option);
                                  handleFilterClose();
                                }}
                              >
                                {option}
                              </MenuItem>
                            ))}
                        </Box>
                      </Popover>
                    </th>

                    <th className="px-6 py-4">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        Roles
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, "roles")}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </div>

                      <Popover
                        open={Boolean(anchorEl) && filterType === "roles"}
                        anchorEl={anchorEl}
                        onClose={handleFilterClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        <Box sx={{ p: 2, minWidth: 200 }}>
                          <TextField
                            size="small"
                            placeholder={`Search ${filterType}...`}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            fullWidth
                            sx={{ mb: 1 }}
                          />

                          <MenuItem
                            onClick={() => {
                              setSelectedRole("");
                              setSearchText("");
                              handleFilterClose();
                            }}
                            sx={{ color: "blue" }}
                          >
                            All Roles
                          </MenuItem>

                          {roles
                            .filter((option) =>
                              option
                                .toLowerCase()
                                .includes(searchText.toLowerCase())
                            )
                            .map((option) => (
                              <MenuItem
                                key={option}
                                onClick={() => {
                                  setSelectedRole(option);
                                  handleFilterClose();
                                }}
                              >
                                {option}
                              </MenuItem>
                            ))}
                        </Box>
                      </Popover>
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => {
                      let groupNames =
                        user.groups?.map((group) => group.name) || [];
                      if (user.is_superadmin) groupNames.unshift("Superadmin");

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition duration-200 text-gray-700"
                        >
                          <td className="px-3 py-3">{index + 1}</td>
                          <td className="px-3 py-3 font-medium">
                            {user.first_name || user.last_name
                              ? `${user.first_name || ""} ${
                                  user.last_name || ""
                                }`.trim()
                              : "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            {user.username || "N/A"}
                          </td>
                          <td className="px-3 py-2">{user.email || "N/A"}</td>
                          <td className="px-3 py-2">
                            {user.contact_number || "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            {user.organization_name || "N/A"}
                          </td>

                          <td className="px-3 py-2">
                            {user.project_details &&
                            user.project_details.length > 0
                              ? user.project_details
                                  .map((p) => p.project_name)
                                  .join(", ")
                              : "N/A"}
                          </td>

                          <td className="px-3 py-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {groupNames.length > 0
                              ? groupNames.join(", ")
                              : "N/A"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-6 text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Box>
  );
};

export default UsersTable;
