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
import {
  Plus,
  Users,
  Upload,
  FolderOpen,
  Eye,
  Download,
  FilePlus,
  FileText,
  FilePenLine,
} from "lucide-react";
import Project from "../pages/project.js";
import { ToastContainer } from "react-toastify";
import PlanCreation from "./planCreation.js";
import clsx from "clsx";

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
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isKMLDialogOpen, setIsKMLDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [appType, setAppType] = useState("");
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false);
  const [selectedExcelFiles, setSelectedExcelFiles] = useState([]);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const taskMap = {
    plantation: [
      {
        title: "Upload KML",
        description: "Upload KML files for plantation boundaries",
        onClick: () => setIsKMLDialogOpen(true),
        iconColor: "bg-violet-500",
        icon: <Upload className="text-white h-5 w-5" />,
        hoverBorder: "hover:border-violet-500",
        hoverShadow: "hover:shadow-[0_15px_30px_rgba(139,92,246,0.2)]",
      },
      {
        title: "View Layer",
        description: "Visualize uploaded KML layers on the map",
        onClick: () => console.log("View GeoJSON clicked"),
        iconColor: "bg-blue-500",
        icon: <Eye className="text-white h-5 w-5" />,
        hoverBorder: "hover:border-blue-500",
        hoverShadow: "hover:shadow-[0_15px_30px_rgba(139,92,246,0.2)]",
      },
      {
        title: "Download GeoJSON",
        description: "Export KML data as GeoJSON file",
        onClick: () => console.log("Download GeoJSON clicked"),
        iconColor: "bg-green-600",
        icon: <Download className="text-white h-5 w-5" />,
        hoverBorder: "hover:border-green-500",
        hoverShadow: "hover:shadow-[0_15px_30px_rgba(139,92,246,0.2)]",
      },
    ],
    waterbody: [
      {
        title: "Upload Excel",
        description: "Import waterbody information via Excel",
        onClick: () => setIsExcelDialogOpen(true),
        iconColor: "bg-violet-500",
        icon: <Upload className="text-white h-5 w-5" />,
        hoverBorder: "hover:border-violet-500",
        hoverShadow: "hover:shadow-[0_15px_30px_rgba(139,92,246,0.2)]",
      },
    ],
    watershed: [
      {
        title: "Create Plan",
        description: "Initiate a new watershed plan",
        onClick: () => setIsPlanDialogOpen(true),
        iconColor: "bg-indigo-500",
        icon: <FilePlus className="text-white h-5 w-5" />,
        hoverBorder: "hover:border-indigo-500",
        hoverShadow: "hover:shadow-[0_15px_30px_rgba(139,92,246,0.2)]",
      },
      {
        title: "View Plan",
        description: "Access submitted watershed plans",
        onClick: () => console.log("View Plan clicked"),
        iconColor: "bg-purple-500",
        icon: <FileText className="text-white h-5 w-5" />,
        hoverBorder: "hover:border-purple-500",
        hoverShadow: "hover:shadow-[0_15px_30px_rgba(139,92,246,0.2)]",
      },
      {
        title: "Edit Plan",
        description: "Modify existing watershed plans",
        onClick: () => console.log("Edit Plan clicked"),
        iconColor: "bg-orange-500",
        icon: <FilePenLine className="text-white h-5 w-5" />,
        hoverBorder: "hover:border-orange-500",
        hoverShadow: "hover:shadow-[0_15px_30px_rgba(139,92,246,0.2)]",
      },
    ],
  };

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
          const project = data[0].project;
          const projectId = project.id;

          setSelectedProject(projectId);
          setAppType(project.app_type);

          // ✅ Now fetch users for that project
          loadUsers(projectId);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const loadUsers = async (projectId) => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/projects/${projectId}/users/`,
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
      }
    };

    fetchProjects();
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.03,
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.97,
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-50 dark:to-slate-100 p-4 md:p-8">
      <ToastContainer />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-10"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="relative text-center mb-16"
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1] rounded-full"
            style={{
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle, rgba(0, 150, 255, 0.08) 0%, transparent 70%)",
            }}
          />
          <h1
            className="text-[3.2rem] font-extrabold uppercase tracking-[2px] mb-4"
            style={{
              background: "linear-gradient(45deg, #0066cc, #6600cc, #cc6600)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientShift 3s ease-in-out infinite",
            }}
          >
            Project Manager Dashboard
          </h1>
          <p className="text-[1.1rem] text-gray-600 opacity-80">
            Overview of organization and your profile
          </p>
          <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
        </motion.div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Info Card */}
          <motion.div variants={itemVariants} className="group transition-all">
            <div className="relative bg-white border border-gray-300 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-600 min-h-[280px]">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-blue-600 font-semibold text-lg flex items-center gap-2">
                  <FontAwesomeIcon icon={faBuilding} className="h-5 w-5" />
                  Organization
                </h3>
                <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                  {currentUser?.user?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2 text-gray-700">
                  <span className="font-medium">Name</span>
                  <span className="font-bold text-gray-900">
                    {organizationName}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2 text-gray-700">
                  <span className="font-medium">ID</span>
                  <span className="font-bold text-gray-800">
                    {organizationId}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* User Info Card */}
          <motion.div variants={itemVariants} className="group transition-all">
            <div className="relative bg-white border border-gray-300 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-600 min-h-[280px]">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-blue-600 font-semibold text-lg flex items-center gap-2">
                  <FontAwesomeIcon icon={faUserCog} className="h-5 w-5" />
                  User Details
                </h3>
                <span
                  className={`text-white text-xs font-bold uppercase px-3 py-1 rounded-full bg-gradient-to-r ${
                    currentUser?.user?.is_active
                      ? "from-green-500 to-green-600"
                      : "from-red-500 to-red-600"
                  }`}
                >
                  {currentUser?.user?.is_active ? "Online" : "Inactive"}
                </span>
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Name</span>
                  <span className="font-bold text-gray-900">{userName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Email</span>
                  <span className="font-semibold text-gray-800">{email}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Contact</span>
                  <span className="font-semibold text-gray-900">
                    {contact_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Role</span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {role}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginTop: "12px",
        }}
      ></div>
      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600">
          Project Management System
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* View Project Details */}
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="cursor-pointer"
            onClick={() => setIsProjectDialogOpen(true)}
          >
            <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-green-500 hover:shadow-[0_15px_30px_rgba(34,197,94,0.2)] min-h-[200px] z-10">
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-green-500 p-2 rounded-full mb-2">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                  Project Info
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  View project-related details
                </p>
              </div>
            </div>
          </motion.div>

          {/* View All USers under that project Details */}
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="cursor-pointer"
            onClick={() => setIsUserDialogOpen(true)} // Change to your user dialog state if needed
          >
            <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-blue-500 hover:shadow-[0_15px_30px_rgba(59,130,246,0.2)] min-h-[200px] z-10">
              {/* Background Hover Glow */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
              </div>

              {/* Foreground Content */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-blue-500 p-2 rounded-full mb-2 shadow-md">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                  View All Users
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  See all users under the project
                </p>
              </div>
            </div>
          </motion.div>

          {/* Assign Roles */}
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="cursor-pointer"
            onClick={() => setIsRoleDialogOpen(true)}
          >
            <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-yellow-500 hover:shadow-[0_15px_30px_rgba(234,179,8,0.2)] min-h-[200px] z-10">
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-yellow-500 p-2 rounded-full mb-2">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                  Assign Roles
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Set user permissions within this project
                </p>
              </div>
            </div>
          </motion.div>

          {/* Upload KML */}
          {taskMap[appType]?.map((task, index) => (
            <motion.div
              key={index}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="cursor-pointer"
              onClick={task.onClick}
            >
              <div
                className={clsx(
                  "relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] min-h-[200px] z-10",
                  task.hoverBorder,
                  task.hoverShadow
                )}
              >
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className={`${task.iconColor} p-2 rounded-full mb-2`}>
                    {task.icon}
                  </div>
                  <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    {task.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/*View Project dialog box */}

      <Dialog
        open={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "20px",
            padding: "32px",
            background: "rgba(255, 255, 255, 1)",
            backdropFilter: "blur(16px)",
            boxShadow: "0px 15px 30px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.8rem",
            fontWeight: "800",
            textAlign: "center",
            color: "#333",
            mb: 1,
          }}
        >
          📊 View Project Details
        </DialogTitle>

        <DialogContent>
          <div className="flex flex-col gap-6 mt-2">
            {/* Project Summary */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {projects[0]?.project?.name || "No name available"}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Project ID</p>
                  <p className="font-semibold">
                    {projects[0]?.project?.id ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">🏢 Organization</p>
                  <p className="font-semibold">
                    {projects[0]?.project?.organization_name ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">
                📝 Description
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 shadow-inner">
                {projects[0]?.project?.description || "No description provided"}
              </div>
            </div>

            {/* App Type */}
            <div className="text-sm">
              <p className="text-gray-500 mb-1">🔗 App Type</p>
              <span className="inline-block bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full">
                {projects[0]?.project?.app_type || "Not specified"}
              </span>
            </div>

            {/* Role */}
            <div className="text-sm">
              <p className="text-gray-500 mb-1">🛠 Role</p>
              <span className="inline-block bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full">
                {projects[0]?.role?.name || "No role assigned"}
              </span>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            mt: 2,
          }}
        >
          <Button
            onClick={() => setIsProjectDialogOpen(false)}
            variant="outlined"
            color="secondary"
            sx={{
              borderRadius: "10px",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              textTransform: "none",
              borderColor: "#d946ef",
              color: "#d946ef",
              "&:hover": {
                backgroundColor: "#fdf4ff",
                borderColor: "#c026d3",
              },
            }}
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
                                      {group.name === "App User"
                                        ? "Plan Editor"
                                        : group.name}
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

      {/*Upload kmls for the app type waterbody */}

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

      {/*Upload excel for the app type waterbody */}
      <Dialog
        open={isExcelDialogOpen}
        onClose={() => setIsExcelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 6,
            padding: "24px",
            minHeight: "300px", // ⬆ increased height
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            fontSize: "1.4rem",
            fontWeight: 700,
          }}
        >
          Upload Excel for Project:
          <span className="text-blue-600">{selectedProject?.name}</span>
          <IconButton
            onClick={() => setIsExcelDialogOpen(false)}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <div className="flex flex-col items-center space-y-6">
            {/* Upload Button */}
            <label htmlFor="excel-upload" className="w-full">
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx, .xls"
                hidden
                multiple
                onChange={(e) =>
                  setSelectedExcelFiles(Array.from(e.target.files || []))
                }
              />
              <Button
                variant="outlined"
                color="primary"
                component="span"
                fullWidth
                sx={{
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  textTransform: "none",
                }}
                startIcon={<CloudUploadIcon />}
              >
                Choose Excel Files
              </Button>
            </label>

            {/* File Previews */}
            {selectedExcelFiles.length > 0 && (
              <div className="w-full bg-gray-50 border border-gray-200 p-3 rounded-md max-h-[150px] overflow-y-auto">
                {selectedExcelFiles.map((file, idx) => (
                  <Typography
                    key={idx}
                    variant="body2"
                    className="text-sm mb-1"
                  >
                    📄 {file.name}
                  </Typography>
                ))}
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, mt: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              console.log("Uploading Excel files:", selectedExcelFiles);
              setIsExcelDialogOpen(false);
            }}
            sx={{
              padding: "14px",
              fontSize: "1rem",
              borderRadius: "10px",
              fontWeight: "bold",
              textTransform: "none",
              width: 120,
            }}
            startIcon={<CloudUploadIcon />}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/*User dialog box */}
      <Dialog
        open={isUserDialogOpen}
        onClose={() => setIsUserDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 4,
            padding: "20px",
            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
            minHeight: "400px",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            👥 All Users under this Project
          </Typography>
          <IconButton
            onClick={() => setIsUserDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div
                  key={user.id || index}
                  className="border border-gray-200 p-4 rounded-lg bg-gray-50"
                >
                  <p className="text-sm text-gray-800 font-semibold">
                    {user.username}{" "}
                  </p>
                  <div className="text-sm text-gray-600 mt-1">
                    Role:{" "}
                    <span className="font-medium text-blue-600">
                      {user.group_name || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center">No users found.</p>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsUserDialogOpen(false)}
            sx={{
              padding: "12px 24px",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/*Plan creation dialog box */}
      <Dialog
        open={isPlanDialogOpen}
        onClose={() => setIsPlanDialogOpen(false)}
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
        <DialogContent>
          <PlanCreation
            onClose={() => setIsPlanDialogOpen(false)}
            projectId={selectedProject}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManagerDashboard;
