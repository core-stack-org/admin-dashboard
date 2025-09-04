// components/PlantationActionsModern.jsx
import React, { useState } from "react";
import {
  Typography,
  IconButton,
  Tabs,
  Tab,
  Box,
  Button,
  Snackbar,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DeleteIcon from "@mui/icons-material/Delete";
import PlantationAssessmentForm from "./plantationAssessment";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const steps = ["Upload KML", "Edit Profile", "Process KMLs"];

const PlantationActions = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const project = location.state?.project;

  const [activeTab, setActiveTab] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleCloseToast = () => setToast({ ...toast, open: false });

  const handleFileSelect = (e) => setSelectedFiles(Array.from(e.target.files));

  const handleRemoveFile = (index) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

  const handleUploadKml = () =>
    setToast({
      open: true,
      message: "Files uploaded successfully!",
      severity: "success",
    });

  const handleCompute = (proj) =>
    setToast({
      open: true,
      message: `Processing KMLs for ${proj.name}`,
      severity: "info",
    });

  return (
    <div>
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(`/projects`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mt-32 ml-2"
        >
          <ArrowLeft size={20} /> Back to Projects
        </button>
      </div>

      <Box
        sx={{
          maxWidth: "900px",
          mx: "auto",
          mt: 2,
          px: 3,
          py: 4,
          border: "2px solid #e0e0e0", // subtle light gray border
          borderRadius: 3, // rounded corners
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)", // soft shadow for depth
          backgroundColor: "#ffffff", // white background
        }}
      >
        {/* Header */}
        <Paper
          sx={{
            py: 4,
            px: 3,
            mb: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Manage Project – {project?.name || "Loading..."}
          </Typography>
          <Typography variant="body2" mt={1}>
            Follow the steps below to complete project processing.
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
        </Paper>

        {/* Step Tabs */}
        <Paper
          elevation={0}
          sx={{ borderBottom: "1px solid #e0e0e0", mb: 4, borderRadius: 3 }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            {steps.map((label, idx) => (
              <Tab key={idx} label={label} />
            ))}
          </Tabs>
        </Paper>

        <Box>
          {/* Upload KML */}
          {activeTab === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "100%",
                alignItems: "center",
              }}
            >
              <label htmlFor="kml-upload" style={{ width: "100%" }}>
                <input
                  id="kml-upload"
                  type="file"
                  accept=".kml"
                  multiple
                  hidden
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  component="span"
                  sx={{
                    width: "full",
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CloudUploadIcon sx={{ mr: 1 }} />
                  Choose KML Files
                </Button>
              </label>

              {selectedFiles.length > 0 && (
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: "400px",
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
                      <Typography variant="body2">📂 {file.name}</Typography>
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

              <Button
                variant="contained"
                color="primary"
                sx={{
                  width: "250px",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  textTransform: "none",
                  mt: 1,
                }}
                onClick={handleUploadKml}
              >
                Upload
              </Button>

              <Snackbar
                open={toast.open}
                autoHideDuration={6000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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

          {/* Edit Profile */}
          {activeTab === 1 && project && (
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
                mb: 4,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <PlantationAssessmentForm
                isEmbedded={true}
                project={project}
                currentUser={currentUser}
              />
            </Paper>
          )}

          {/* Process KMLs */}
          {activeTab === 2 && (
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e0e0e0",
                mb: 4,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="body1" textAlign="center">
                Click below to start processing KML files for this project.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AutorenewIcon />}
                onClick={() => handleCompute(project)}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #ff9800, #ffb74d)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #f57c00, #ff9800)",
                  },
                }}
              >
                Process KMLs
              </Button>
            </Paper>
          )}
        </Box>

        {/* Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={toast.severity}>{toast.message}</Alert>
        </Snackbar>
      </Box>
    </div>
  );
};

export default PlantationActions;
