import React, { useEffect, useState, useMemo } from "react";
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
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";

const AllProjects = ({ statesList,currentUser }) => {
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
  const [bbox, setBBox] = useState(null);

  const navigate = useNavigate();
  console.log(currentUser.user)
  const isSuperAdmin = currentUser?.user?.is_superadmin;


  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        const statesResponse = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`
        );
        const statesData = await statesResponse.json();

        const stateMap = {};
        statesData.states.forEach((s) => {
          stateMap[s.state_census_code] = s.state_name;
        });

        // enrich projects and sort by name
        const updatedProjects = data
          .map((p) => ({
            ...p,
            state_name: stateMap[p.state] || "Unknown State",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setProjects(updatedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // memoized filter lists
  const appTypes = useMemo(
    () => Array.from(new Set(projects.map((p) => p.app_type).filter(Boolean))),
    [projects]
  );
  const organizations = useMemo(
    () =>
      Array.from(
        new Set(projects.map((p) => p.organization_name).filter(Boolean))
      ),
    [projects]
  );
  const states = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.state_name).filter(Boolean))),
    [projects]
  );

  // apply filters
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      return (
        (selectedState
          ? p.state_name?.toLowerCase() === selectedState.toLowerCase()
          : true) &&
        (selectedAppType
          ? p.app_type?.toLowerCase() === selectedAppType.toLowerCase()
          : true) &&
        (selectedOrganization
          ? p.organization_name?.toLowerCase() ===
            selectedOrganization.toLowerCase()
          : true) &&
        (selectedStatus
          ? (p.status || "Active").toLowerCase() ===
            selectedStatus.toLowerCase()
          : true)
      );
    });
  }, [
    projects,
    selectedState,
    selectedStatus,
    selectedAppType,
    selectedOrganization,
  ]);

  // popover handlers
  const handleFilterClick = (e, type) => {
    setAnchorEl(e.currentTarget);
    setFilterType(type);
    setSearchText("");
  };
  const handleFilterClose = () => {
    setAnchorEl(null);
    setFilterType("");
    setSearchText("");
  };

  // clear all filters
  const clearAllFilters = () => {
    setSelectedState("");
    setSelectedStatus("");
    setSelectedAppType("");
    setSelectedOrganization("");
    setSearchText("");
    setAnchorEl(null);
  };

  const handleViewGeoJSON = async (project) => {
    const organizationName = project.organization_name;
    const projectName = project.name;

    const formattedOrganizationName = organizationName
      .replace(/\s+/g, "_")
      .toLowerCase();
    const formattedProjectName = projectName.replace(/\s+/g, "_").toLowerCase();

    const wfsurl = `${process.env.REACT_APP_IMAGE_LAYER_URL}plantation/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=plantation%3A${formattedOrganizationName}_${formattedProjectName}_suitability&outputFormat=application%2Fjson`;

    let dynamicBbox = "";
    try {
      const response = await fetch(wfsurl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const adminLayer = await response.json();

      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(adminLayer),
      });
      const extent = vectorSource.getExtent();

      dynamicBbox =
        extent[0] + "%2C" + extent[1] + "%2C" + extent[2] + "%2C" + extent[3];
      setBBox(extent);
      const layerName = `plantation%3A${formattedOrganizationName}_${formattedProjectName}_suitability`;

      const geojsonViewUrl = `https://geoserver.core-stack.org:8443/geoserver/plantation/wms?service=WMS&version=1.1.0&request=GetMap&layers=${layerName}&bbox=${dynamicBbox}&width=768&height=330&srs=EPSG%3A4326&styles=&format=application/openlayers`;
      window.open(geojsonViewUrl, "_blank");
    } catch (error) {
      console.error("Error generating GeoJSON view URL:", error);
    }
  };

  const handleDownloadGeoJSON = async (project) => {
    const organizationName = project.organization_name;
    const projectName = project.name;
    const formattedOrganizationName = organizationName
      .replace(/\s+/g, "_")
      .toLowerCase();
    const formattedProjectName = projectName.replace(/\s+/g, "_").toLowerCase();
    const geojsonUrl = `https://geoserver.core-stack.org:8443/geoserver/plantation/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=plantation%3A${formattedOrganizationName}_${formattedProjectName}_suitability&maxFeatures=50&outputFormat=application%2Fjson`;

    try {
      const response = await fetch(geojsonUrl);
      const contentType = response.headers.get("content-type");

      if (!response.ok) throw new Error("Failed to fetch GeoJSON");

      if (contentType && contentType.includes("text/xml")) {
        console.warn("Received XML response instead of JSON.");
        alert("Layer not available yet. Please check after some time.");
        return;
      }

      const data = await response.json();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${formattedOrganizationName}_${formattedProjectName}_${timestamp}.geojson`;

      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading GeoJSON:", error);
      alert("Something went wrong while downloading the file.");
    }
  };

  const handleCompute = async (project) => {
    if (!project) {
      console.error("No project selected.");
      alert("Please select a project first.");
      return;
    }
    const matchedProject = projects.find((p) => p.id === project.id);

    if (!matchedProject) {
      console.error("Project not found in updated projects state.");
      alert("Something went wrong. Please refresh and try again.");
      return;
    }
    // Extract required fields
    const { state, appTypes, id } = project;
    const state_name = matchedProject.state_name;
    const appTypeId = appTypes?.length > 0 ? appTypes[0].id : null;

    if (!state_name || !matchedProject.id) {
      console.error("Missing required project details.");
      alert("Project data is incomplete. Please check.");
      return;
    }

    // Construct the formData object
    const formData = {
      project_id: matchedProject.id,
      state: state_name,
      start_year: 2017,
      end_year: 2023,
    };
    try {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/plantation_site_suitability/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setToast({
        open: true,
        message:
          "Task initiated successfully! Please wait to view the layer or download the Geojson.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error calling compute API:", error);
      alert("Failed to compute. Please try again.");
    }
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

          <h1 className="flex-1 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-center drop-shadow-md">
            Projects Information
          </h1>

          {/* Clear All Filters */}
          <span
            onClick={clearAllFilters}
            className="text-blue-500 hover:text-blue-700 cursor-pointer font-medium"
          >
            Clear All Filters
          </span>
        </div>

        {/* Table container */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl shadow-lg border border-gray-200 bg-white overflow-y-auto h-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <CircularProgress />
              </div>
            ) : (
              <table className="min-w-full text-md text-left border-collapse">
                <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-black top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">S. No.</th>
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

                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((p, i) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition duration-200 text-gray-700"
                      >
                        <td className="px-6 py-4 font-medium">{i + 1}</td>
                        <td className="px-6 py-4 font-medium">{p.name}</td>
                        <td className="px-6 py-4 font-medium">
                          {p.app_type_display || "N/A"}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {p.state_name}
                        </td>
                        <td className="px-6 py-4 font-medium">
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
                                    color: "#4f46e5",
                                    "&:hover": {
                                      color: "#4338ca",
                                      backgroundColor: "rgba(79,70,229,0.1)",
                                    },
                                  }}
                                  onClick={() =>
                                    navigate(`/projects/${p.id}/action`, {
                                      state: { project: p },
                                    })
                                  }
                                >
                                  <Edit2 size={24} />
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
                                  onClick={() => handleViewGeoJSON(p)}
                                >
                                  <Eye size={24} />
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
                                  onClick={handleDownloadGeoJSON}
                                >
                                  <Download size={24} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {/* Waterbody */}
                          {p.app_type === "waterbody" && isSuperAdmin && (
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
                                  <Upload size={24} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          {/* Watershed */}
                          {p.app_type === "watershed" && (
                            <>
                              <Tooltip title="Create Plan(s)">
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
                                    navigate(`/projects/${p.id}/planCreation`, {
                                      state: {
                                        projectName: p.name,
                                        projectId: p.id,
                                        stateName: p.state_name,
                                        stateId: p.state,
                                        districtId: p.district,
                                        districtName: p.district_name,
                                        blockId: p.block,
                                        blockName: p.block_name,
                                      },
                                    });
                                  }}
                                >
                                  <FilePlus size={24} />
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
                                    navigate(`/projects/${p.id}/plans`, {
                                      state: {
                                        projectName: p.name,
                                        projectId: p.id,
                                      },
                                    });
                                  }}
                                >
                                  <Eye size={24} />
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
                        colSpan={7}
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

      {/* Shared Popover */}
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

          {/* Reset Option */}
          <MenuItem
            onClick={() => {
              if (filterType === "state") setSelectedState("");
              if (filterType === "status") setSelectedStatus("");
              if (filterType === "app_type") setSelectedAppType("");
              if (filterType === "organization") setSelectedOrganization("");
              handleFilterClose();
            }}
            sx={{ color: "blue" }}
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

          {/* Dynamic Options */}
          {filterType === "state" &&
            states
              .filter((s) => s.toLowerCase().includes(searchText.toLowerCase()))
              .map((s) => (
                <MenuItem
                  key={s}
                  onClick={() => {
                    setSelectedState(s);
                    handleFilterClose();
                  }}
                >
                  {s}
                </MenuItem>
              ))}

          {filterType === "status" &&
            ["Active", "Inactive"]
              .filter((s) => s.toLowerCase().includes(searchText.toLowerCase()))
              .map((s) => (
                <MenuItem
                  key={s}
                  onClick={() => {
                    setSelectedStatus(s);
                    handleFilterClose();
                  }}
                >
                  {s}
                </MenuItem>
              ))}

          {filterType === "app_type" &&
            ["plantation", "watershed", "waterbody", "community_engagement"]
              .filter((s) => s.toLowerCase().includes(searchText.toLowerCase()))
              .map((s) => (
                <MenuItem
                  key={s}
                  onClick={() => {
                    setSelectedAppType(s);
                    handleFilterClose();
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                </MenuItem>
              ))}

          {filterType === "organization" &&
            organizations
              .filter((s) => s.toLowerCase().includes(searchText.toLowerCase()))
              .map((s) => (
                <MenuItem
                  key={s}
                  onClick={() => {
                    setSelectedOrganization(s);
                    handleFilterClose();
                  }}
                >
                  {s}
                </MenuItem>
              ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default AllProjects;
