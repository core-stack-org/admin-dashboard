import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  UserCog,
  FolderKanban,
  Users,
  ListTodo,
  FolderPlus,
  UserCheck,
  X,
  Eye,
  Edit,
  UserPlus,
  UserMinus,
  Settings,
  Globe,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent } from "@mui/material";
import { Badge } from "@mui/material";
import { Dialog } from "@headlessui/react";
import Project from "../pages/project.js";
import OrganizationDetails from "./modalDialog.jsx";
import ProjectDashboard from "./projectDashboard.js";
import AssignUserToProject from "./assignUserToProject.jsx";
import AddMember from "./addMember.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const OrgAdminDashboard = ({ currentUser }) => {
  const organizationName = currentUser?.user?.organization_name;
  const organizationId = currentUser?.user?.organization;
  const userName = currentUser?.user?.username;
  const email = currentUser?.user?.email;
  const contact_number = currentUser?.user?.contact_number;
  const role = currentUser?.user?.groups?.[0]?.name;
  const userid = currentUser?.user?.id;

  const [orgDetails, setOrgDetails] = useState(null);
  const [orgMembers, setOrgMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState(null);
  const [openModal, setOpenModal] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [visibleCards, setVisibleCards] = useState(3);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth < 768)
        setVisibleCards(1); // Mobile: 1 card at a time
      else if (window.innerWidth < 1024) setVisibleCards(2); // Tablet: 2 cards
      else setVisibleCards(3); // Desktop: 3 cards
    };
    window.addEventListener("resize", updateVisibleCards);
    updateVisibleCards();
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  useEffect(() => {
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

        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const projectActions = [
    {
      id: "projects",
      title: "Create Project",
      description: "Create a new project for your organization",
      color:
        "from-violet-50 to-purple-100 dark:from-violet-50 dark:to-purple-100",
      borderColor: "border-purple-300 dark:border-purple-300",
      iconBg: "bg-purple-500",
      icon: <FolderPlus className="h-7 w-7 text-white" />,
      textColor: "text-purple-500",
    },
    {
      id: "listprojects",
      title: "List Projects",
      description: "View all projects in your organization",
      color: "from-blue-50 to-sky-100 dark:from-blue-50 dark:to-sky-100",
      borderColor: "border-sky-300 dark:border-sky-300",
      iconBg: "bg-blue-500",
      icon: <ListTodo className="h-7 w-7 text-white" />,
      textColor: "text-blue-500",
    },
    {
      id: "assignproject",
      title: "Assign Project Role",
      description: "Assign users to roles within projects",
      color:
        "from-fuchsia-50 to-pink-100 dark:from-fuchsia-50 dark:to-pink-100",
      borderColor: "border-pink-300 dark:border-pink-300",
      iconBg: "bg-pink-500",
      icon: <UserCheck className="h-7 w-7 text-white" />,
      textColor: "text-pink-500",
    },
    {
      id: "removeuserrole",
      title: "Remove User Role",
      description: "Remove user role from a project",
      color: "from-red-50 to-rose-100 dark:from-red-50 dark:to-rose-100",
      borderColor: "border-red-300 dark:border-red-300",
      iconBg: "bg-red-500",
      icon: <UserMinus className="h-7 w-7 text-white" />,
      textColor: "text-red-500",
    },
  ];

  const [startIndex, setStartIndex] = useState(0);

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 3 < projectActions.length ? prev + 3 : 0));
  };

  const prevSlide = () => {
    setStartIndex((prev) =>
      prev - 3 >= 0 ? prev - 3 : projectActions.length - 3
    );
  };
  const handleOpenModal = async (type) => {
    setModalType(type);
    setIsModalOpen(true);
    setSelectedUser("");
    setSelectedRole("");

    try {
      let data = null;

      if (type === "view") {
        data = await fetchOrganizationDetails();
      } else if (type === "update") {
        data = await updateOrganizationDetails();
      } else if (
        [
          "members",
          "projects",
          "listprojects",
          "assignproject",
          "addmember",
          "removeMember",
          "assignrole",
          "removeuserrole",
        ].includes(type)
      ) {
        data = await fetchOrgMembers(); // or a more specific fetchProjectMembers() if available
      }

      if (data?.data) {
        setModalData(data.data);
      } else {
        console.error("No data returned for type:", type);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchOrgMembers = async () => {
    setIsModalOpen(true);
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
      if (response.ok) {
        const data = await response.json();
        setOrgMembers(data);
      } else {
        console.error("Failed to fetch organization members");
      }
    } catch (error) {
      console.error("Error fetching organization members:", error);
    }
  };

  const fetchOrganizationDetails = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/organizations/${organizationId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        return await response.json();
      } else {
        console.error("Failed to fetch organization details");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch organization details:", error);
      return null;
    }
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
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

      const usersData = await response.json();
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else if (usersData && Array.isArray(usersData.users)) {
        setUsers(usersData.users); // If users are nested under 'users'
      } else {
        console.error("Unexpected users API response:", usersData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/groups/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "420",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const groupData = await response.json();

        if (Array.isArray(groupData)) {
          setGroups(groupData); // Set groups properly
        } else {
          console.error("Unexpected groups API response:", groupData);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const updateOrganizationDetails = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/organizations/${organizationId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrgDetails(data);
        openModal(true);
      } else {
        console.error("Failed to fetch organization details");
      }
    } catch (error) {
      console.error("Error fetching organization details:", error);
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

  const assignRole = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedRole) {
      toast.error("Please select both a user and a role.");
      return;
    }

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/users/${selectedUser}/set_group/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            group_id: Number(selectedRole),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Role assigned successfully!", {
          onClose: () => {
            fetchUsers(); // ✅ Refresh the org member list
            closeModal(); // ✅ Close the modal
          },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-50 dark:to-slate-00 p-4 md:p-8 mt-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage organizations, projects, users, and roles
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <p className="text-sm text-secondary">
                  Current user information
                </p>
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

        {/* Organization Management Section */}
        <motion.div variants={itemVariants}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-blue-500" />
              Organization Management
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              View, update and manage organization members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* View Button */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="cursor-pointer"
              onClick={() => handleOpenModal("view")}
            >
              <div className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-50 dark:to-blue-100 border border-blue-200 dark:border-blue-200 h-40 rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center text-center p-6 transition-all">
                <div className="bg-blue-500 p-3 rounded-full mb-3">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-blue-600 dark:text-blue-600 mb-1">
                  View
                </h3>
                <p className="text-sm text-blue-500 dark:text-blue-500">
                  View organization details
                </p>
              </div>
            </motion.div>

            {/* Update Button */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="cursor-pointer"
              onClick={() => handleOpenModal("update")}
            >
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-50 dark:to-teal-100 border border-teal-200 dark:border-teal-200 h-40 rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center text-center p-6 transition-all">
                <div className="bg-teal-500 p-3 rounded-full mb-3">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-teal-600 dark:text-teal-600 mb-1">
                  Update
                </h3>
                <p className="text-sm text-teal-500 dark:text-teal-500">
                  Modify organization settings
                </p>
              </div>
            </motion.div>

            {/* Org Members Button */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="cursor-pointer"
              onClick={() => handleOpenModal("members")}
            >
              <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-50 dark:to-indigo-100 border border-indigo-200 dark:border-indigo-200 h-40 rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center text-center p-6 transition-all">
                <div className="bg-indigo-500 p-3 rounded-full mb-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-600 mb-1">
                  Org Members
                </h3>
                <p className="text-sm text-indigo-500 dark:text-indigo-500">
                  Manage organization members
                </p>
              </div>
            </motion.div>
          </div>

          <Dialog
            open={isModalOpen}
            onClose={closeModal}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              {(modalType === "view" || modalType === "update") && (
                <div>
                  <OrganizationDetails
                    modalData={modalData}
                    closeModal={closeModal}
                    mode={modalType === "update" ? "edit" : "view"}
                  />
                </div>
              )}
              {modalType === "members" && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-6 overflow-hidden">
                    {/* Header */}
                    <div className="bg-indigo-700 text-white px-8 py-5 flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Org Members</h2>
                      <button
                        onClick={closeModal}
                        className="text-white hover:bg-indigo-800 rounded-full p-2 focus:outline-none"
                      >
                        <svg
                          className="w-6 h-6"
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
                    <div className="p-6 overflow-auto max-h-[70vh]">
                      {users.length > 0 ? (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-200 text-md text-gray-800">
                                <th className="py-3 px-4 text-left w-12">
                                  S. No.
                                </th>
                                <th className="py-3 px-4 text-left">Name</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Roles</th>
                                <th className="py-3 px-4 text-left">Project</th>
                              </tr>
                            </thead>
                            <tbody>
                              {users.map((user, index) => (
                                <tr
                                  key={user.id}
                                  className="border-b border-gray-300 hover:bg-gray-100 transition"
                                >
                                  <td className="py-3 px-4 text-gray-700 text-center">
                                    {index + 1}
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-gray-900">
                                    {user.username}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700">
                                    {user.email}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700">
                                    {user.groups.length > 0
                                      ? user.groups
                                          .map((group) => group.name)
                                          .join(", ")
                                      : "N/A"}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700">
                                    {user.project_details?.length > 0
                                      ? user.project_details
                                          .map((p) => p.project_name)
                                          .join(", ")
                                      : "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center text-lg">
                          No users found.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {modalType === "projects" && (
                <div>
                  <Project
                    currentUser={currentUser}
                    closeModal={closeModal}
                    statesList={statesList}
                  />
                </div>
              )}
              {modalType === "listprojects" && (
                <div>
                  <ProjectDashboard
                    closeModal={closeModal}
                    currentUser={currentUser}
                    statesList={statesList}
                  />
                </div>
              )}
              {modalType === "assignproject" && (
                <div>
                  <AssignUserToProject
                    closeModal={closeModal}
                    currentUser={currentUser}
                    mode="assign"
                  />
                </div>
              )}{" "}
              {modalType === "addmember" && (
                <div>
                  <AddMember
                    closeModal={closeModal}
                    currentUser={currentUser}
                    isSuperAdmin={false}
                    onUserCreated={fetchUsers}
                  />
                </div>
              )}
              {modalType === "assignrole" && (
                <div>
                  <div>
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <ToastContainer
                        position="bottom-right"
                        autoClose={3000}
                      />

                      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
                          <h2 className="text-xl font-semibold">
                            Assign role to member
                          </h2>
                          <button
                            onClick={closeModal}
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
                                <form
                                  onSubmit={assignRole}
                                  className="space-y-2"
                                >
                                  {/* User Name */}
                                  <div className="w-full">
                                    <label className="block text-lg font-medium mb-3">
                                      User Name
                                    </label>
                                    <select
                                      value={selectedUser}
                                      onChange={(e) => {
                                        console.log(
                                          "selected user",
                                          e.target.value
                                        );
                                        setSelectedUser(e.target.value);
                                      }}
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
                                      {groups.map((group) => (
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
              )}
              {modalType === "removeuserrole" && (
                <div>
                  <AssignUserToProject
                    currentUser={currentUser}
                    closeModal={closeModal}
                    mode="remove"
                  />
                </div>
              )}
              <button
                onClick={closeModal}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </Dialog>

          <motion.div variants={itemVariants}>
            {/* Project Management Section */}
            <motion.div variants={itemVariants} className="mt-8">
              {/*Project section */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <FolderKanban className="mr-2 h-5 w-5 text-purple-500" />
                  Project Management
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  View, create, and manage projects and project team members
                </p>

                {/* Slider Container */}
                <div className="relative flex items-center mt-4">
                  {/* Left Arrow */}
                  <button
                    onClick={prevSlide}
                    className="p-3 bg-gray-300 dark:bg-gray-300 rounded-full mr-2 hover:bg-gray-400 dark:hover:bg-gray-400 transition shadow-md"
                  >
                    ◀
                  </button>

                  {/* Visible Area */}
                  <div className="w-full overflow-hidden rounded-xl">
                    <motion.div
                      className="flex gap-4"
                      animate={{ x: `-${startIndex * (100 / visibleCards)}%` }}
                      transition={{
                        type: "tween",
                        duration: 0.5,
                        ease: "easeInOut",
                      }}
                      style={{ minWidth: "100%", display: "flex" }}
                    >
                      {projectActions.map((action, index) => {
                        return (
                          <motion.div
                            key={action.id}
                            className="cursor-pointer w-1/3 flex-shrink-0 p-2"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleOpenModal(action.id)}
                          >
                            <div
                              className={`bg-gradient-to-br ${action.color} ${action.borderColor} border-2 h-44 rounded-2xl shadow-md flex flex-col items-center justify-center text-center px-5 py-6 transition-all`}
                            >
                              <div
                                className={`${action.iconBg} p-4 rounded-full mb-3 shadow-lg`}
                              >
                                {action.icon}
                              </div>
                              <h3
                                className={`font-semibold text-lg mb-1 ${action.textColor}`}
                              >
                                {action.title}
                              </h3>
                              <p className={`text-sm ${action.textColor}`}>
                                {action.description}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={nextSlide}
                    className="p-3 bg-gray-300 dark:bg-gray-300 rounded-full ml-2 hover:bg-gray-400 dark:hover:bg-gray-400 transition shadow-md"
                  >
                    ▶
                  </button>
                </div>
              </div>

              <div className="mb-4 mt-12">
                <h2 className="text-xl font-semibold flex items-center">
                  <Users className="mr-2 h-5 w-5 text-amber-500" />
                  User Management
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Add, remove, and manage user roles within your organization
                </p>
              </div>

              {/* User Management Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Add Member Button */}
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="cursor-pointer"
                  onClick={() => handleOpenModal("addmember")}
                >
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-50 dark:to-emerald-100 border border-emerald-200 dark:border-emerald-200 h-40 rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center text-center p-6 transition-all">
                    <div className="bg-green-500 p-3 rounded-full mb-3">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-600 dark:text-green-600 mb-1">
                      Add Member
                    </h3>
                    <p className="text-sm text-green-500 dark:text-green-500">
                      Invite new users to your organization
                    </p>
                  </div>
                </motion.div>
                {/* Assign Role Button */}
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="cursor-pointer"
                  onClick={() => handleOpenModal("assignrole")}
                >
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-50 dark:to-yellow-100 border border-yellow-200 dark:border-yellow-200 h-40 rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center text-center p-6 transition-all">
                    <div className="bg-amber-500 p-3 rounded-full mb-3">
                      <UserCog className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-amber-600 dark:text-amber-600 mb-1">
                      Assign Role
                    </h3>
                    <p className="text-sm text-amber-500 dark:text-amber-500">
                      Manage user permissions and roles
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrgAdminDashboard;
