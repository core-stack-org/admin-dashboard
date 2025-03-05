import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import PlantationAssessment from "./plantationAssessment";

const ProjectDashboard = ({ onProjectSelect = () => {} }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [appTypes, setAppTypes] = useState([]);

  useEffect(() => {
    console.log("fetching projects");
    const fetchProjects = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        console.log(token);
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
        console.log("Projects:", data);

        // Fetch app types for each project simultaneously
        const projectsWithAppTypes = await Promise.all(
          data.map(async (project) => {
            const appTypes = await fetchAppType(project.id);
            return { ...project, appTypes };
          })
        );

        console.log("Projects with App Types:", projectsWithAppTypes);
        setProjects(projectsWithAppTypes);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const fetchAppType = async (projectId) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/projects/${projectId}/apps/`,
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
      return data; // Just return the data, no state setting here
    } catch (error) {
      console.error("Error fetching app types:", error);
      return []; // Return an empty array in case of error
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
    fetchAppType(project.id);
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
    if (!selectedFiles || selectedFiles.length === 0) {
      console.error("No files selected.");
      return;
    }
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("file", file);
    });

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/projects/${selectedProject.id}/plantation/kml/`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "420", // Add any necessary headers here
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      setSelectedFiles([]); // Clear selected files after upload
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleViewGeoJSON = () => {};

  const handleDownloadGeoJSON = () => {};

  return (
    <div className="p-8 max-w-7xl mx-auto mt-16">
      <h1 className="text-3xl font-bold mb-8">Project Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
            onClick={() => handleProjectSelect(project)}
          >
            <CardContent>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Project name</span>
                  <span className="font-medium">{project.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Organization</span>
                  <span className="font-medium">
                    {project.organization_name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">App</span>
                  <span className="font-medium">
                    {project.appTypes && project.appTypes.length > 0
                      ? project.appTypes
                          .map((app) => app.app_type_display)
                          .join(", ")
                      : "No App Type"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isDialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Typography variant="h6" component="div">
            {selectedProject?.name || "Project Settings"}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ color: "grey.500" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
          >
            <Tab
              icon={<UploadFileIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label="Upload KML"
            />
            <Tab label="Edit Profile" />
            <Tab label="View GeoJSON" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {tabIndex === 0 && (
              <Box>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    textAlign: "center",
                    backgroundColor: "grey.50",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "grey.100",
                    },
                  }}
                >
                  <input
                    type="file"
                    accept=".kml"
                    multiple
                    onChange={handlefileSelect}
                    style={{ display: "none" }}
                    id="kml-file-input"
                  />
                  <label htmlFor="kml-file-input">
                    <Box sx={{ mb: 2 }}>
                      <UploadFileIcon
                        sx={{ fontSize: 40, color: "grey.600" }}
                      />
                    </Box>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      gutterBottom
                    >
                      Click to upload or drag and drop
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      KML files only
                    </Typography>
                  </label>
                </Paper>

                {selectedFiles.length > 0 && (
                  <Paper
                    sx={{
                      mt: 2,
                      p: 2,
                      backgroundColor: "grey.100", // Light grey for a softer UI
                      border: "1px solid",
                      borderColor: "grey.300", // Subtle border for separation
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
                          p: 1,
                          borderBottom:
                            index !== selectedFiles.length - 1
                              ? "1px solid #ddd"
                              : "none",
                        }}
                      >
                        <Typography variant="body1" color="primary.dark">
                          {file.name} - {(file.size / 1024).toFixed(2)} KB
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveFile(index)}
                          size="small"
                          sx={{ color: "primary.dark" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Paper>
                )}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <button
                    onClick={handleUploadKml}
                    disabled={selectedFiles.length === 0}
                    style={{
                      padding: "10px 20px",
                      backgroundColor:
                        selectedFiles.length > 0 ? "#1976d2" : "#b0bec5",
                      color: "white",
                      borderRadius: "8px",
                      border: "none",
                      cursor:
                        selectedFiles.length > 0 ? "pointer" : "not-allowed",
                    }}
                  >
                    Upload
                  </button>
                </Box>
              </Box>
            )}

            {tabIndex === 1 && (
              <Box sx={{ color: "text.secondary", py: 4 }}>
                <PlantationAssessment isEmbedded={true} />
              </Box>
            )}

            {tabIndex === 2 && (
              <Box sx={{ textAlign: "center", color: "text.secondary", py: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleViewGeoJSON}
                  sx={{ mr: 2 }}
                >
                  View
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleDownloadGeoJSON}
                >
                  Download
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDashboard;
