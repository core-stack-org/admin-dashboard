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
  Plug,
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
import GenerateApiKeyPage from "../GenerateApiKeyPage.jsx";
import AllProjects from "./allProjects.jsx";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

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
      iconBg: "bg-purple-500",
      icon: <FolderPlus className="h-7 w-7 text-white" />,
      hoverBorder: "hover:border-purple-500",
    },
    {
      id: "listprojects",
      title: "List Projects",
      description: "View all projects in your organization",
      iconBg: "bg-blue-500",
      icon: <ListTodo className="h-7 w-7 text-white" />,
      hoverBorder: "hover:border-blue-500",
    },
    {
      id: "assignproject",
      title: "Assign Project Role",
      description: "Assign users to roles within projects",
      iconBg: "bg-pink-500",
      icon: <UserCheck className="h-7 w-7 text-white" />,
      hoverBorder: "hover:border-pink-500",
    },
    {
      id: "removeuserrole",
      title: "Remove User Role",
      description: "Remove user role from a project",
      iconBg: "bg-red-500",
      icon: <UserMinus className="h-7 w-7 text-white" />,
      hoverBorder: "hover:border-red-500",
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
    if (type === "listprojects") {
      navigate("/projects");
      return;
    }
    if (type === "members") {
      navigate("/users");
      return;
    }
    if (type === "projects") {
      navigate("/create-project");
      return;
    }
    if (type === "addmember") {
      navigate("/create-user");
      return;
    }

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
      } else if (type === "generateapikey") {
        // const res = await fetchUserApiKeys();
        // data = { data: res.api_keys };
      } else if (
        [
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

  useEffect(() => {
    fetchUserApiKeys();
  }, []);
  const fetchUserApiKeys = async () => {
    const token = sessionStorage.getItem("accessToken");
    const response = await fetch(
      `${process.env.REACT_APP_BASEURL}api/v1/get_user_api_keys/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch API keys");
    return await response.json();
  };

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
        `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-50 dark:to-slate-00 p-4 md:p-8">
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
            className="text-[3.5rem] font-black uppercase tracking-[2px] mb-4"
            style={{
              background: "linear-gradient(45deg, #0066cc, #6600cc, #cc6600)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientShift 3s ease-in-out infinite",
            }}
          >
            Admin Dashboard
          </h1>
          <p className="text-[1.2rem] text-gray-600 opacity-80">
            Manage organizations, projects, users, and roles
          </p>
          <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Info */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate="show"
            className="group transition-all"
          >
            <div className="relative bg-white border border-gray-300 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-600 group min-h-[280px]">
              {/* Top Hover Bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-blue-600 font-semibold text-lg flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="text-blue-600 h-5 w-5"
                  />
                  Organization
                </h3>
                <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                  {currentUser?.user?.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Name</span>
                  <span className="text-gray-900 font-bold">
                    {organizationName}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">ID</span>
                  <span className="text-gray-800 font-bold">
                    {organizationId}
                  </span>
                </div>
                {/* <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Projects</span>
          <span className="text-gray-900 font-bold">{projectCount}</span>
        </div> */}
              </div>
            </div>
          </motion.div>

          {/* User Details */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate="show"
            className="group transition-all"
          >
            <div className="relative bg-white border border-gray-300 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-600 group min-h-[280px]">
              {/* Top Hover Bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
                  <FontAwesomeIcon icon={faUserCog} className="h-5 w-5" />
                  User Details
                </div>
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

              {/* Details */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">User name</span>
                  <span className="text-gray-900 font-bold">{userName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Email</span>
                  <span className="text-gray-800 font-semibold">
                    {email || "NA"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-medium">Contact</span>
                  <span className="text-gray-900 font-semibold">
                    {contact_number || "NA"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Role</span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {role}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Organization Management Section */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="mb-4 mt-12">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600">
              User Management
            </h2>
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
              <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-emerald-500 hover:shadow-[0_15px_30px_rgba(16,185,129,0.2)] min-h-[180px] h-[180px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-green-500 p-3 rounded-full mb-2">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                    Add Member
                  </h3>
                  <p className="text-sm text-gray-600">
                    Invite new users to your organization
                  </p>
                </div>
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
              <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-amber-500 hover:shadow-[0_15px_30px_rgba(251,191,36,0.2)] min-h-[180px] h-[180px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-amber-500 p-3 rounded-full mb-2">
                    <UserCog className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                    Assign Role
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage user permissions and roles
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Generate API Key Button */}
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="cursor-pointer"
              onClick={() => handleOpenModal("generateapikey")}
            >
              <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-indigo-500 hover:shadow-[0_15px_30px_rgba(99,102,241,0.2)] min-h-[180px] h-[180px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-indigo-500 p-3 rounded-full mb-2">
                    <Plug className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                    Generate API Key
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create a secure key for API access
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <Dialog
            open={isModalOpen}
            onClose={closeModal}
            className="fixed inset-0 z-[999] bg-black bg-opacity-50 flex items-center justify-center"
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
              {modalType === "assignproject" && (
                <div>
                  <AssignUserToProject
                    closeModal={closeModal}
                    currentUser={currentUser}
                    mode="assign"
                    onUserCreated={fetchUsers}
                  />
                </div>
              )}{" "}
              {modalType === "generateapikey" && (
                <div>
                  <GenerateApiKeyPage
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
                                          {user.username} ({user.first_name}{" "}
                                          {user.last_name})
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
              <div className="flex justify-center mt-4">
                <button
                  onClick={closeModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </Dialog>

          <motion.div variants={itemVariants} className="mb-10">
            {/* Project Management Section */}
            <motion.div variants={itemVariants} className="mt-12">
              {/*Project section */}
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600">
                Project Management
              </h2>

              {/* Slider Container */}
              {/* Slider Container */}
              {/* Slider Container */}
              <div className="relative w-full mt-10">
                {/* ◀ Left Arrow (outside) */}
                <button
                  onClick={prevSlide}
                  className="absolute -left-12 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-100 transition"
                >
                  ◀
                </button>

                {/* ▶ Right Arrow (outside) */}
                <button
                  onClick={nextSlide}
                  className="absolute -right-12 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white border border-gray-200 rounded-full shadow hover:bg-gray-100 transition"
                >
                  ▶
                </button>

                {/* Slider track */}
                <div className="overflow-hidden px-2">
                  <motion.div
                    className="flex gap-6"
                    animate={{ x: `-${startIndex * (100 / visibleCards)}%` }}
                    transition={{
                      type: "tween",
                      duration: 0.5,
                      ease: "easeInOut",
                    }}
                    style={{ minWidth: "100%" }}
                  >
                    {projectActions.map((action) => (
                      <motion.div
                        key={action.id}
                        className="w-1/3 flex-shrink-0"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => handleOpenModal(action.id)}
                      >
                        <div
                          className={`relative group bg-white border-2 border-transparent rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] ${action.hoverBorder} hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] min-h-[200px] h-[200px] max-w-[92%] mx-auto flex flex-col items-center justify-center my-10`}
                        >
                          {/* Hover Ripple Effect */}
                          <div className="absolute inset-0 pointer-events-none z-0">
                            <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(0,102,204,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
                          </div>

                          {/* Card Content */}
                          <div className="relative z-10 flex flex-col items-center">
                            <div
                              className={`${action.iconBg} p-3 rounded-full mb-2`}
                            >
                              {action.icon}
                            </div>
                            <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-purple-600">
                Organization Management
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* View Button */}
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="cursor-pointer"
                  onClick={() => handleOpenModal("view")}
                >
                  <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-[#4285f4] hover:shadow-[0_15px_30px_rgba(66,133,244,0.2)] min-h-[200px] z-10">
                    {/* Smooth radial hover effect inside only */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                      <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(0,102,204,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
                    </div>

                    {/* Card content stays above effect */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="bg-blue-500 p-2 rounded-full mb-2">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                        View
                      </h3>
                      <p className="text-sm text-gray-600">
                        View organization details
                      </p>
                    </div>
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
                  <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-teal-500 hover:shadow-[0_15px_30px_rgba(13,148,136,0.2)] min-h-[200px] z-10">
                    <div className="absolute inset-0 pointer-events-none z-0">
                      <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="bg-teal-500 p-2 rounded-full mb-2">
                        <Edit className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                        Update
                      </h3>
                      <p className="text-sm text-gray-600">
                        Modify organization settings
                      </p>
                    </div>
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
                  <div className="relative group bg-white border-2 border-gray-200 rounded-[15px] p-5 text-center transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:scale-[1.02] hover:border-indigo-500 hover:shadow-[0_15px_30px_rgba(99,102,241,0.2)] min-h-[200px] z-10">
                    <div className="absolute inset-0 pointer-events-none z-0">
                      <div className="absolute top-1/2 left-1/2 w-0 h-0 group-hover:w-[300px] group-hover:h-[300px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="bg-indigo-500 p-2 rounded-full mb-2">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-1">
                        Org Members
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage organization members
                      </p>
                    </div>
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
