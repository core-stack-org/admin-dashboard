import { useState } from "react";
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

function SuperAdminDashboard({ currentUser }) {
  const [activeModal, setActiveModal] = useState(null);
  const [openDialog, setOpenDialog] = useState(null);

  const handleOpenDialog = (dialogName) => {
    setOpenDialog(dialogName);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const mainRoles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access and control",
    },
    {
      id: 2,
      name: "Organization Admin",
      description: "Manage organization settings and users",
    },
    {
      id: 3,
      name: "Project Manager",
      description: "Create and manage projects",
    },
    {
      id: 4,
      name: "User Manager",
      description: "Manage user access and roles",
    },
  ];

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
                    <Typography variant="body1">
                      {/* {organization.name} */}Test Org
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      ID:
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      abcd
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
                    <Typography variant="body1">3</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Users:
                    </Typography>
                    <Typography variant="body1">
                      {/* {organization.userCount} */} 12
                    </Typography>
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
                    <Typography variant="body1">Manvi Rajput</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Email:
                    </Typography>
                    <Typography variant="body2">manvi@gmail.com</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-medium">
                      Contact:
                    </Typography>
                    <Typography variant="body1">9876543210</Typography>
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
                    <Badge>
                      {/* {user.active ? "Active" : "Inactive"} */} Active
                    </Badge>
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
                <h2 className="text-lg font-semibold">Privileged Roles</h2>{" "}
                {/* Title using Typography */}
              </div>
              <p className="text-sm text-muted-foreground">
                Main system roles with special permissions
              </p>{" "}
              {/* Description using Typography */}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mainRoles.map((role) => (
                  <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    className="border rounded-lg p-4 bg-card"
                  >
                    <div className="font-medium text-lg">{role.name}</div>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </motion.div>
                ))}
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
        <DialogTitle>Assign role </DialogTitle>
        <DialogContent>
          <AddMember onClose={handleCloseDialog} currentUser={currentUser} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SuperAdminDashboard;
