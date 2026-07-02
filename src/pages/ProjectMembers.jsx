import React,{useState,useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AddMember from "./addMember";
import { Edit2, Trash2, Check ,Eye, Download,Upload,FilePlus,Settings,BarChart3} from "lucide-react";
import ProjectMemberRegistration from "./ProjectMemberRegistration";
import {
  CircularProgress,
  IconButton,
  Popover,
  Box,
  TextField,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Menu,
  Switch
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";
import PlantationActions from "./plantationActions";


const ProjectMembers = ({ currentUser }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const project = location.state?.project;
    const currentPageFromState = location.state?.currentPage;
    const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [projectUsers, setProjectUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [unassignedPage, setUnassignedPage] = useState(1);
      const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
      });
      const [openCEDialog, setOpenCEDialog] = useState(false);
        const [selectedCEProject, setSelectedCEProject] = useState(null);
        const [selectedCEFiles, setSelectedCEFiles] = useState([]);
        // Waterbody Excel Upload
        const [openWBDialog, setOpenWBDialog] = useState(false);
        const [selectedWBProject, setSelectedWBProject] = useState(null);
        const [selectedWBFiles, setSelectedWBFiles] = useState([]);
        const [openWBComputeDialog, setOpenWBComputeDialog] = useState(false);
        const [selectedWBComputeProject, setSelectedWBComputeProject] = useState(null);
        const [computeFiles, setComputeFiles] = useState([]);
        const [isClosestWP, setIsClosestWP] = useState(true);
        const [geeAccounts, setGeeAccounts] = useState([]);
        const [selectedGEEAccount, setSelectedGEEAccount] = useState("");
        const [disabledProjectsApi, setDisabledProjectsApi] = useState([]);
        const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);
        const [selectedSettingsProject, setSelectedSettingsProject] = useState(null);
        const [projects, setProjects] = useState([]);
    const [bbox, setBBox] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
const [openEditMemberModal, setOpenEditMemberModal] = useState(false);

    const USERS_PER_PAGE = 10;
    const isSuperAdmin = currentUser?.user?.is_superadmin;
      // filters
      const [anchorEl, setAnchorEl] = useState(null);
      const [filterType, setFilterType] = useState("");
      const [searchText, setSearchText] = useState("");
      const [selectedState, setSelectedState] = useState("");
      const [selectedStatus, setSelectedStatus] = useState("");
      const [selectedAppType, setSelectedAppType] = useState("");
      const [selectedOrganization, setSelectedOrganization] = useState("");

    useEffect(() => {
      fetchUsers();
      fetchUserGroups();
      fetchProjectUsers();
    }, []);

      useEffect(() => {
        const fetchGEEAccounts = async () => {
          const token = sessionStorage.getItem("accessToken");
          try {
            const response = await fetch(
              `${process.env.REACT_APP_BASEURL}api/v1/geeaccounts/`,
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
            setGeeAccounts(data);
          } catch (error) {
            console.error("Error fetching GEE accounts:", error);
          }
        };
    
        fetchGEEAccounts();
      }, []);

      const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/users/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          console.log("Users API", data);
          setUsers(data || []);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };

     const fetchUserGroups = async () => {
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

        const data = await response.json();

        console.log("Groups API:", data);

        setUserGroups(data || []);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
      }; 

      const fetchProjectUsers = async () => {
        try {
          const token = sessionStorage.getItem("accessToken");
          const response = await fetch(
            `${process.env.REACT_APP_BASEURL}/api/v1/projects/${project?.id}/users/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          console.log("Project Users API", data);
          setProjectUsers(data || []);
        } catch (error) {
          console.error("Error fetching project users:", error);
        }
      }

      const handleUpdateRole = async (user) => {
  try {
    const token = sessionStorage.getItem("accessToken");

    const response = await fetch(
      `${process.env.REACT_APP_BASEURL}/api/v1/projects/${project.id}/users/${user.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.user_id,
          group_id: Number(selectedRole),        }),
          }
    );

    if (!response.ok) {
      throw new Error("Failed to update role");
    }
const result = await response.json();
    console.log("PATCH Response", result);
    await fetchProjectUsers();

    setEditingUserId(null);

    alert("Role updated successfully");
  } catch (error) {
    console.error(error);
    alert("Failed to update role");
  }
};

