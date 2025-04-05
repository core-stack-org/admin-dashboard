import { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const appTypes = [
  {
    label: "Plantation",
    value: "plantation",
    roles: ["Upload KMLs", "View KMLs"],
  },
  { label: "Watershed", value: "watershed", roles: ["View Plan", "Edit Plan"] },
];

export default function AppUserDashboard() {
  const [selectedAppType, setSelectedAppType] = useState("plantation");
  const [activeRole, setActiveRole] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const currentRoles =
    appTypes.find((type) => type.value === selectedAppType)?.roles || [];

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

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleUploadKml = async () => {
    // console.log(selectedProject.id);
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
        // `${process.env.REACT_APP_BASEURL}/api/v1/projects/${selectedProject.id}/plantation/kml/`,
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
    } catch (error) {
      console.error("Error uploading files:", error);
      setToast({
        open: true,
        message: "Failed to upload KML file!",
        severity: "error",
      });
    }
  };

  return (
    <div className="p-10 bg-white min-h-screen flex flex-col items-center text-gray-900">
      <motion.h1
        className="text-5xl font-bold drop-shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        App User Dashboard
      </motion.h1>

      {/* Select App Type */}
      <div className="w-64 mt-10">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select App Type
        </label>
        <select
          value={selectedAppType}
          onChange={(e) => setSelectedAppType(e.target.value)}
          className="border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-300 w-full"
        >
          <option value="">Select an option</option>
          {appTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Available Roles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl mt-8"
      >
        <Card className="shadow-2xl rounded-xl overflow-hidden border border-gray-300 bg-gray-50 text-gray-900">
          <CardContent className="p-8">
            <h2 className="text-3xl font-semibold text-center">
              Available Roles
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-6">
              {currentRoles.map((role) => (
                <motion.li
                  key={role}
                  className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg border border-gray-200 cursor-pointer transform hover:scale-105 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveRole(role)}
                >
                  <span className="text-lg font-medium">{role}</span>
                  <Button
                    variant="contained"
                    color="primary"
                    className="mt-3"
                    size="small"
                  >
                    {role === "Upload KMLs"
                      ? "Select KMLs"
                      : role === "View KMLs"
                      ? "View KML"
                      : "Select"}
                  </Button>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Sheet for KML Upload */}
      {activeRole === "Upload KMLs" && (
        <div
          className="fixed bottom-20 bg-white shadow-lg p-4 border-t transition-transform duration-300"
          style={{
            width: "786px", // Match Available Roles width
            left: "57%", // Center horizontally
            transform: "translateX(-50%)", // Keep it centered
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 className="text-lg font-semibold text-center">
            {activeRole} Upload
          </h3>

          <div className="flex flex-col items-center space-y-3 mt-1">
            {/* File Input */}
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
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                <CloudUploadIcon sx={{ marginRight: "8px" }} />
                Choose KML Files
              </Button>
            </label>

            {/* Display Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="w-full bg-gray-100 p-2 rounded-lg text-center">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <Typography variant="body2">📂 {file.name}</Typography>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleRemoveFile(index)}
                      sx={{ marginLeft: "8px" }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "bold",
                textTransform: "none",
              }}
              onClick={handleUploadKml}
            >
              <CloudUploadIcon sx={{ marginRight: "8px" }} />
              Upload
            </Button>

            {/* Close Button */}
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ padding: "8px", borderRadius: "8px" }}
              onClick={() => setActiveRole(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Snackbar for Upload Messages */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
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
    </div>
  );
}
