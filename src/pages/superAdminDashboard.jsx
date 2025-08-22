import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  FolderKanban,
  Users,
  ShieldCheck,
  UserCog,
  Shield,
  UserPlus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import { Badge } from "@mui/material";
import Project from "./project.js";
import { OrganizationForm } from "./organizationForm.jsx";
import UserMappingForm from "./userMappingForm.jsx";
import RoleAssignmentForm from "./roleAssignmentForm.jsx";
import AddMember from "./addMember.jsx";
import RegistrationForm from "./userRegistration.jsx";
import ProjectDashboard from "./projectDashboard.js";
import { useNavigate } from "react-router-dom";

function SuperAdminDashboard({ currentUser }) {
  const [activeModal, setActiveModal] = useState(null);
  const [openDialog, setOpenDialog] = useState(null);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const organizationName = currentUser?.user?.organization_name;
  const organizationId = currentUser?.user?.organization;
  const userName = currentUser?.user?.username;
  const email = currentUser?.user?.email;
  const contact_number = currentUser?.user?.contact_number;
  const [userCount, setUserCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const isActive = currentUser?.user?.is_active ? "Active" : "Inactive";
  const [selectedUser, setSelectedUser] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const navigate = useNavigate();

  const handleOpenDialog = (dialogName) => {
    setOpenDialog(dialogName);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  useEffect(() => {
    loadUsers();
    loadOrganization();
    fetchProjects();
  }, []);

  const loadOrganization = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/auth/register/available_organizations/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrganizations(data);
      } else {
        console.error("Unexpected API response format:", data);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  };

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
      const count = data.length; // Get the number of users
      setUserCount(count); // Update state

      setUsers(data);

      return userCount; // You can return this if needed
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_states/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      const sortedStates = data.states.sort((a, b) =>
        a.state_name.localeCompare(b.state_name)
      );
      setStatesList(sortedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };
  const fetchProjects = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");

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
      const count = data.length; // Get the number of users
      setProjectCount(count); // Update state

      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
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

  const handleViewOrganizations = () => {
    handleOpenDialog("viewOrganizations");
  };
  const handleExtraAction = () => {
    handleOpenDialog("extraActions");
  };
  const handleViewProjects = () => {
    handleOpenDialog("viewProjects");
  };
  const handleViewUsers = () => {
    // handleOpenDialog("viewUsers");
    navigate("/users");
  };
  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleToggleSuperAdmin = () => {
    setIsSuperAdmin((prev) => !prev);
  };

  const handleMakeSuperAdmin = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/users/${selectedUser}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_superadmin: isSuperAdmin ? "True" : "False",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-50 dark:to-slate-100 p-4 md:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="relative text-center mb-16"
        >
          {/* Radial background circle using ::before simulation */}
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
            className="text-[3.5rem] font-black  tracking-[2px] mb-4"
            style={{
              background: "linear-gradient(45deg, #0066cc, #6600cc, #cc6600)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientShift 3s ease-in-out infinite",
            }}
          >
            Super Administrator
          </h1>

          <p className="text-[1.2rem] text-gray-600 opacity-80">
            Advanced system control and management interface
          </p>

          {/* Add keyframes for gradient shift */}
          <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate="show"
            className="group transition-all"
          >
            <div className="relative bg-white border border-gray-300 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-600 group">
              {/* Top hover bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-blue-600 font-semibold text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Organization Control
                </h3>
                <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                  {isActive}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">
                    Organization
                  </span>
                  <span className="text-gray-900 font-bold">
                    {organizationName}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">System ID</span>
                  <span className="text-gray-800 font-bold">
                    {organizationId}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">
                    Active Projects
                  </span>
                  <span className="text-gray-900 font-bold">
                    {projectCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Users</span>
                  <span className="text-gray-900 font-bold">{userCount}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* User Details */}
          <motion.div variants={itemVariants} className="group transition-all">
            <div className="relative bg-white border border-gray-300 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-600">
              {/* Hover top border */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
                  <UserCog className="h-5 w-5" />
                  User Details
                </div>
                <span
                  className={`text-white text-xs font-bold uppercase px-3 py-1 rounded-full bg-gradient-to-r ${
                    isActive === "Active"
                      ? "from-green-500 to-green-600"
                      : "from-red-500 to-red-600"
                  }`}
                >
                  {isActive === "Active" ? "Online" : isActive}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Name</span>
                  <span className="text-gray-900 font-bold">{userName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Email</span>
                  <span className="text-gray-800 font-semibold">{email}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Contact</span>
                  <span className="text-gray-900 font-semibold">
                    {contact_number}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Role</span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Super Admin
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600">
            System Operations
          </h2>{" "}
          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {" "}
            {/* Create Organization */}
            <motion.div>
              <div
                onClick={() => handleOpenDialog("organization")}
                className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-[#4285f4] hover:shadow-[0_15px_30px_rgba(66,133,244,0.2)] min-h-[250px]"
              >
                <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-[radial-gradient(circle,rgba(0,102,204,0.08)_0%,transparent_70%)] rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group-hover:w-[300px] group-hover:h-[300px] z-0" />
                <span className="text-[3rem] mb-4 relative z-10">🏢</span>
                <h3 className="text-[1.3rem] font-semibold text-gray-800 mb-2 relative z-10">
                  Create Organization
                </h3>
                <p className="text-sm text-gray-600 relative z-10">
                  Initialize new organizational structure
                </p>
              </div>
            </motion.div>
            {/* Create Project */}
            <motion.div>
              <div
                onClick={() => handleOpenDialog("project")}
                className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-[#9c27b0] hover:shadow-[0_15px_30px_rgba(156,39,176,0.2)] min-h-[250px]"
              >
                <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-[radial-gradient(circle,rgba(0,102,204,0.08)_0%,transparent_70%)] rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group-hover:w-[300px] group-hover:h-[300px] z-0" />
                <span className="text-[3rem] mb-4 relative z-10">📁</span>
                <h3 className="text-[1.3rem] font-semibold text-gray-800 mb-2 relative z-10">
                  Create Project
                </h3>
                <p className="text-sm text-gray-600 relative z-10">
                  Deploy new project environment
                </p>
              </div>
            </motion.div>
            {/* Create User */}
            <motion.div>
              <div
                onClick={() => handleOpenDialog("createUser")}
                className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-[#4caf50] hover:shadow-[0_15px_30px_rgba(76,175,80,0.2)] min-h-[250px]"
              >
                <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-[radial-gradient(circle,rgba(0,102,204,0.08)_0%,transparent_70%)] rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group-hover:w-[300px] group-hover:h-[300px] z-0" />
                <span className="text-[3rem] mb-4 relative z-10">👤</span>
                <h3 className="text-[1.3rem] font-semibold text-gray-800 mb-2 relative z-10">
                  Create User
                </h3>
                <p className="text-sm text-gray-600 relative z-10">
                  Register new application user
                </p>
              </div>
            </motion.div>
            {/* Map User to Organization */}
            <motion.div>
              <div
                onClick={() => handleOpenDialog("userMapping")}
                className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-[#607d8b] hover:shadow-[0_15px_30px_rgba(96,125,139,0.2)] min-h-[250px]"
              >
                <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-[radial-gradient(circle,rgba(0,102,204,0.08)_0%,transparent_70%)] rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group-hover:w-[300px] group-hover:h-[300px] z-0" />
                <span className="text-[3rem] mb-4 relative z-10">👥</span>
                <h3 className="text-[1.3rem] font-semibold text-gray-800 mb-2 relative z-10">
                  Map User to Organization
                </h3>
                <p className="text-sm text-gray-600 relative z-10">
                  Link user roles within an organization
                </p>
              </div>
            </motion.div>
            {/* Assign Roles */}
            <motion.div>
              <div
                onClick={() => handleOpenDialog("roleAssignment")}
                className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-[#ff9800] hover:shadow-[0_15px_30px_rgba(255,152,0,0.2)] min-h-[250px]"
              >
                <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-[radial-gradient(circle,rgba(0,102,204,0.08)_0%,transparent_70%)] rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group-hover:w-[300px] group-hover:h-[300px] z-0" />
                <span className="text-[3rem] mb-4 relative z-10">🛡️</span>
                <h3 className="text-[1.3rem] font-semibold text-gray-800 mb-2 relative z-10">
                  Assign Roles
                </h3>
                <p className="text-sm text-gray-600 relative z-10">
                  Define access levels for users
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600">
            System Management
          </h2>{" "}
          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            {[
              {
                title: "View All Users",
                desc: "Manage and review all system users.",
                onClick: handleViewUsers,
              },
              {
                title: "View All Organizations",
                desc: "Access and manage registered organizations.",
                onClick: handleViewOrganizations,
              },
              {
                title: "View All Projects",
                desc: "Browse projects along with their organization names.",
                onClick: handleViewProjects,
              },
              {
                title: "Extra Action",
                desc: "Give User a Super Admin access",
                onClick: handleExtraAction,
              },
            ].map(({ title, desc, onClick }, i) => (
              <motion.div
                key={i}
                onClick={onClick}
                className="relative bg-white border border-[#e0e0e0] rounded-[15px] p-8 cursor-pointer transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:border-[#0066cc] hover:shadow-[-10px_10px_30px_rgba(0,102,204,0.15)] group"
              >
                {/* Gradient bar on right side on hover */}
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b from-[#0066cc] to-[#6600cc] transform scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />

                <div className="text-[1.4rem] font-bold text-[#333] mb-3">
                  {title}
                </div>
                <p className="text-[#666] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
          {/* <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-4 bg-card cursor-pointer"
                  onClick={handleViewUsers}
                >
                  <div className="font-medium text-lg">View All Users</div>
                  <p className="text-sm text-muted-foreground">
                    Manage and review all system users.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-4 bg-card cursor-pointer"
                  onClick={handleViewOrganizations}
                >
                  <div className="font-medium text-lg">
                    View All Organizations
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access and manage registered organizations.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-4 bg-card cursor-pointer"
                  onClick={handleViewProjects}
                >
                  <div className="font-medium text-lg">View All Projects</div>
                  <p className="text-sm text-muted-foreground">
                    Browse projects along with their organization names.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-4 bg-card cursor-pointer"
                  onClick={handleExtraAction}
                >
                  <div className="font-medium text-lg">Extra Action</div>
                  <p className="text-sm text-muted-foreground">
                    Give User a Super Admin access
                  </p>
                </motion.div>
              </div>
            </CardContent> */}
        </motion.div>
      </motion.div>

      <Dialog
        open={openDialog === "organization"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Organization</DialogTitle>
        <DialogContent>
          <OrganizationForm
            onClose={handleCloseDialog}
            loadOrganization={loadOrganization}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Dialog */}
      <Dialog
        open={openDialog === "project"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            style: {
              borderRadius: "12px",
              padding: "0",
            },
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle className="text-xl font-semibold bg-violet-600 text-white px-6 py-4">
          Create Project
        </DialogTitle>

        {/* Dialog Body */}
        <DialogContent dividers>
          <div className="p-6">
            <Project
              onClose={handleCloseDialog}
              currentUser={currentUser}
              statesList={statesList}
            />
          </div>
        </DialogContent>

        {/* Dialog Footer */}
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            className="text-gray-700 px-4 py-2 rounded-lg"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map User to Organization Dialog */}
      <Dialog
        open={openDialog === "userMapping"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Map User to Organization</DialogTitle>
        <DialogContent>
          <UserMappingForm
            onClose={handleCloseDialog}
            currentUser={currentUser}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role assignment to Organization Dialog */}
      <Dialog
        open={openDialog === "roleAssignment"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign role </DialogTitle>
        <DialogContent>
          <RoleAssignmentForm onClose={handleCloseDialog} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* To create new users in the organization Dialog */}
      <Dialog
        open={openDialog === "createUser"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add User </DialogTitle>
        <DialogContent>
          <AddMember
            onClose={handleCloseDialog}
            currentUser={currentUser}
            isSuperAdmin={true}
            onUserCreated={loadUsers}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* View all users*/}
      {/* <Dialog
        open={openDialog === "viewUsers"}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>All Users</DialogTitle>
        <DialogContent className="p-4 max-h-[500px] overflow-y-auto">
          {users.length > 0 ? (
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Username</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Contact</th>
                  <th className="border p-2">Organization</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  // Extract group names
                  let groupNames =
                    user.groups?.map((group) => group.name) || [];

                  // Add "Superadmin" if applicable
                  if (user.is_superadmin) {
                    groupNames.unshift("Superadmin");
                  }

                  return (
                    <tr key={user.id} className="text-center border">
                      <td className="border p-2">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="border p-2">{user.username}</td>
                      <td className="border p-2">{user.email}</td>
                      <td className="border p-2">{user.contact_number}</td>
                      <td className="border p-2">{user.organization_name}</td>
                      <td className="border p-2">
                        {user.is_active ? "Active" : "Inactive"}
                      </td>
                      <td className="border p-2">
                        {groupNames.length > 0 ? groupNames.join(", ") : "None"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center">No users found.</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* View all Organizations*/}
      <Dialog
        open={openDialog === "viewOrganizations"}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>All Organizations</DialogTitle>
        <DialogContent className="p-4 max-h-[500px] overflow-y-auto">
          {organizations.length > 0 ? (
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Organization Name</th>
                  <th className="border p-2">Organization ID</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="text-center border">
                    <td className="border p-2">{org.name}</td>
                    <td className="border p-2">{org.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center">No organizations found.</p>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* View all Projects Dialog */}
      <Dialog
        open={openDialog === "viewProjects"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            style: {
              borderRadius: "12px",
              padding: "0",
            },
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle className="text-xl font-semibold bg-violet-600 text-white px-6 py-4">
          View all Project
        </DialogTitle>

        {/* Dialog Body */}
        <DialogContent dividers>
          <div className="p-6">
            <ProjectDashboard
              onClose={handleCloseDialog}
              currentUser={currentUser}
            />
          </div>
        </DialogContent>

        {/* Dialog Footer */}
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            className="text-gray-700 px-4 py-2 rounded-lg"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Super admin Role assignment to user Dialog */}
      <Dialog
        open={openDialog === "extraActions"}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        sx={{ "& .MuiDialog-paper": { minHeight: "300px" } }}
      >
        <DialogTitle>Make user a Super Admin</DialogTitle>
        <DialogContent className="min-h-[200px] flex flex-col justify-between">
          <div>
            <label className="block text-lg font-medium mb-3">User Name</label>
            <select
              value={selectedUser}
              onChange={handleUserChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              required
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <FormControlLabel
            control={
              <Checkbox
                checked={isSuperAdmin}
                onChange={handleToggleSuperAdmin}
              />
            }
            label="Is Super Admin"
          />
        </DialogContent>
        <DialogActions>
          <DialogActions className="flex justify-end gap-4 p-4">
            <Button
              onClick={handleMakeSuperAdmin}
              className="bg-emerald-600 hover:bg-green-300 active:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!selectedUser}
            >
              ✅ Make Super Admin
            </Button>

            <Button
              onClick={handleCloseDialog}
              className="bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-800 font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
              ❌ Cancel
            </Button>
          </DialogActions>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SuperAdminDashboard;
