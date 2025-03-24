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
  Paper,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
} from "@mui/material";
// import { Server } from "lucide-react";
import { CircuitBoard } from "lucide-react";
import SyncIcon from "@mui/icons-material/Sync";
import FunctionsIcon from "@mui/icons-material/Functions";

import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import PlantationAssessment from "./plantationAssessment";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";
import { Tooltip, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CalculateIcon from "@mui/icons-material/Calculate";

const ProjectDashboard = ({ closeModal, currentUser, onClose }) => {
  console.log(currentUser);
  const organizationName = currentUser?.user?.organization_name;
  const [isLayerAvailable, setIsLayerAvailable] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [appTypes, setAppTypes] = useState([]);
  const [bbox, setBBox] = useState(null);
  const [openDialog, setOpenDialog] = useState({ projectId: null, type: null });

  const openModal = (dialogType) => setOpenDialog(dialogType);
  // const closeModal = () => setOpenDialog(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    project_app_id: 1,
    state: "telangana",
    start_year: 2017,
    end_year: 2023,
  });

  useEffect(() => {
    console.log("Fetching projects...");

    const fetchProjects = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        console.log("Token:", token);

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

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Projects:", data);

        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleOpenDialog = (project) => {
    setSelectedProject(project); // Store the whole project object
    setSelectedFiles([]);
    console.log("Selected Project:", project); // Log the entire project
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedFiles([]);
  };

  const handleClose = () => {
    setSelectedProject(null);
    setTabIndex(0);
    setIsDialogOpen(false);
  };

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handlefileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.name.endsWith(".kml"));

    if (validFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    } else {
      alert("Please upload valid KML files.");
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUploadKml = async () => {
    console.log(selectedProject.id);
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
        `${process.env.REACT_APP_BASEURL}/api/v1/projects/${selectedProject.id}/plantation/kml/`,
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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      setToast({
        open: true,
        message:
          "KML file uploaded successfully! It may take 5-10 minutes for processing before it becomes visible.",
        severity: "success",
      });
      setSelectedFiles([]); // Clear selected files after upload
      setIsLayerAvailable(false); // Disable View button initially
    } catch (error) {
      console.error("Error uploading files:", error);
      setToast({
        open: true,
        message: "Failed to upload KML file!",
        severity: "error",
      });
    }
  };
  const handleViewEditProfile = (project) => {
    setSelectedProject(project);
    setIsProfileDialogOpen(true);
  };
  const handleOpenDownloadDialog = (project) => {
    setSelectedProject(project);
    setIsDownloadDialogOpen(true);
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

    // Extract required fields from the project
    const { state, appTypes, id } = project;
    const appTypeId = appTypes?.length > 0 ? appTypes[0].id : null; // Assuming we need the first app type ID

    if (!state || !appTypeId) {
      console.error("❌ Missing required project details.");
      alert("Project data is incomplete. Please check.");
      return;
    }

    // Construct the formData object
    const formData = {
      project_app_id: id,
      state: state,
      start_year: 2017, // Modify as needed
      end_year: 2023, // Modify as needed
    };

    console.log("📤 Sending formData:", formData); // Debugging output

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/plantation_site_suitability/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Compute API Response:", result);

      alert("Compute successful!");
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
    console.log(project);
    const organizationName = project.organization_name;
    const projectName = project.name;
    const formattedOrganizationName = organizationName
      .replace(/\s+/g, "_")
      .toLowerCase();
    const formattedProjectName = projectName.replace(/\s+/g, "_").toLowerCase();

    const wfsurl = `${process.env.REACT_APP_IMAGE_LAYER_URL}/plantation/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=plantation%3Acfpt_infoplantation_suitability&outputFormat=application%2Fjson`;
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
      console.log(dynamicBbox);

      setBBox(extent);
    } catch (error) {}
    // const url = `${process.env.REACT_APP_IMAGE_LAYER_URL}/${workspace}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${workspace}%3A${dynamicEnd}&bbox=${dynamicBbox}&width=768&height=431&srs=EPSG%3A4326&styles=&format=application/openlayers`;
    const geojsonViewUrl = `https://geoserver.core-stack.org:8443/geoserver/plantation/wms?service=WMS&version=1.1.0&request=GetMap&layers=plantation%3A${formattedOrganizationName}_${formattedProjectName}_suitability&bbox=${dynamicBbox}&width=768&height=330&srs=EPSG%3A4326&styles=&format=application/openlayers`;

    https: window.open(geojsonViewUrl, "_blank");

    console.log("Checking GeoJSON layer:", geojsonViewUrl);

    try {
      const response = await fetch(geojsonViewUrl, { method: "HEAD" }); // Only fetch headers

      if (
        response.ok &&
        response.headers.get("Content-Type")?.includes("text/html")
      ) {
        window.open(geojsonViewUrl, "_blank");
      } else {
        alert("Layer is not available. Please wait for some time.");
      }
    } catch (error) {
      console.error("Error checking GeoJSON layer:", error);
      toast.error("An error occurred while fetching the layer.");
    }
  };

  const handleDownloadGeoJSON = async (organization, project) => {
    const formattedOrganizationName = organizationName
      .replace(/\s+/g, "_")
      .toLowerCase();
    const formattedProjectName = selectedProject?.name
      ?.replace(/\s+/g, "_")
      .toLowerCase();
    console.log(formattedOrganizationName, formattedProjectName);

    const geojsonUrl = `https://geoserver.core-stack.org:8443/geoserver/plantation/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=plantation%3A${formattedOrganizationName}_${formattedProjectName}_suitability&maxFeatures=50&outputFormat=application%2Fjson`;
    console.log(geojsonUrl);

    https: try {
      const response = await fetch(geojsonUrl);
      const contentType = response.headers.get("content-type");

      if (!response.ok) throw new Error("Failed to fetch GeoJSON");

      // Check for XML response, which usually indicates an error
      if (contentType && contentType.includes("text/xml")) {
        console.warn("Received XML response instead of JSON.");
        alert("Data not available yet. Please check after some time.");
        return;
      }

      const data = await response.json();
      console.log("GeoJSON Data:", data);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // Avoid invalid filename characters
      const fileName = `${formattedOrganizationName}_${formattedProjectName}_${timestamp}.geojson`;

      // Create a Blob and trigger download
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
                  {projects.map((project) => (
                    <Card
                      key={project.id}
                      className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-4xl overflow-hidden border border-gray-200"
                    >
                      <CardContent>
                        <div className="flex flex-col items-start space-y-4">
                          {/* Project Info Section */}
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
                              {project.appTypes?.length > 0
                                ? project.appTypes
                                    .map((app) => app.app_type_display)
                                    .join(", ")
                                : "No App Type"}
                            </span>
                          </div>
                          {/* Button Section */}
                          <div className="flex items-center gap-3 mt-2 justify-start w-full">
                            <Tooltip title="Upload KML" arrow>
                              <Button
                                variant="outlined"
                                color="primary"
                                className="rounded-md shadow p-3 text-sm"
                                onClick={() => handleOpenDialog(project)}
                              >
                                <CloudUploadIcon />
                              </Button>
                            </Tooltip>

                            <Tooltip title="View/Edit Profile" arrow>
                              <Button
                                variant="outlined"
                                color="secondary"
                                className="rounded-md shadow p-3 text-sm"
                                onClick={() => handleViewEditProfile(project)}
                              >
                                <EditIcon />
                              </Button>
                            </Tooltip>

                            <Tooltip title="Download GeoJSON" arrow>
                              <Button
                                variant="outlined"
                                color="primary"
                                className="rounded-md shadow p-3 text-sm"
                                onClick={() =>
                                  handleOpenDownloadDialog(project)
                                }
                              >
                                <FileDownloadIcon />
                              </Button>
                            </Tooltip>

                            <Tooltip title="Compute" arrow>
                              <Button
                                variant="outlined"
                                color="secondary"
                                className="rounded-md shadow p-3 text-sm"
                                onClick={() => handleCompute(project)}
                              >
                                {/* <Server /> */}
                                <FunctionsIcon />
                              </Button>
                            </Tooltip>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Move Dialog Outside the Loop */}
          <Dialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            sx={{
              "& .MuiPaper-root": {
                borderRadius: 4,
                padding: "20px",
                boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <DialogTitle>
              <Typography variant="h6" fontWeight="bold">
                Upload KML for Project:{" "}
                <span className="text-blue-600">{selectedProject?.name}</span>
              </Typography>
              <IconButton
                onClick={handleCloseDialog}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <div className="flex flex-col items-center space-y-4">
                {/* Custom File Input */}
                <label htmlFor="kml-upload" className="w-full">
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
                    }}
                  >
                    <CloudUploadIcon sx={{ marginRight: "8px" }} />
                    Choose KML Files
                  </Button>
                </label>

                {/* Display Selected File Names */}
                {selectedFiles.length > 0 && (
                  <div className="w-full bg-gray-100 p-2 rounded-lg text-center">
                    {selectedFiles.map((file, index) => (
                      <Typography key={index} variant="body2">
                        📂 {file.name}
                      </Typography>
                    ))}
                  </div>
                )}
                {/* Upload Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textTransform: "none",
                  }}
                  onClick={handleUploadKml}
                >
                  <CloudUploadIcon sx={{ marginRight: "8px" }} />
                  Upload
                </Button>
              </div>
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
            open={isProfileDialogOpen}
            onClose={() => setIsProfileDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h6" fontWeight="bold">
                Edit Profile - {selectedProject?.name}
              </Typography>
              <IconButton
                onClick={() => setIsProfileDialogOpen(false)}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {selectedProject && (
                <PlantationAssessment
                  isEmbedded={true}
                  project={selectedProject}
                />
              )}
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
