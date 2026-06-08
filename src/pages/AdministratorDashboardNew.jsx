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
  Map ,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@headlessui/react";
import Project from "../pages/project.js";
import OrganizationDetails from "./modalDialog.jsx";
import ProjectDashboard from "./projectDashboard.js";
import AssignUserToProject from "./assignUserToProject.jsx";
import AddMember from "./addMember.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import GenerateApiKeyPage from "./GenerateApiKeyPage.jsx";
import AllProjects from "./allProjects.jsx";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const AdministratorDashboardNew = ({ currentUser }) => {
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
  const [userGroups, setUserGroups] = useState([]);
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

  useEffect(() => {
    fetchUsers();
  }, []);
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
        const sortedUsers = usersData.sort((a, b) =>
          a.first_name.localeCompare(b.first_name)
        );
        setUsers(sortedUsers);
      } else if (usersData && Array.isArray(usersData.users)) {
        setUsers(usersData.users);
      } else {
        console.error("Unexpected users API response:", usersData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          toast.error("Authentication token is missing.");
          return;
        }

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

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Unexpected API response format:", data);
          return;
        }

        setUserGroups(data);
      } catch (error) {
        console.error("Error fetching user groups:", error);
        toast.error("Failed to load user groups.");
      }
    };

    fetchUserGroups();
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
            fetchUsers();
            closeModal();
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

  const handleViewPlans = () => {
    navigate(
      `/yuktdhara/organizations/${organizationId}/plans`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-50 dark:to-slate-00 p-4 md:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="text-center mb-10 mt-4">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {organizationName}
          </h1>
        </div>

  
      </motion.div>
    </div>
  );
};

export default AdministratorDashboardNew;
