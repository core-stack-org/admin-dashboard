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
} from "@mui/material";
import { Badge } from "@mui/material";
import Project from "./project.js";
import { OrganizationForm } from "./organizationForm.jsx";
import UserMappingForm from "./userMappingForm.jsx";
import RoleAssignmentForm from "./roleAssignmentForm.jsx";
import AddMember from "./addMember.jsx";
import RegistrationForm from "./userRegistration.jsx";
import ProjectDashboard from "./projectDashboard.js";

function SuperAdminDashboard({ currentUser }) {
  const [activeModal, setActiveModal] = useState(null);
  const [openDialog, setOpenDialog] = useState(null);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  console.log(currentUser);
  const organizationName = currentUser?.user?.organization_name;
  const organizationId = currentUser?.user?.organization;
  const userName = currentUser?.user?.username;
  const email = currentUser?.user?.email;
  const contact_number = currentUser?.user?.contact_number;
  const [userCount, setUserCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const isActive = currentUser?.user?.is_active ? "Active" : "Inactive";

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
    console.log("loading org");
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
      console.log(data);
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
    console.log("Loading users...");
    try {
      const token = sessionStorage.getItem("accessToken");
      console.log(token);
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/users/`,
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
      console.log("Users loaded:", data);

      if (!Array.isArray(data)) {
        console.error("Unexpected API response format:", data);
        return;
      }
      const count = data.length; // Get the number of users
      console.log("Total Users:", count);
      setUserCount(count); // Update state

      setUsers(data);

      return userCount; // You can return this if needed
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

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
      const count = data.length; // Get the number of users
      console.log("Total Projects:", count);
      setProjectCount(count); // Update state

      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleOpenModal = (modalName) => {
    setActiveModal(modalName);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
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

  const handleViewOrganizations = () => {
    handleOpenDialog("viewOrganizations");
  };
  const handleExtraAction = () => {};
  const handleViewProjects = () => {
    handleOpenDialog("viewProjects");
  };
  const handleViewUsers = () => {
    handleOpenDialog("viewUsers");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8 mt-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage organizations, projects, users, and roles
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Info */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <Typography variant="h6" className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-primary" />
                  Organization
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Current organization details
                </Typography>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Name:
                    </Typography>
                    <Typography variant="body1">{organizationName}</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      ID:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {organizationId}
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Status:
                    </Typography>
                    <Badge>
                      {/* {organization.active ? "Active" : "Inactive"} */}{" "}
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Projects:
                    </Typography>
                    <Typography variant="body1">{projectCount}</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Users:
                    </Typography>
                    <Typography variant="body1">{userCount}</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Details */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <Typography variant="h6" className="flex items-center">
                  <UserCog className="mr-2 h-5 w-5 text-primary" />
                  User Details
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Current user information
                </Typography>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Name:
                    </Typography>
                    <Typography variant="body1">{userName}</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Email:
                    </Typography>
                    <Typography variant="body2">{email}</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Contact:
                    </Typography>
                    <Typography variant="body1">{contact_number}</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Role:
                    </Typography>
                    <Badge variant="secondary">Super Admin</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Status:
                    </Typography>
                    <Typography
                      variant="body1"
                      className={
                        isActive === "Active"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {isActive}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4">Administrative Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="default"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600"
                onClick={() => handleOpenDialog("organization")}
              >
                <Building2 className="h-6 w-6" />
                <span>Create Organization</span>
              </Button>
            </motion.div>

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="default"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-500 to-purple-600"
                onClick={() => handleOpenDialog("project")}
              >
                <FolderKanban className="h-6 w-6" />
                <span>Create Project</span>
              </Button>
            </motion.div>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="default"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-green-600"
                onClick={() => handleOpenDialog("createUser")}
              >
                <UserPlus className="h-6 w-6" />
                <span>Create User</span>
              </Button>
            </motion.div>

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="default"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-500 to-slate-600"
                onClick={() => handleOpenDialog("userMapping")}
              >
                <Users className="h-6 w-6" />
                <span>Map User to Organization</span>
              </Button>
            </motion.div>

            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="default"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-500 to-amber-600"
                onClick={() => handleOpenDialog("roleAssignment")}
              >
                <ShieldCheck className="h-6 w-6" />
                <span>Assign Roles</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Privileged Actions</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Quick access to system-wide management
              </p>
            </CardHeader>
            <CardContent>
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
                    Additional administrative functionality.
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
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
          <OrganizationForm onClose={handleCloseDialog} />
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
            <Project onClose={handleCloseDialog} currentUser={currentUser} />
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* View all users*/}
      <Dialog
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
      </Dialog>

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
    </div>
  );
}

export default SuperAdminDashboard;
