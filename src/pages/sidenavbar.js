import React, { useState, useEffect } from "react";
import { LogOut, Eye } from "lucide-react";
import { Bell } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faPlug,
  faCogs,
  faLayerGroup,
  faUserCog,
  faSignOutAlt,
  faFolderOpen,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/core-stack logo.png";
import { useNavigate } from "react-router-dom";
import layersData from "../jsons/layers.json";

const SideNavbar = ({ currentuser, setCurrentUser }) => {
  const navigate = useNavigate();
  const [isLayerOpen, setIsLayerOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [layerNames, setLayerNames] = useState([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  console.log(currentuser.user);

  const [activeItem, setActiveItem] = useState(
    localStorage.getItem("activeItem") || "Dashboard"
  );
  const [layers, setLayers] = useState([]);
  useEffect(() => {
    const layers = Object.keys(layersData.layers_json).map((key) =>
      key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    );
    setLayerNames(layers);
  }, []);
  useEffect(() => {
    localStorage.setItem("activeItem", activeItem);
  }, [activeItem]);

  // const handleLogout = () => {
  //   localStorage.removeItem("userToken");
  //   sessionStorage.removeItem("userToken");
  //   setCurrentUser(null);
  //   navigate("/");
  // };

  const handleLogout = async () => {
    console.log("Logging out...");
    const token = sessionStorage.getItem("refreshToken");
    const accessToken = sessionStorage.getItem("accessToken");
    console.log(token);
    console.log(accessToken);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/auth/logout/`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            refresh_token: token,
          }),
        }
      );

      if (response.ok) {
        console.log("Logout successful");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        navigate("/");
      } else {
        const errorData = await response.json();
        console.error("Logout failed", errorData);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const menuItems = [
    {
      icon: <FontAwesomeIcon icon={faTachometerAlt} size="lg" />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <FontAwesomeIcon icon={faPlug} size="lg" />,
      label: "Activate Block",
      href: "/activateBlock",
    },
    {
      icon: <FontAwesomeIcon icon={faCogs} size="lg" />,
      label: "Plan Creation",
      href: "/planCreation",
    },
    {
      icon: <FontAwesomeIcon icon={faLayerGroup} size="lg" />,
      label: "Generate Layers",
      isSubmenu: true,
      layers: layers,
      href: "/locationForm",
    },
    {
      icon: <Eye size={20} />,
      label: "Preview Layers",
      href: "/previewLayers",
    },
    {
      icon: <FontAwesomeIcon icon={faUserCog} size="lg" />,
      label: "Setup User",
      href: "/setupUser",
    },
    {
      icon: <FontAwesomeIcon icon={faFolderOpen} size="lg" />,
      label: "Project",
      href: "/project",
    },
    {
      icon: <FontAwesomeIcon icon={faFolderOpen} size="lg" />,
      label: "Project Dashboard",
      href: "/projectDashboard",
    },
    {
      icon: <FontAwesomeIcon icon={faUserPlus} size="lg" />,
      label: "Create User",
      href: "/register",
    },
  ];

  const handleLayerClick = (layerLabel) => {
    const selectedLayerData = layersData.layers_json[layerLabel]; // Get the layer details
    setSelectedLayer(selectedLayerData);
    setActiveItem(layerLabel);

    // Navigate and send layer data via state
    navigate(`/generate-layers/${layerLabel.replace(/ /g, "-")}`, {
      state: {
        layerName: layerLabel,
        apiUrl: selectedLayerData?.api_url || "",
        showDates: selectedLayerData?.show_Dates || false,
      },
    });
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-center h-16 bg-gray-800">
          <img src={logo} alt="Logo" className="h-24 w-24 mt-10 rounded-full" />
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2 mt-10">
            {menuItems.map((item, index) => (
              <li key={index}>
                {!item.isSubmenu ? (
                  <button
                    onClick={() =>
                      item.onClick ? item.onClick() : navigate(item.href)
                    }
                    className={`flex items-center w-full px-2 py-2 rounded-lg transition-colors ${
                      activeItem === item.label
                        ? "bg-gray-700"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    <div className="w-8">{item.icon}</div>
                    <span className="ml-3">{item.label}</span>
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={() => setIsLayerOpen(!isLayerOpen)}
                      className={`flex items-center w-full px-2 py-2 rounded-lg transition-colors ${
                        activeItem === item.label
                          ? "bg-gray-700"
                          : "hover:bg-gray-700"
                      }`}
                    >
                      <div className="w-8">{item.icon}</div>
                      <span className="ml-3">{item.label}</span>
                      <span className="ml-auto">{isLayerOpen ? "▲" : "▼"}</span>
                    </button>
                    {/* Dynamically Render Layers */}
                    {isLayerOpen && layerNames.length > 0 && (
                      <ul className="pl-6 mt-2 space-y-1">
                        {layerNames.map((layer, idx) => (
                          <li key={idx}>
                            <button
                              onClick={() => handleLayerClick(layer)}
                              className={`block px-2 py-1 w-full rounded-lg text-left text-sm ${
                                activeItem === layer
                                  ? "bg-gray-600"
                                  : "hover:bg-gray-600"
                              }`}
                            >
                              {layer}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Top Navbar */}
      <nav className="fixed top-0 left-64 right-0 bg-gray-800 text-white h-16 z-20">
        <div className="flex items-center h-full px-4 relative">
          <h1 className="text-xl font-bold mx-auto">NRM Dashboard</h1>
          {/* <div className="absolute right-20">
            <button className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full hover:bg-gray-500">
              <Bell size={20} className="text-white" />
            </button>
          </div> */}

          <div className="relative mr-4">
            <button className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
              <Bell size={20} className="text-white" />
              {/* <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"></span> */}
            </button>
          </div>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={toggleDropdown}
            >
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-bold">
                  {currentuser?.user?.first_name?.charAt(0)?.toUpperCase() ||
                    ""}
                  {currentuser?.user?.last_name?.charAt(0)?.toUpperCase() || ""}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-12 right-0 w-56 bg-white shadow-lg rounded-lg z-30 text-gray-800 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="text-sm font-medium">
                    {currentuser?.user?.first_name}{" "}
                    {currentuser?.user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentuser?.user?.email || "user@example.com"}
                  </p>
                </div>

                <ul>
                  <li className="hover:bg-gray-50">
                    <button className="flex items-center w-full px-4 py-2 text-sm">
                      <svg
                        className="w-4 h-4 mr-3 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </button>
                  </li>
                  <li className="border-t">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SideNavbar;
