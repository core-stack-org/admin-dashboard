import React, { useState, useEffect, Fragment } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  TableCell,
  CircularProgress,
  Table,
  TableRow,
  TableBody,
  TableHead,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close";
import PlantationAssessment from "./plantationAssessment";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";
import { Tooltip, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Project from "../pages/project.js";
import { FolderIcon } from "lucide-react";
import PlanCreation from "./planCreation.js";

const ProjectDashboard = ({ closeModal, currentUser, onClose, statesList }) => {
  const organizationName = currentUser?.user?.organization_name;
  const [isLayerAvailable, setIsLayerAvailable] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditDialogOpenForCE, setIsEditDialogOpenForCE] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [bbox, setBBox] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpenEditDialog = (project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleOpenEditDialogForCE = (project) => {
    setSelectedProject(project);
    setIsEditDialogOpenForCE(true);
  };

  // Add this function to remove a file by index
  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setActiveTab(0);
  };

  const handleCloseEditDialogForCE = () => {
    setIsEditDialogOpenForCE(false);
    setActiveTab(0);
  };

  const getStateName = (stateId) => {
    const state = (statesList || []).find((s) => s.id === stateId);

    return state ? state.state_name : "Unknown State";
  };

  useEffect(() => {
    getStateName();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
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
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    handleViewPlan();
  }, []);

  const handleCreateProject = () => {
    console.log("Create Project clicked");
    setShowProjectForm(true);
  };
  if (showProjectForm) {
    return (
      <Project
        statesList={statesList}
        closeModal={closeModal}
        currentUser={currentUser}
      />
    );
  }

  const handlefileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.name.endsWith(".kml"));

    if (validFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    } else {
      alert("Please upload valid KML files.");
    }
  };

  const handleCsvFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.name.endsWith(".csv"));

    if (validFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    } else {
      alert("Please upload valid CSV files.");
    }
  };


  const handleUploadKml = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setToast({
        open: true,
        message: "No files selected!",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    if (selectedFiles.length > 1) {
      selectedFiles.forEach((file) => {
        formData.append("files[]", file);
      });
    } else {
      formData.append("file", selectedFiles[0]);
    }

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${selectedProject.id}/plantation/kml/`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "420",
            // ❌ Don't add Content-Type manually for FormData
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, ${errorText}`);
      }
      const result = await response.json();
      setToast({
        open: true,
        message: "KML file uploaded successfully!",
        severity: "success",
      });
      setSelectedFiles([]);
      setIsLayerAvailable(false);
    } catch (error) {
      console.error("Error uploading files:", error);
      setToast({
        open: true,
        message: "Failed to upload KML file!",
        severity: "error",
      });
    }
  };


    const handleUploadCsv = async (selectedProject) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setToast({
        open: true,
        message: "No files selected!",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    if (selectedFiles.length > 1) {
      selectedFiles.forEach((file) => {
        formData.append("files[]", file);
      });
    } else {
      formData.append("file", selectedFiles[0]);
    }
    formData.append("project_id", selectedProject.id);

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/map_users_to_community/`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "420",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, ${errorText}`);
      }
      const result = await response.json();
      setToast({
        open: true,
        message: "CSV file uploaded successfully!",
        severity: "success",
      });
      setSelectedFiles([]);
      setIsLayerAvailable(false);
    } catch (error) {
      console.error("Error uploading files:", error);
      setToast({
        open: true,
        message: "Failed to upload CSV file!",
        severity: "error",
      });
    }
  };


  const handleCloseDownloadDialog = () => {
    setIsDownloadDialogOpen(false);
  };


  const handleCompute = async (project) => {
    if (!project) {
      console.error("❌ No project selected.");
      alert("Please select a project first.");
      return;
    }
    const matchedProject = projects.find((p) => p.id === project.id);

    if (!matchedProject) {
      console.error("❌ Project not found in updated projects state.");
      alert("Something went wrong. Please refresh and try again.");
      return;
    }
    // Extract required fields
    const { state, appTypes, id } = project;
    const state_name = matchedProject.state_name; // ✅ Get the correct state name
    const appTypeId = appTypes?.length > 0 ? appTypes[0].id : null;

    if (!state_name || !matchedProject.id) {
      console.error("❌ Missing required project details.");
      alert("Project data is incomplete. Please check.");
      return;
    }

    // Construct the formData object
    const formData = {
      project_id: matchedProject.id,
      state: state_name, // ✅ Use state_name instead of state ID
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
      console.error("❌ Error calling compute API:", error);
      alert("Failed to compute. Please try again.");
    }
  };

  // Function to close the toast
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleViewGeoJSON = async (project) => {
    const organizationName = project.organization_name;
    const projectName = project.name;

    const formattedOrganizationName = organizationName
      .replace(/\s+/g, "_")
      .toLowerCase();
    const formattedProjectName = projectName.replace(/\s+/g, "_").toLowerCase();
    console.log(formattedOrganizationName, formattedProjectName);

    const wfsurl = `${process.env.REACT_APP_IMAGE_LAYER_URL}plantation/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=plantation%3A${formattedOrganizationName}_${formattedProjectName}_suitability&outputFormat=application%2Fjson`;

    console.log(wfsurl);

    let dynamicBbox = "";
    try {
      const response = await fetch(wfsurl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const adminLayer = await response.json();
      console.log(adminLayer);

      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(adminLayer),
      });
      const extent = vectorSource.getExtent();

      dynamicBbox =
        extent[0] + "%2C" + extent[1] + "%2C" + extent[2] + "%2C" + extent[3];
      setBBox(extent);
      console.log(dynamicBbox);
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

  const handleUploadExcel = () => {
    console.log("Upload excel button clicked");
  };

  const handleViewPlan = async (project) => {
    setOpenDialog(true);
    setLoadingPlans(true);
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${project.id}/watershed/plans/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      console.log(data);
      setPlans(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      // toast.error("Error fetching plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  const handlePlanSaved = (savedPlan) => {
    console.log("Saved Plan:", savedPlan); // Debugging line
    setPlans((prevPlans) => {
      const planExists = prevPlans.some((plan) => plan.id === savedPlan.id);

      if (planExists) {
        console.log("Plan exists, updating:", savedPlan); // Debugging line
        // Update the plan with the new data
        return prevPlans.map((plan) =>
          plan.id === savedPlan.id ? { ...plan, ...savedPlan } : plan
        );
      } else {
        console.log("Plan doesn't exist, adding:", savedPlan); // Debugging line
        // Add the new plan to the list
        return [...prevPlans, savedPlan];
      }
    });
  };

  const handleEditPlan = (plan) => {
    setSelectedPlanId(plan.id);
    setOpenPlanDialog(true);
  };

  const handleCreatePlan = (id) => {
    setSelectedProject(id);
    setSelectedPlanId(null); // important to indicate create mode
    setOpenPlanDialog(true);
  };

  const handleExcelSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.name.endsWith(".xlsx"));

    if (validFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    } else {
      alert("Please upload valid xls files.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Projects</h2>
          <button
            onClick={() => {
              if (closeModal) closeModal();
              if (onClose) onClose();
            }}
            className="text-white hover:bg-blue-700 rounded-full p-2 focus:outline-none"
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

        <div className="p-6">
          <div className="flex flex-col">
            <div className="bg-gray-50 p-6 rounded-4xl border border-gray-300 shadow-md">
              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] py-10 space-y-6">
                      <p className="text-gray-600 text-lg font-semibold text-center">
                        🚫 No project available!! Please create new.
                      </p>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateProject}
                        className="rounded-lg px-6 py-2 text-white font-medium"
                      >
                        ➕ Create New Project
                      </Button>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <Card
                        key={project.id}
                        className="w-full cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-4xl overflow-hidden border border-gray-200"
                      >
                        <CardContent>
                          <div className="flex flex-col items-start space-y-4">
                            <div className="text-gray-700 text-sm flex items-center gap-4">
                              <span className="font-medium">
                                📌 Project Name:
                              </span>
                              <span className="font-semibold text-gray-900">
                                {project.name}
                              </span>
                            </div>
                            <div className="text-gray-700 text-sm flex items-center gap-4">
                              <span className="font-medium">🔗 App Type:</span>
                              <span className="font-semibold text-blue-600">
                                {project.app_type}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2 justify-start w-full">
                              {project.app_type === "plantation" ? (
                                <>
                                  <Tooltip title="Edit" arrow>
                                    <Button
                                      variant="outlined"
                                      color="secondary"
                                      className="rounded-md shadow p-3 text-sm"
                                      onClick={() =>
                                        handleOpenEditDialog(project)
                                      }
                                    >
                                      <EditIcon />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="View Layer" arrow>
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      className="rounded-md shadow p-3 text-sm"
                                      onClick={() => handleViewGeoJSON(project)}
                                    >
                                      <VisibilityIcon />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Download GeoJSON" arrow>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      className="rounded-md shadow p-3 text-sm"
                                      onClick={() =>
                                        handleDownloadGeoJSON(project)
                                      }
                                    >
                                      <FileDownloadIcon />
                                    </Button>
                                  </Tooltip>
                                </>
                              ) : project.app_type === "waterbody" ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    width: "100%",
                                  }}
                                >
                                  <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    id={`excel-upload-${project.id}`}
                                    style={{ display: "none" }}
                                    multiple
                                    onChange={(e) =>
                                      handleExcelSelect(e, project)
                                    }
                                  />
                                  <Tooltip title="Upload Excel" arrow>
                                    <label
                                      htmlFor={`excel-upload-${project.id}`}
                                    >
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        className="rounded-md shadow p-3 text-sm flex items-center"
                                        component="span"
                                      >
                                        <CloudUploadIcon />
                                      </Button>
                                    </label>
                                  </Tooltip>

                                  {selectedFiles.length > 0 && (
                                    <Box
                                      sx={{
                                        width: "100%",
                                        backgroundColor: "#f9f9f9",
                                        p: 2,
                                        borderRadius: "8px",
                                        boxShadow:
                                          "inset 0 0 5px rgba(0,0,0,0.1)",
                                      }}
                                    >
                                      {selectedFiles.map((file, index) => (
                                        <Box
                                          key={index}
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            mb: 1,
                                            backgroundColor: "#fff",
                                            "&:hover": {
                                              backgroundColor: "#f0f0f0",
                                            },
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              overflow: "hidden",
                                              flex: 1,
                                            }}
                                          >
                                            <FolderIcon
                                              sx={{ color: "#ffa000" }}
                                            />
                                            <Tooltip title={file.name}>
                                              <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{
                                                  maxWidth: "calc(100% - 40px)", // account for icon & delete
                                                  fontSize: "14px",
                                                }}
                                              >
                                                {file.name}
                                              </Typography>
                                            </Tooltip>
                                          </Box>
                                          <IconButton
                                            onClick={() =>
                                              handleRemoveFile(index)
                                            }
                                            size="small"
                                            color="error"
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      ))}
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{
                                          mt: 2,
                                          py: 1.5,
                                          fontWeight: 600,
                                          borderRadius: "8px",
                                          textTransform: "none",
                                        }}
                                        onClick={handleUploadExcel}
                                      >
                                        Upload
                                      </Button>
                                    </Box>
                                  )}
                                </Box>
                              ) : project.app_type === "watershed" ? (
                                <div className="flex items-center gap-2">
                                  <Tooltip title="View Plan" arrow>
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      className="rounded-md shadow p-3 text-sm"
                                      onClick={() => handleViewPlan(project)}
                                    >
                                      <VisibilityIcon />
                                    </Button>
                                  </Tooltip>
                                  <Dialog
                                    open={openDialog}
                                    onClose={() => setOpenDialog(false)}
                                    maxWidth="md"
                                    fullWidth
                                    PaperProps={{
                                      className: "rounded-xl shadow-lg",
                                    }}
                                  >
                                    <DialogTitle className="text-xl font-semibold px-6 pt-6 pb-2">
                                      🗂️ Plans for this Project
                                    </DialogTitle>

                                    <DialogContent
                                      dividers
                                      className="px-6 pb-4"
                                    >
                                      {loadingPlans ? (
                                        <div className="text-center py-10">
                                          <CircularProgress />
                                        </div>
                                      ) : plans.length === 0 ? (
                                        <p className="text-gray-500 text-center py-6">
                                          No plans found.
                                        </p>
                                      ) : (
                                        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                                          <Table size="small">
                                            <TableHead>
                                              <TableRow className="bg-gray-100">
                                                <TableCell className="font-semibold text-gray-700">
                                                  Plan Name
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-700">
                                                  Facilitator
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-700">
                                                  Village
                                                </TableCell>
                                                <TableCell
                                                  align="right"
                                                  className="font-semibold text-gray-700"
                                                >
                                                  Action
                                                </TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {plans.map((plan, index) => (
                                                <TableRow
                                                  key={plan.id}
                                                  className={
                                                    index % 2 === 0
                                                      ? "bg-white"
                                                      : "bg-gray-50"
                                                  }
                                                >
                                                  <TableCell>
                                                    {plan.plan}
                                                  </TableCell>
                                                  <TableCell>
                                                    {plan.facilitator_name ||
                                                      "—"}
                                                  </TableCell>
                                                  <TableCell>
                                                    {plan.village_name || "—"}
                                                  </TableCell>
                                                  <TableCell align="right">
                                                    <Tooltip
                                                      title="Edit Plan"
                                                      arrow
                                                    >
                                                      <IconButton
                                                        onClick={() =>
                                                          handleEditPlan(plan)
                                                        }
                                                        color="primary"
                                                      >
                                                        <EditIcon />
                                                      </IconButton>
                                                    </Tooltip>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      )}
                                    </DialogContent>

                                    <DialogActions className="px-6 pb-4">
                                      <Button
                                        onClick={() => setOpenDialog(false)}
                                        color="primary"
                                        variant="outlined"
                                        className="rounded-md"
                                      >
                                        Close
                                      </Button>
                                    </DialogActions>
                                  </Dialog>
                                  <Tooltip title="Create Plan" arrow>
                                    <Button
                                      variant="outlined"
                                      color="success"
                                      className="rounded-md shadow p-3 text-sm min-w-0"
                                      onClick={() =>
                                        handleCreatePlan(project.id)
                                      }
                                    >
                                      <AddIcon />
                                    </Button>
                                  </Tooltip>
                                  <Dialog
                                    open={openPlanDialog}
                                    onClose={() => {
                                      setOpenPlanDialog(false);
                                      setSelectedPlanId(null);
                                    }}
                                    fullWidth
                                    maxWidth="md"
                                  >
                                    <DialogContent>
                                      <PlanCreation
                                        onClose={() => {
                                          setOpenPlanDialog(false);
                                          setSelectedPlanId(null);
                                        }}
                                        projectId={project}
                                        planId={selectedPlanId}
                                        onPlanSaved={handlePlanSaved}
                                      />
                                    </DialogContent>
                                  </Dialog>

                                  {/* <Dialog
                                    open={open}
                                    onClose={handleClose}
                                    fullWidth
                                    maxWidth="md"
                                  >
                                    <DialogContent>
                                      <PlanCreation
                                        onClose={handleClose}
                                        projectId={project}
                                      />
                                    </DialogContent>
                                  </Dialog> */}
                                </div>
                              ) : project.app_type === "community_engagement" ? (
                                  <Tooltip title="Edit" arrow>
                                    <Button
                                      variant="outlined"
                                      color="secondary"
                                      className="rounded-md shadow p-3 text-sm"
                                      onClick={() =>
                                        handleOpenEditDialogForCE(project)
                                      }
                                    >
                                      <EditIcon />
                                    </Button>
                                  </Tooltip>
                              ) : null}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <Dialog
            open={isEditDialogOpen}
            onClose={handleCloseEditDialog}
            maxWidth="md"
            fullWidth
            sx={{
              "& .MuiDialog-paper": {
                minHeight: "450px",
                borderRadius: "12px",
              },
            }}
          >
            <DialogTitle sx={{ position: "relative", pb: 2 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ textAlign: "center" }}
              >
                Manage Project – {selectedProject?.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Follow these steps to complete the processing:
                <br />
                1. Select and upload KML files.
                <br />
                2. Review or update the project profile, then save it.
                <br />
                3. Click on <strong>Process KML</strong> to start processing.
              </Typography>

              <IconButton
                onClick={handleCloseEditDialog}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              sx={{
                backgroundColor: "#fafafa",
                borderRadius: 2,
                p: 3,
                border: "1px solid #ddd",
                mt: 1,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                textColor="primary"
                indicatorColor="primary"
                variant="fullWidth"
                sx={{
                  backgroundColor: "#f5f5f5",
                  borderBottom: "2px solid #e0e0e0",
                  "& .MuiTab-root": {
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    fontSize: "14px",
                    padding: "12px 16px",
                  },
                  "& .Mui-selected": {
                    color: "#1565c0",
                    fontWeight: "bold",
                  },
                  "& .MuiTabs-indicator": {
                    height: "3px",
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                <Tab label="Upload KML" />
                <Tab label=" Edit Profile" />
                <Tab label="Process KMLs" />
              </Tabs>

              <Box mt={3}>
                {/* Upload KML Tab */}
                {activeTab === 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <label htmlFor="kml-upload" style={{ width: "100%" }}>
                      <input
                        id="kml-upload"
                        type="file"
                        accept=".kml"
                        multiple
                        hidden
                        onChange={handlefileSelect}
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        component="span"
                        fullWidth
                        sx={{
                          padding: "12px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          textTransform: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CloudUploadIcon sx={{ marginRight: "8px" }} />
                        Choose KML Files
                      </Button>
                    </label>

                    {selectedFiles.length > 0 && (
                      <Box
                        sx={{
                          width: "100%",
                          backgroundColor: "#f4f4f4",
                          p: 2,
                          borderRadius: "8px",
                          textAlign: "center",
                        }}
                      >
                        {selectedFiles.length > 0 && (
                          <Box
                            sx={{
                              width: "100%",
                              backgroundColor: "#f4f4f4",
                              p: 2,
                              borderRadius: "8px",
                            }}
                          >
                            {selectedFiles.map((file, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "4px 8px",
                                  borderBottom:
                                    index !== selectedFiles.length - 1
                                      ? "1px solid #ccc"
                                      : "none",
                                }}
                              >
                                <Typography variant="body2">
                                  📂 {file.name}
                                </Typography>
                                <IconButton
                                  onClick={() => handleRemoveFile(index)}
                                  size="small"
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        width: "250px", // Keeping Upload button compact
                        alignSelf: "center",
                        padding: "12px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                      onClick={handleUploadKml}
                    >
                      Upload
                    </Button>
                    <Snackbar
                      open={toast.open}
                      autoHideDuration={6000}
                      onClose={handleCloseToast}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        right: 10,
                      }}
                    >
                      <Alert
                        onClose={handleCloseToast}
                        severity={toast.severity}
                        sx={{ width: "100%" }}
                      >
                        {toast.message}
                      </Alert>
                    </Snackbar>
                  </Box>
                )}

                {/* Profile Tab */}
                {activeTab === 1 && selectedProject && (
                  <PlantationAssessment
                    isEmbedded={true}
                    project={selectedProject}
                    currentUser={currentUser}
                    closeModal={handleCloseEditDialog}
                  />
                )}

                {/* Compute Tab */}
                {activeTab === 2 && (
                  <Box className="flex flex-col items-center justify-center">
                    <Typography
                      variant="body1"
                      className="text-gray-600 text-center"
                      sx={{ marginBottom: "32px" }} // Adds spacing between text and button
                    >
                      Click here to start processing the KMLs for this project.
                    </Typography>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleCompute(selectedProject)}
                      sx={{
                        padding: "12px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AutorenewIcon />
                      Process KMLs
                    </Button>
                  </Box>
                )}
              </Box>
              <Snackbar
                open={toast.open}
                autoHideDuration={6000}
                onClose={handleCloseToast}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }} // Move to bottom-right
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 10, // Position it on the right side
                }}
              >
                <Alert
                  onClose={handleCloseToast}
                  severity={toast.severity}
                  sx={{ width: "100%" }}
                >
                  {toast.message}
                </Alert>
              </Snackbar>
            </DialogContent>
          </Dialog>






          <Dialog
            open={isEditDialogOpenForCE}
            onClose={handleCloseEditDialogForCE}
            maxWidth="md"
            fullWidth
            sx={{
              "& .MuiDialog-paper": {
                minHeight: "450px", // Adjust the height as needed
                borderRadius: "12px", // Slightly rounded corners for better aesthetics
              },
            }}
          >
            <DialogTitle sx={{ position: "relative", pb: 2 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ textAlign: "center" }}
              >
                Manage Project – {selectedProject?.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Follow these steps:
                <br />
                1. Create a Community.
                <br />
                2. Add members to the Community.
              </Typography>

              <IconButton
                onClick={handleCloseEditDialogForCE}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              sx={{
                backgroundColor: "#fafafa",
                borderRadius: 2,
                p: 3,
                border: "1px solid #ddd",
                mt: 1,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                textColor="primary"
                indicatorColor="primary"
                variant="fullWidth"
                sx={{
                  backgroundColor: "#f5f5f5", // Light grey background
                  borderBottom: "2px solid #e0e0e0", // Divider line
                  "& .MuiTab-root": {
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    fontSize: "14px",
                    padding: "12px 16px",
                  },
                  "& .Mui-selected": {
                    color: "#1565c0", // Darker blue for selected tab
                    fontWeight: "bold",
                  },
                  "& .MuiTabs-indicator": {
                    height: "3px", // Thicker indicator
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                <Tab label="Add Member" />
              </Tabs>

              <Box mt={3}>
                {/* Add Member Tab */}
                {activeTab === 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <label htmlFor="csv-upload" style={{ width: "100%" }}>
                      <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        multiple
                        hidden
                        onChange={handleCsvFileSelect}
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        component="span"
                        fullWidth
                        sx={{
                          padding: "12px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          textTransform: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CloudUploadIcon sx={{ marginRight: "8px" }} />
                        Choose CSV Files
                      </Button>
                    </label>

                    {selectedFiles.length > 0 && (
                      <Box
                        sx={{
                          width: "100%",
                          backgroundColor: "#f4f4f4",
                          p: 2,
                          borderRadius: "8px",
                          textAlign: "center",
                        }}
                      >
                        {selectedFiles.length > 0 && (
                          <Box
                            sx={{
                              width: "100%",
                              backgroundColor: "#f4f4f4",
                              p: 2,
                              borderRadius: "8px",
                            }}
                          >
                            {selectedFiles.map((file, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "4px 8px",
                                  borderBottom:
                                    index !== selectedFiles.length - 1
                                      ? "1px solid #ccc"
                                      : "none",
                                }}
                              >
                                <Typography variant="body2">
                                  📂 {file.name}
                                </Typography>
                                <IconButton
                                  onClick={() => handleRemoveFile(index)}
                                  size="small"
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        width: "250px",
                        alignSelf: "center",
                        padding: "12px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                      onClick={() => handleUploadCsv(selectedProject)}
                    >
                      Upload
                    </Button>
                    <Snackbar
                      open={toast.open}
                      autoHideDuration={6000}
                      onClose={handleCloseToast}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        right: 10,
                      }}
                    >
                      <Alert
                        onClose={handleCloseToast}
                        severity={toast.severity}
                        sx={{ width: "100%" }}
                      >
                        {toast.message}
                      </Alert>
                    </Snackbar>
                  </Box>
                )}
              </Box>
              <Snackbar
                open={toast.open}
                autoHideDuration={6000}
                onClose={handleCloseToast}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }} // Move to bottom-right
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 10, // Position it on the right side
                }}
              >
                <Alert
                  onClose={handleCloseToast}
                  severity={toast.severity}
                  sx={{ width: "100%" }}
                >
                  {toast.message}
                </Alert>
              </Snackbar>
            </DialogContent>
          </Dialog>





          {/* Download GeoJSON Dialog */}
          <Dialog
            open={isDownloadDialogOpen}
            onClose={handleCloseDownloadDialog}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h6" fontWeight="bold">
                GeoJSON Options for{" "}
                <span className="text-blue-600">{selectedProject?.name}</span>
              </Typography>
              <IconButton
                onClick={handleCloseDownloadDialog}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex w-full gap-3">
                  {/* View GeoJSON */}
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{
                      padding: "12px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                    }}
                    onClick={() => handleViewGeoJSON(selectedProject)}
                  >
                    <VisibilityIcon sx={{ marginRight: "8px" }} />
                    View
                  </Button>

                  {/* Download GeoJSON */}
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      padding: "12px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                    }}
                    onClick={() => handleDownloadGeoJSON(selectedProject)}
                  >
                    <FileDownloadIcon sx={{ marginRight: "8px" }} />
                    Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
