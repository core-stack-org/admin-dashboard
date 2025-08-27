import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  IconButton,
  Popover,
  Box,
  TextField,
  MenuItem,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Edit2,
  Eye,
  Download,
  Upload,
  FilePlus,
  ArrowLeftCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AllProjects = ({ statesList }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAppType, setSelectedAppType] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");

  const navigate = useNavigate();

  // fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}api/v1/projects/`,
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
        console.log(data);
        const statesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/v1/get_states/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "420",
            },
          }
        );

        if (!statesResponse.ok) {
          throw new Error(`HTTP error! Status: ${statesResponse.status}`);
        }

        const statesData = await statesResponse.json();
        const stateMap = {};
        statesData.states.forEach((state) => {
          stateMap[state.state_census_code] = state.state_name;
        });

        // Add state_name to projects
        const updatedProjects = data.map((project) => ({
          ...project,
          state_name: stateMap[project.state] || "Unknown State",
        }));
        setProjects(updatedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStateName = (stateId) => {
    const state = (statesList || []).find((s) => s.id === stateId);

    return state ? state.state_name : "Unknown State";
  };

  useEffect(() => {
    getStateName();
  }, []);

  const appTypes = [...new Set(projects.map((p) => p.app_type))];

  // filtering
  const filteredProjects = projects.filter((project) => {
    return (
      (selectedState === "" || project.state_name === selectedState) &&
      (selectedAppType === "" || project.app_type === selectedAppType) &&
      (selectedOrganization === "" ||
        project.organization_name === selectedOrganization) &&
      (selectedStatus === "" || project.status === selectedStatus)
    );
  });

  // handle filter popovers
  const handleFilterClick = (event, type) => {
    setAnchorEl(event.currentTarget);
    setFilterType(type);
  };
  const handleFilterClose = () => {
    setAnchorEl(null);
    setFilterType("");
    setSearchText("");
  };

  return (
    <Box>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="pt-6 bg-white rounded-xl mt-16 flex items-center px-6">
          <Tooltip title="Back to Dashboard">
            <IconButton onClick={() => navigate("/dashboard")}>
              <ArrowLeftCircle className="w-7 h-7 text-blue-600 hover:text-purple-600 transition-colors" />
            </IconButton>
          </Tooltip>

          {/* Centered Title */}
          <h1 className="flex-1 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-center drop-shadow-md">
            Projects Information
          </h1>
        </div>

        {/* Table container */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl shadow-lg border border-gray-200 bg-white overflow-y-auto h-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <CircularProgress />
              </div>
            ) : (
              <table className="min-w-full text-sm text-left border-collapse">
                {/* Head */}
                <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-black sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">S. no.</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">
                      <div className="flex items-center">
                        App Type
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, "app_type")}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </th>
                    <th className="px-6 py-4">
                      <div className="flex items-center">
                        State
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, "state")}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </th>
                    <th className="px-6 py-4">
                      <div className="flex items-center">
                        Organization
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, "organization")}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </th>
                    <th className="px-6 py-4">
                      <div className="flex items-center">
                        Status
                        <IconButton
                          size="small"
                          onClick={(e) => handleFilterClick(e, "status")}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((p, i) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition duration-200 text-gray-700"
                      >
                        <td className="px-6 py-4">{i + 1}</td>
                        <td className="px-6 py-4 font-medium">{p.name}</td>
                        <td className="px-6 py-4">{p.app_type || "N/A"}</td>
                        <td className="px-6 py-4">{p.state_name}</td>
                        <td className="px-6 py-4">
                          {p.organization_name || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              (p.status || "Active") === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.status || "Active"}
                          </span>
                        </td>

                        <td className="px-6 py-4 flex gap-2">
                          {/* Plantation */}
                          {p.app_type === "plantation" && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#4f46e5", // Indigo
                                    "&:hover": {
                                      color: "#4338ca",
                                      backgroundColor: "rgba(79,70,229,0.1)",
                                    },
                                  }}
                                >
                                  <Edit2 size={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Layer">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#059669", // Emerald
                                    "&:hover": {
                                      color: "#047857",
                                      backgroundColor: "rgba(5,150,105,0.1)",
                                    },
                                  }}
                                >
                                  <Eye size={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download GeoJSON">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#f59e0b", // Amber
                                    "&:hover": {
                                      color: "#d97706",
                                      backgroundColor: "rgba(245,158,11,0.1)",
                                    },
                                  }}
                                >
                                  <Download size={18} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {/* Waterbody */}
                          {p.app_type === "waterbody" && (
                            <>
                              <Tooltip title="Upload Excel">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#2563eb", // Blue
                                    "&:hover": {
                                      color: "#1d4ed8",
                                      backgroundColor: "rgba(37,99,235,0.1)",
                                    },
                                  }}
                                >
                                  <Upload size={18} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {/* Watershed */}
                          {p.app_type === "watershed" && (
                            <>
                              <Tooltip title="Create Plans">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#d946ef", // Pink/Purple
                                    "&:hover": {
                                      color: "#c026d3",
                                      backgroundColor: "rgba(217,70,239,0.1)",
                                    },
                                  }}
                                  onClick={() => {
                                    console.log("Project Name:", p.name); // <-- log it here
                                    navigate(`/projects/${p.id}/planCreation`, {
                                      state: {
                                        projectName: p.name,
                                        projectId: p.id,
                                        stateName: p.state_name,
                                        stateId: p.state,
                                      },
                                    });
                                  }}
                                >
                                  <FilePlus size={18} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Plans">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#f43f5e",
                                    "&:hover": {
                                      color: "#e11d48",
                                      backgroundColor: "rgba(244,63,94,0.1)",
                                    },
                                  }}
                                  onClick={() => {
                                    console.log("Project Name:", p.name); // <-- log it here
                                    navigate(`/projects/${p.id}/plans`, {
                                      state: {
                                        projectName: p.name,
                                        projectId: p.id,
                                      },
                                    });
                                  }}
                                >
                                  <Eye size={18} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {/* Community Engagement */}
                          {p.app_type === "community_engagement" && <></>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-gray-500"
                      >
                        No projects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Filters Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
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
              if (filterType === "state") setSelectedState("");
              if (filterType === "status") setSelectedStatus("");
              if (filterType === "app_type") setSelectedAppType("");
              handleFilterClose();
            }}
          >
            All{" "}
            {filterType === "state"
              ? "States"
              : filterType === "status"
              ? "Status"
              : "App Types"}
          </MenuItem>

          {filterType === "state" &&
            statesList
              ?.filter((s) =>
                s.state_name.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((s) => (
                <MenuItem
                  key={s.id}
                  onClick={() => {
                    setSelectedState(s.state_name);
                    handleFilterClose();
                  }}
                >
                  {s.state_name}
                </MenuItem>
              ))}

          {filterType === "status" &&
            ["Active", "Inactive"]
              .filter((opt) =>
                opt.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((opt) => (
                <MenuItem
                  key={opt}
                  onClick={() => {
                    setSelectedStatus(opt);
                    handleFilterClose();
                  }}
                >
                  {opt}
                </MenuItem>
              ))}

          {filterType === "app_type" &&
            ["Plantation", "Watershed", "Waterbody", "community_engagement"]
              .filter((opt) =>
                opt.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((opt) => (
                <MenuItem
                  key={opt}
                  onClick={() => {
                    setSelectedAppType(opt);
                    handleFilterClose();
                  }}
                >
                  {opt}
                </MenuItem>
              ))}

          {filterType === "organization" &&
            [...new Set(projects.map((p) => p.organization_name))]
              .filter((org) =>
                org?.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((org) => (
                <MenuItem
                  key={org}
                  onClick={() => {
                    setSelectedOrganization(org);
                    handleFilterClose();
                  }}
                >
                  {org || "N/A"}
                </MenuItem>
              ))}
          <MenuItem
            onClick={() => {
              if (filterType === "state") setSelectedState("");
              if (filterType === "status") setSelectedStatus("");
              if (filterType === "app_type") setSelectedAppType("");
              if (filterType === "organization") setSelectedOrganization("");
              handleFilterClose();
            }}
          >
            All{" "}
            {filterType === "state"
              ? "States"
              : filterType === "status"
              ? "Status"
              : filterType === "app_type"
              ? "App Types"
              : "Organizations"}
          </MenuItem>
        </Box>
      </Popover>
    </Box>
  );
};

export default AllProjects;
