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
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/core-stack logo.png";
import { useNavigate } from "react-router-dom";
import layersData from "../jsons/layers.json";

const Sidebar = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [isLayerOpen, setIsLayerOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [layerNames, setLayerNames] = useState([]);

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

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("userToken");
    setCurrentUser(null);
    navigate("/");
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
      icon: <FontAwesomeIcon icon={faSignOutAlt} size="lg" />,
      label: "Logout",
      onClick: handleLogout,
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
          <div className="absolute right-20">
            <button className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full hover:bg-gray-500">
              <Bell size={20} className="text-white" />
            </button>
          </div>
          <div className="absolute right-4 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-sm">U</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
