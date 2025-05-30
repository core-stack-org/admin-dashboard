import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Snackbar,
  IconButton,
  Badge,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faUserCog } from "@fortawesome/free-solid-svg-icons";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { Plus, Users, Upload, FolderOpen, Eye } from "lucide-react";
import Project from "../pages/project.js";
import { ToastContainer } from "react-toastify";

const ProjectManagerDashboard = ({ currentUser }) => {
  const organizationName = currentUser?.user?.organization_name;
  const organizationId = currentUser?.user?.organization;
  const userName = currentUser?.user?.username;
  const email = currentUser?.user?.email;
  const contact_number = currentUser?.user?.contact_number;
  const role = currentUser?.user?.groups?.[0]?.name;
  const userid = currentUser?.user?.id;

  const [projects, setProjects] = useState([]);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isKMLDialogOpen, setIsKMLDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/users/my_projects/`,
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

        setProjects(data);
        if (Array.isArray(data) && data.length === 1) {
          const project = data[0].project.id;
          setSelectedProject(project); // ✅ Store project object
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
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
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Unexpected API response format:", data);
          return;
        }

        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    };
    loadUsers();
  }, []);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleCloseDialog = () => {
    setSelectedFiles([]);
  };

  const handlefileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.name.endsWith(".kml"));

    if (validFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    } else {
      alert("Please upload valid KML files.");
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
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${selectedProject}/plantation/kml/`,
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

  const assignRole = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedRole) {
      toast.error("Please select both a user and a role.");
      return;
    }
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/users/${selectedUser}/set_group/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            group_id: selectedRole,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Role assigned successfully!", {
          onClose: () => setIsRoleDialogOpen(false), // Ensures toast is displayed before closing
        });
      } else {
        toast.error(
          `Failed to assign role: ${data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("An error occurred while assigning the role.");
    }
  };

  return (
    <div style={{ padding: "32px" }}>
      <ToastContainer />
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">
          Project Manager Dashboard
        </h1>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Organization Info */}
        <motion.div variants={itemVariants} className="flex">
          <Card className="flex-grow flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="mr-2 text-primary"
                />
                <h6 className="text-lg font-semibold">Organization</h6>
              </div>
              <p className="text-sm text-secondary">
                Current organization details
              </p>
            </div>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Name:</p>
                  <p>{organizationName}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">ID:</p>
                  <p className="text-secondary">{organizationId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Details */}
        <motion.div variants={itemVariants} className="flex">
          <Card className="flex-grow flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon
                  icon={faUserCog}
                  className="mr-2 text-primary"
                />
                <h6 className="text-lg font-semibold">User Details</h6>
              </div>
              <p className="text-sm text-secondary">Current user information</p>
            </div>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Name:</p>
                  <p>{userName}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Email:</p>
                  <p>{email}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Contact:</p>
                  <p>{contact_number}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Role:</p>
                  <Badge variant="secondary">{role}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Status:</p>
                  <Badge
                    variant={
                      currentUser?.user?.is_active ? "success" : "destructive"
                    }
                  >
                    {currentUser?.user?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginTop: "12px",
        }}
      ></div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <Button
          variant="contained"
          style={{
            flex: 1,
            padding: "16px",
            fontSize: "18px",
            backgroundColor: "#16A34A",
            borderRadius: "12px",
          }}
          onClick={() => setIsProjectDialogOpen(true)}
        >
          <Eye size={20} style={{ marginRight: "8px" }} /> View Project Details
        </Button>

        <Button
          variant="contained"
          style={{
            flex: 1,
            padding: "16px",
            fontSize: "18px",
            borderRadius: "12px",
            backgroundColor: "#D97706",
          }}
          onClick={() => setIsRoleDialogOpen(true)}
        >
          <Users size={20} style={{ marginRight: "8px" }} /> Assign Roles
        </Button>
        <Button
          variant="contained"
          className="bg-violet-100"
          style={{
            flex: 1,
            padding: "16px",
            fontSize: "18px",
            borderRadius: "12px",
          }}
          onClick={() => setIsKMLDialogOpen(true)}
        >
          <Upload size={20} style={{ marginRight: "8px" }} /> Upload KML
        </Button>
      </div>

      <Dialog
        open={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 4,
            padding: "24px",
            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          View Project Details
        </DialogTitle>
        <DialogContent>
          <div className="p-6">
            {projects.length > 0 && projects[0]?.project ? (
              <div className="flex flex-col space-y-6">
                {/* Project Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    📌 Project Name:{" "}
                    {projects[0].project.name || "No name available"}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Project ID</p>
                      <p className="text-sm font-medium text-gray-900">
                        {projects[0].project.id ?? "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        🏢 Organization
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {projects[0].project.organization_name ||
                          "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    📝 Description
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">
                    {projects[0].project.description ||
                      "No description provided"}
                  </p>
                </div>

                {/* App Type */}
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">🔗 App Type</p>
                  <p className="font-medium text-blue-600">
                    {projects[0].project.app_type || "Not specified"}
                  </p>
                </div>

                {/* Role */}
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">🛠 Role</p>
                  <p className="font-medium text-gray-900">
                    {projects[0].role?.name || "No role assigned"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No project details available
              </p>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsProjectDialogOpen(false)}
            variant="outlined"
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isRoleDialogOpen}
        onClose={() => setIsRoleDialogOpen(false)}
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
        <DialogTitle>Assign Roles</DialogTitle>
        <DialogContent>
          <div>
            <div>
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <ToastContainer position="bottom-right" autoClose={3000} />

                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
                  {/* Header */}
                  <div className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      Assign role to member
                    </h2>
                    <button
                      onClick={() => setIsRoleDialogOpen(false)}
                      className="text-white hover:bg-amber-700 rounded-full p-2 focus:outline-none"
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

                  {/* Body */}
                  <div className="p-6">
                    <div className="flex flex-col space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className=" mb-4">
                          <form onSubmit={assignRole} className="space-y-2">
                            {/* User Name */}
                            <div className="w-full">
                              <label className="block text-lg font-medium mb-3">
                                User Name
                              </label>
                              <select
                                value={selectedUser}
                                onChange={(e) =>
                                  setSelectedUser(e.target.value)
                                }
                                className="block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                                style={{
                                  maxHeight: "50px",
                                }}
                              >
                                <option value="">Select a user</option>
                                {users.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.username}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Role Name */}
                            <div>
                              <label className="block text-lg font-medium mb-3">
                                Role Name
                              </label>
                              <select
                                value={selectedRole}
                                onChange={(e) =>
                                  setSelectedRole(e.target.value)
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                                required
                              >
                                <option value="" disabled>
                                  Select role
                                </option>
                                {groups
                                  .filter(
                                    (group) =>
                                      group.name === "Organization Admin" ||
                                      group.name === "Project Manager"
                                  ) // Filter required roles
                                  .map((group) => (
                                    <option key={group.id} value={group.id}>
                                      {group.name}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            {/* Submit Button */}
                            <div className="text-center">
                              <button
                                type="submit"
                                className="px-8 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition text-lg"
                              >
                                Assign Role
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRoleDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isKMLDialogOpen}
        onClose={() => setIsKMLDialogOpen(false)}
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
            onClick={() => setIsKMLDialogOpen(false)}
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
    </div>
  );
};

export default ProjectManagerDashboard;
