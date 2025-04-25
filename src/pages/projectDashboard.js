import React, { useState } from "react";
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

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };
  const handleClose = () => {
    setSelectedProject(null);
    setTabIndex(0);
    setIsDialogOpen(false);
  };

  const [selectedFiles, setSelectedFiles] = useState([]); // Store multiple files

  const handlefileSelect = (event) => {
    const files = Array.from(event.target.files); // Convert FileList to array
    const validFiles = files.filter((file) => file.name.endsWith(".kml"));

    if (validFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]); // Append new files
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
      formData.append("files", file);
    });
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleViewGeoJSON = () => {};

  const handleDownloadGeoJSON = () => {};

  const projects = [
    //TODO: Fetch the projects name from the api
    {
      id: 1,
      name: "Project Alpha",
      type: "Plantation",
      organization: "Org 1",
      lastUpdated: "2 hours ago",
    },
    {
      id: 2,
      name: "Project Beta",
      type: "Plantation",
      organization: "Org 2",
      lastUpdated: "5 hours ago",
    },
    {
      id: 3,
      name: "Project Gamma",
      type: "Plantation",
      organization: "Org 3",
      lastUpdated: "1 day ago",
    },
    {
      id: 4,
      name: "Project Delta",
      type: "Plantation",
      organization: "Org 4",
      lastUpdated: "3 days ago",
    },
    {
      id: 5,
      name: "Project Epsilon",
      type: "Water Restoration",
      organization: "Org 1",
      lastUpdated: "4 hours ago",
    },
    {
      id: 6,
      name: "Project Zeta",
      type: "Water Restoration",
      organization: "Org 2",
      lastUpdated: "1 day ago",
    },
    {
      id: 7,
      name: "Project Eta",
      type: "Water Restoration",
      organization: "Org 3",
      lastUpdated: "2 days ago",
    },
    {
      id: 8,
      name: "Project Theta",
      type: "Water Restoration",
      organization: "Org 4",
      lastUpdated: "5 days ago",
    },
    {
      id: 9,
      name: "Project Iota",
      type: "MWS",
      organization: "Org 1",
      lastUpdated: "3 hours ago",
    },
    {
      id: 10,
      name: "Project Kappa",
      type: "MWS",
      organization: "Org 2",
      lastUpdated: "8 hours ago",
    },
    {
      id: 11,
      name: "Project Lambda",
      type: "Plantation",
      organization: "Org 3",
      lastUpdated: "1 day ago",
    },
  ];

  const groupedProjects = projects.reduce((acc, project) => {
    if (!acc[project.type]) acc[project.type] = [];
    acc[project.type].push(project);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-7xl mx-auto mt-16">
      <h1 className="text-3xl font-bold mb-8">Project Dashboard</h1>
      {Object.keys(groupedProjects).map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedProjects[category].map((project) => (
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
                        {project.organization}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="font-medium">{project.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
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