const handleDeleteUser = async (user) => {
  const confirmDelete = window.confirm(
    `Remove ${user.username} from this project?`
  );

  if (!confirmDelete) return;

  try {
    const token = sessionStorage.getItem("accessToken");

    const response = await fetch(
      `${process.env.REACT_APP_BASEURL}/api/v1/projects/${project.id}/users/${user.id}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove member");
    }

    await fetchProjectUsers();

    alert("Member removed successfully");
  } catch (error) {
    console.error(error);
    alert("Failed to remove member");
  }
};

const handleAddMember = async (user) => {
  try {
    const roleId = selectedRoles[user.id];

    if (!roleId) {
      alert("Please select a role");
      return;
    }

    const token = sessionStorage.getItem("accessToken");

    const response = await fetch(
      `${process.env.REACT_APP_BASEURL}/api/v1/projects/${project.id}/users/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: user.id,
          group: roleId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to assign user");
    }

    await fetchProjectUsers();
    alert("Member assigned successfully");
  } catch (error) {
    console.error("Add Member Error:", error);
    alert("Failed to assign member");
  }
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

  const handleOpenCE = (project) => {
    setSelectedCEProject(project);
    setSelectedCEFiles([]);
    setOpenCEDialog(true);
  };

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

  const handleCEFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => f.name.endsWith(".csv"));

    if (!valid.length) return alert("Please upload valid CSV files");

    setSelectedCEFiles(valid);
  };

  const handleRemoveCEFile = (index) => {
    setSelectedCEFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadCE = async () => {
    if (selectedCEFiles.length === 0) {
      return alert("Please select CSV files first");
    }

    const formData = new FormData();
    selectedCEFiles.forEach((f) => formData.append("files[]", f));
    formData.append("project_id", selectedCEProject.id);

    try {
      const token = sessionStorage.getItem("accessToken");

      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/map_users_to_community/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      setToast({
        open: true,
        message: "Members uploaded successfully!",
        severity: "success",
      });

      setOpenCEDialog(false);
    } catch (err) {
      setToast({
        open: true,
        message: "Failed to upload members!",
        severity: "error",
      });
    }
  };

  const handleOpenWB = (project) => {
    setSelectedWBProject(project);
    setSelectedWBFiles([]);
    setOpenWBDialog(true);
  };

  const handleWBFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(
      (f) => f.name.endsWith(".xlsx") || f.name.endsWith(".xls")
    );

    if (!valid.length) {
      alert("Please upload valid Excel files (.xls / .xlsx)");
      return;
    }

    setSelectedWBFiles(valid);
  };

  const handleRemoveWBFile = (index) => {
    setSelectedWBFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadWB = async () => {
    if (!selectedWBFiles.length) {
      alert("Please select Excel files first");
      return;
    }

    if (!selectedGEEAccount) {
      alert("Please select GEE account.");
      return;
    }

    const formData = new FormData();
    selectedWBFiles.forEach((f) => formData.append("files", f));
    formData.append("gee_account_id", selectedGEEAccount);
    formData.append("project_id", selectedWBProject.id);
    formData.append("is_closest_wp", true);
    formData.append("is_lulc_required", true);
    formData.append("is_processing_required", true);


    try {
      const token = sessionStorage.getItem("accessToken");

      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${selectedWBProject.id}/waterrejuvenation/excel/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      setToast({
        open: true,
        message: "Excel uploaded successfully!",
        severity: "success",
      });

      setOpenWBDialog(false);
    } catch (err) {
      setToast({
        open: true,
        message: "Failed to upload Excel!",
        severity: "error",
      });
    }
  };

  const handleOpenSettings = (e, project) => {
    setSelectedSettingsProject(project);
    setSettingsMenuAnchor(e.currentTarget);
  };

  const handleCloseSettings = () => {
    setSettingsMenuAnchor(null);
    setSelectedSettingsProject(null);
  };

  const handleToggleProject = async () => {
    if (!selectedSettingsProject) return;

    const token = sessionStorage.getItem("accessToken");
    const isEnabled = selectedSettingsProject.enabled;
    const endpoint = isEnabled ? "disable" : "enable";

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${selectedSettingsProject.id}/${endpoint}/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to toggle project");

      const updatedProject = await res.json();

      if (updatedProject.enabled === true) {
        //  Disabled → Enabled
        setDisabledProjectsApi(prev =>
          prev.filter(p => p.id !== updatedProject.id)
        );

        setProjects(prev => [...prev, updatedProject]);
      } else {
        //  Enabled → Disabled
        setProjects(prev =>
          prev.filter(p => p.id !== updatedProject.id)
        );

        setDisabledProjectsApi(prev => [...prev, updatedProject]);
      }

      handleCloseSettings();
    } catch (err) {
      console.error(err);
      alert("Failed to update project status");
    }
  };

  const handleOpenWBCompute = (project) => {
    setSelectedWBComputeProject(project);
    setComputeFiles([]);
    setIsClosestWP(true);
    setOpenWBComputeDialog(true);
  };

  const handleComputeFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(
      (f) => f.name.endsWith(".xlsx") || f.name.endsWith(".xls")
    );

    if (!valid.length) return alert("Please upload valid Excel files");
    setComputeFiles(valid);
  };

  const handleRemoveComputeFile = (index) => {
    setComputeFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleComputeWaterbody = async () => {
    if (!computeFiles.length) return alert("Please select an Excel file!");

    const formData = new FormData();
    computeFiles.forEach((f) => formData.append("file", f));
    formData.append("gee_account_id", selectedGEEAccount);
    formData.append("is_closest_wp", true);
    formData.append("is_processing_required", true);
    formData.append("is_lulc_required", true);
    formData.append("is_compute", true);
    try {
      const token = sessionStorage.getItem("accessToken");


      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${selectedWBComputeProject.id}/waterrejuvenation/excel/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Compute failed");

      alert("Compute started successfully!");
      setOpenWBComputeDialog(false);
    } catch (err) {
      alert("Failed to initiate compute");
    }
  };

  const handleViewStats = async () => {
    if (!selectedSettingsProject) return;

    try {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_uploaded_result/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            project_id: selectedSettingsProject.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download stats file");
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Optional dynamic filename
      const fileName = `${selectedSettingsProject.name}_stats.xlsx`;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      handleCloseSettings();

    } catch (error) {
      console.error("Error downloading stats:", error);
      alert("Failed to download stats file");
    }
  };

    const handleGEEAccountChange = (e) => {
    setSelectedGEEAccount(e.target.value);
  };

const assignedUserIds = projectUsers.map(
  (pu) => pu.user_id
);

const assignedUsers = users.filter((user) =>
  projectUsers.some((pu) => pu.user_id === user.id)
);

const unassignedUsers = users.filter(
  (user) => !projectUsers.some((pu) => pu.user_id === user.id)
);

const filteredUnassignedUsers = unassignedUsers.filter((user) =>
  user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
  `${user.first_name} ${user.last_name}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);

const totalPages = Math.ceil(
  filteredUnassignedUsers.length / USERS_PER_PAGE
);

const paginatedUnassignedUsers = filteredUnassignedUsers.slice(
  (unassignedPage - 1) * USERS_PER_PAGE,
  unassignedPage * USERS_PER_PAGE
);

console.log("Assigned Users", assignedUserIds);

    return (
    <div className="p-6">
<div className="flex items-center justify-between mb-6 mt-12">
  <button
    onClick={() =>
      navigate("/dashboard", {
        state: {
          selectedProjectId: project?.id,
          currentPage: currentPageFromState,
        },
      })
    }
    className="flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
  >
    ← Back
  </button>

  <h1 className="text-2xl font-bold text-purple-600">
    Project Members
  </h1>

  <button
    onClick={() =>
      navigate(`/projects/add`, {
        state: { project ,isEdit:true},
      })
    }
    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
  >
    <Edit2 size={16} />
    Edit Project
  </button>
</div>
        <table className="min-w-full bg-white rounded-lg shadow mt-6">
  <thead className="bg-purple-100">
    <tr>
      <th className="px-4 py-3 text-left">Name</th>
      <th className="px-4 py-3 text-left">App Type</th>
      <th className="px-4 py-3 text-left">State</th>
      <th className="px-4 py-3 text-left">Organization</th>
      <th className="px-4 py-3 text-left">Actions</th>
    </tr>
  </thead>

  <tbody>
    <tr className="border-t">
      <td className="px-4 py-3">{project?.name}</td>
      <td className="px-4 py-3">{project?.app_type_display=== "Watershed Planning" ? "NRM Plans via Commons connect" : project?.app_type_display || "N/A"}</td>
      <td className="px-4 py-3">{project?.state_name}</td>
      <td className="px-4 py-3">{project?.organization_name}</td>

      <td className="px-4 py-3">
        {/* Plantation */}
                            {project.app_type === "plantation" && (
                              <>
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                     onClick={() =>
                                      navigate(`/projects/${project.id}/action`, {
                                        state: { project },
                                      })
                                    }
                                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => handleViewGeoJSON(project)}
                                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                                  >
                                    View Layer
                                  </button>

                                  <button
                                    onClick={() => handleDownloadGeoJSON(project)}
                                    className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200"
                                  >
                                    Download GeoJSON
                                  </button>
                                </div>
                              </>
                            )}
                            {/* Waterbody */}
                            {project.app_type === "waterbody" && (
                              <>
                                {/* Upload Excel – ALL users */}
                               <button
                                  onClick={() => handleOpenWB(project)}
                                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                >
                                  Upload Excel
                                </button>
                                {/* Compute – ONLY Super Admin */}
                                {isSuperAdmin && (
                                    <button
                                      onClick={() => handleOpenWBCompute(project)}
                                      className="ml-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                                    >
                                      Compute
                                    </button>
                                )}
                              </>
                            )}

                            {/* Community Engagement */}
                            {project.app_type === "community_engagement" && (
                              <button
                                onClick={() => handleOpenCE(project)}
                                className="px-3 py-1 text-sm border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50"
                              >
                                Upload CSV
                              </button>

                            )}
                            {(project.app_type === "plantation" || project.app_type === "waterbody") && isSuperAdmin && (
                              <button
                                onClick={(e) => handleOpenSettings(e, project)}
                                className="px-3 py-1 text-sm border border-gray-500 text-gray-700 rounded-md hover:bg-gray-100"
                              >
                                Settings
                              </button>
                            )}
      </td>
    </tr>
  </tbody>
</table>

  <>
    {/* Assigned Members */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-purple-700">
          Assigned Users ({assignedUsers.length})
        </h3>
      </div>

      <div className="overflow-hidden border border-green-200 rounded-xl">
        <div className="grid grid-cols-4 bg-green-50 px-6 py-4 font-semibold text-green-700">
          <div>Username</div>
          <div>Full Name</div>
          <div>Role</div>
          <div>Action</div>
        </div>

        {assignedUsers.map((user) => {
          const assignedProjectUser = projectUsers.find(
            (pu) => pu.user_id === user.id
          );

          return (
            <div
              key={user.id}
              className="grid grid-cols-4 items-center px-6 py-4 border-t"
            >
              <div>{user.username}</div>

              <div>
                {user.first_name} {user.last_name}
              </div>

              <div>
                {editingUserId === assignedProjectUser.id ? (
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    {userGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name === "App User"
                          ? "Facilitator/CRP"
                          : group.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  assignedProjectUser.group_name === "App User"
                    ? "Facilitator/CRP"
                    : assignedProjectUser.group_name
                )}
              </div>

              <div className="flex gap-3 items-center">
                {editingUserId === assignedProjectUser.id ? (
                  <button
                    onClick={() => handleUpdateRole(assignedProjectUser)}
                    className="text-purple-600"
                  >
                    <Check size={18} />
                  </button>
                ) : (
                  <button
                    className="text-blue-600"
                     onClick={() => {
                      setSelectedMember(user);
                      setOpenEditMemberModal(true);
                    }}
                  >
                    <Edit2 size={18} />
                  </button>
                )}

                <button
                  className="text-red-600"
                  onClick={() => handleDeleteUser(assignedProjectUser)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Unassigned Members */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-700">
          Unassigned Users ({paginatedUnassignedUsers.length})
        </h3>
        <input
          type="text"
          placeholder="Search by username or name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setUnassignedPage(1);
          }}
          className="w-full md:w-80 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="overflow-hidden border border-gray-200 rounded-xl">
        <div className="grid grid-cols-4 bg-slate-50 px-6 py-4 font-semibold text-slate-700">
          <div>Username</div>
          <div>Full Name</div>
          <div>Role</div>
          <div>Action</div>
        </div>

        {paginatedUnassignedUsers.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-4 items-center px-6 py-4 border-t"
          >
            <div>{user.username}</div>

            <div>
              {user.first_name} {user.last_name}
            </div>

            <div>
              <select
                value={selectedRoles[user.id] || ""}
                onChange={(e) =>
                  setSelectedRoles({
                    ...selectedRoles,
                    [user.id]: e.target.value,
                  })
                }
                className="border rounded px-2 py-1"
              >
                <option value="">Select Role</option>

                {userGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name === "App User"
                      ? "Facilitator/CRP"
                      : group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={() => handleAddMember(user)}
                className="bg-purple-600 text-white px-3 py-1 rounded"
              >
                Assign
              </button>
            </div>
          </div>
        ))}

          {totalPages > 1 && (
  <div className="flex justify-end items-center gap-2 p-4 border-t">
    <button
      onClick={() => setUnassignedPage((prev) => Math.max(prev - 1, 1))}
      disabled={unassignedPage === 1}
      className={`px-3 py-1 rounded ${
        unassignedPage === 1
          ? "bg-gray-200 cursor-not-allowed"
          : "bg-purple-500 text-white hover:bg-purple-600"
      }`}
    >
      Previous
    </button>

    <span className="px-3">
      Page {unassignedPage} of {totalPages}
    </span>

    <button
      onClick={() =>
        setUnassignedPage((prev) =>
          Math.min(prev + 1, totalPages)
        )
      }
      disabled={unassignedPage === totalPages}
      className={`px-3 py-1 rounded ${
        unassignedPage === totalPages
          ? "bg-gray-200 cursor-not-allowed"
          : "bg-purple-500 text-white hover:bg-purple-600"
      }`}
    >
      Next
    </button>
  </div>
)}
      </div>
    </div>
  </>

      {/* Shared Popover */}
   
      <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={handleCloseSettings}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2, minWidth: 220 }
        }}
      >
        <MenuItem disabled sx={{ fontWeight: 600 }}>
          {selectedSettingsProject?.name}
        </MenuItem>

        <MenuItem sx={{ display: "flex", justifyContent: "space-between" }}>
          <span className="text-gray-700 text-sm">Enabled</span>
          <Switch
            checked={selectedSettingsProject?.enabled === true}
            onChange={handleToggleProject}
            color="primary"
          />

        </MenuItem>
        <MenuItem onClick={handleViewStats}>
          <BarChart3 size={18} className="mr-2 text-blue-600" />
          View Stats
        </MenuItem>

      </Menu>

      <Dialog
        open={openCEDialog}
        onClose={() => setOpenCEDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Manage Community – {selectedCEProject?.name}
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>

            {/* File Input */}
            <input
              id="ce-upload"
              type="file"
              accept=".csv"
              multiple
              hidden
              onChange={handleCEFileSelect}
            />
            <label htmlFor="ce-upload">
              <Box
                className="cursor-pointer border border-blue-400 text-blue-600 p-3 rounded-lg text-center hover:bg-blue-50"
              >
                Select CSV Files
              </Box>
            </label>

            {/* Selected Files */}
            {selectedCEFiles.length > 0 && (
              <Box className="bg-gray-100 p-3 rounded-lg">
                {selectedCEFiles.map((f, i) => (
                  <Box
                    key={i}
                    className="flex justify-between items-center p-2 border-b last:border-none"
                  >
                    {f.name}
                    <IconButton size="small" color="error" onClick={() => handleRemoveCEFile(i)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={selectedCEFiles.length === 0}
              onClick={handleUploadCE}
            >
              Upload Members
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openWBDialog}
        onClose={() => setOpenWBDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Waterbody Excel – {selectedWBProject?.name}
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>

            {/* File Input */}
            <input
              id="wb-upload"
              type="file"
              accept=".xls,.xlsx"
              multiple
              hidden
              onChange={handleWBFileSelect}
            />

            <label htmlFor="wb-upload">
              <Box className="cursor-pointer border border-blue-400 text-blue-600 p-3 rounded-lg text-center hover:bg-blue-50">
                Select Excel Files
              </Box>
            </label>

            {/* Selected Files */}
            {selectedWBFiles.length > 0 && (
              <Box className="bg-gray-100 p-3 rounded-lg">
                {selectedWBFiles.map((f, i) => (
                  <Box
                    key={i}
                    className="flex justify-between items-center p-2 border-b last:border-none"
                  >
                    {f.name}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveWBFile(i)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={selectedWBFiles.length === 0}
              onClick={handleUploadWB}
            >
              Upload Excel
            </Button>

          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openWBComputeDialog}
        onClose={() => setOpenWBComputeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Compute Waterbody – {selectedWBComputeProject?.name}
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Upload */}
            <input
              id="wb-compute-upload"
              type="file"
              accept=".xls,.xlsx"
              multiple
              hidden
              onChange={handleComputeFileSelect}
            />

            <label htmlFor="wb-compute-upload">
              <Box className="cursor-pointer border border-blue-400 text-blue-600 p-3 rounded-lg text-center hover:bg-blue-50">
                Select Excel Files
              </Box>
            </label>

            {/* Selected Files */}
            {computeFiles.length > 0 && (
              <Box className="bg-gray-100 p-3 rounded-lg">
                {computeFiles.map((f, i) => (
                  <Box
                    key={i}
                    className="flex justify-between items-center p-2 border-b last:border-none"
                  >
                    {f.name}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveComputeFile(i)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {/* Toggle */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <span>Use Closest WP</span>
              <Switch
                checked={isClosestWP}
                onChange={() => setIsClosestWP(!isClosestWP)}
              />
            </Box>

            {/* Select GEE Account */}
            <Box display="flex" flexDirection="column" gap={1}>
              <label className="text-lg font-semibold mb-1">
                Select GEE Account:
              </label>

              <select
                value={selectedGEEAccount}
                onChange={handleGEEAccountChange}
                className="w-full px-4 py-3 border text-lg rounded-lg"
              >
                <option value="">Select GEE Account</option>

                {geeAccounts &&
                  Object.entries(geeAccounts).map(([email, accounts]) => (
                    <optgroup key={email} label={email}>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
            </Box>


            {/* Compute */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={!computeFiles.length}
              onClick={handleComputeWaterbody}
            >
              Compute
            </Button>
          </Box>
        </DialogContent>
      </Dialog>


<Dialog
  open={openAddMemberModal}
  onClose={() => setOpenAddMemberModal(false)}
  maxWidth="md"
  fullWidth
>
  <DialogContent>
    <ProjectMemberRegistration
      project={project}
      currentUser={currentUser}
      onClose={() => setOpenAddMemberModal(false)}
      isEdit={true}
      onSuccess={() => {
        fetchUsers();
        fetchProjectUsers();
        setOpenAddMemberModal(false);
      }}
    />
  </DialogContent>
</Dialog>

<Dialog
  open={openEditMemberModal}
  onClose={() => setOpenEditMemberModal(false)}
  maxWidth="md"
  fullWidth
>
  <DialogContent>
    <ProjectMemberRegistration
      project={project}
      currentUser={currentUser}
      member={selectedMember}
      isEdit={true}
      onClose={() => setOpenEditMemberModal(false)}
      onSuccess={() => {
        fetchUsers();
        fetchProjectUsers();
        setOpenEditMemberModal(false);
      }}
    />
  </DialogContent>
</Dialog>
    </div>
    );
};

export default ProjectMembers;