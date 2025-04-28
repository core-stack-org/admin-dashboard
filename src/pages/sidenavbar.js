import React, { useState, useEffect } from "react";
import { LogOut, Eye, EyeOff } from "lucide-react";
import { Bell } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faPlug,
  faCogs,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/core-stack logo.png";
import { useNavigate } from "react-router-dom";
import layersData from "../jsons/layers.json";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const SideNavbar = ({ currentuser, setCurrentUser }) => {
  const navigate = useNavigate();
  const [isLayerOpen, setIsLayerOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [layerNames, setLayerNames] = useState([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  console.log(currentuser);
  const role = currentuser?.user?.groups?.[0]?.name;
  console.log("User Role:", role); // Output: "Administrator"

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const [activeItem, setActiveItem] = useState(
    sessionStorage.getItem("activeItem") || "Dashboard"
  );
  const [layers, setLayers] = useState([]);
  useEffect(() => {
    const layers = Object.keys(layersData.layers_json).map((key) =>
      key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    );
    setLayerNames(layers);
  }, []);
  useEffect(() => {
    sessionStorage.setItem("activeItem", activeItem);
  }, [activeItem]);

  // const handleLogout = async () => {
  //   const token = sessionStorage.getItem("refreshToken");
  //   const accessToken = sessionStorage.getItem("accessToken");
  //   try {
  //     const response = await fetch(
  //       `${process.env.REACT_APP_BASEURL}api/v1/auth/logout/`,
  //       {
  //         method: "POST",
  //         mode: "cors",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //         body: JSON.stringify({
  //           refresh_token: token,
  //         }),
  //       }
  //     );

  //     if (response.ok) {
  //       toast.success("Logged out successfully!");

  //       sessionStorage.removeItem("accessToken");
  //       sessionStorage.removeItem("refreshToken");
  //       localStorage.removeItem("currentUser");
  //       setCurrentUser(null);
  //       navigate("/");
  //     } else {
  //       const errorData = await response.json();
  //       console.error("Logout failed", errorData);
  //     }
  //   } catch (error) {
  //     console.error("Error during logout:", error);
  //   }
  // };

  const handleLogout = async () => {
    let accessToken = sessionStorage.getItem("accessToken");
    let refreshToken = sessionStorage.getItem("refreshToken");

    const logoutApiCall = async (token, refreshToken) => {
      return fetch(`${process.env.REACT_APP_BASEURL}api/v1/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    };

    try {
      console.log(
        "🚀 Attempting logout with current access token:",
        accessToken
      );
      let response = await logoutApiCall(accessToken, refreshToken);

      if (response.status === 401 || response.status === 403) {
        console.warn("🔄 Access token expired, refreshing...");
        try {
          const { access, refresh } = await refreshAccessToken(); // get both tokens
          sessionStorage.setItem("accessToken", access);
          sessionStorage.setItem("refreshToken", refresh);
          accessToken = access;
          refreshToken = refresh;
          console.log("✅ New tokens set, retrying logout...");
          response = await logoutApiCall(accessToken, refreshToken);
        } catch (refreshError) {
          console.error("❌ Token refresh failed during logout:", refreshError);
          throw refreshError;
        }
      }

      if (response.ok) {
        toast.success("✅ Logged out successfully!");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("currentUser");
        setCurrentUser(null);
        navigate("/");
      } else {
        const errorData = await response.json();
        console.error("❌ Logout failed:", errorData);
      }
    } catch (error) {
      console.error("🔥 Error during logout:", error);
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = sessionStorage.getItem("refreshToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/auth/token/refresh/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      if (!response.ok) throw new Error("Failed to refresh token");

      const data = await response.json();
      sessionStorage.setItem("accessToken", data.access);
      sessionStorage.setItem("refreshToken", data.refresh);

      console.log("✅ New tokens generated:", data.access, data.refresh);
      return {
        access: data.access,
        refresh: data.refresh,
      };
    } catch (error) {
      console.error("❌ Refresh token failed:", error);
      throw error;
    }
  };

  const handleChangePassword = async (oldPass, newPass, newPassConfirm) => {
    const payload = {
      old_password: oldPass,
      new_password: newPass,
      new_password_confirm: newPassConfirm,
    };

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/users/change_password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "420",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}. Details: ${errorDetails}`
        );
      }

      const result = await response.json();
      toast.success("Password updated successfully!");
      console.log("Password change response:", result);
      // Clear and close modal on success
      setOldPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setIsChangeModalOpen(false);
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Error changing password. Please try again.");
    }
  };

  const handleSubmitPasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      toast.error("New passwords do not match!");
      return;
    }
    handleChangePassword(oldPassword, newPassword, newPasswordConfirm);
  };

  const openChangePasswordModal = () => {
    setIsChangeModalOpen(true);
    setIsDropdownOpen(false);
  };

  const restrictedRoles = ["Administrator", "Project Manager", "App User"];

  const isSuperAdmin = currentuser.user.is_superadmin;
  const userRoles = currentuser.user.groups || [];

  const menuItems = [
    {
      icon: <FontAwesomeIcon icon={faTachometerAlt} size="lg" />,
      label: "Dashboard",
      href: "/dashboard",
    },
  ];

  const showFullMenu =
    isSuperAdmin ||
    (userRoles.length > 0 &&
      !userRoles.some((role) => {
        console.log("Checking role:", role); // Log each role in the user's groups
        return restrictedRoles.includes(role.name || role); // If role is an object, check the 'name' property
      }));

  console.log("showFullMenu:", showFullMenu);
  if (showFullMenu) {
    menuItems.push(
      {
        icon: <FontAwesomeIcon icon={faPlug} size="lg" />,
        label: "Activate Location",
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
      }
    );
  }

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
      <ToastContainer position="top-right" autoClose={3000} />

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
          <h1 className="text-xl font-bold mx-auto">CoreStack Dashboard</h1>

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
                  {/* New Change Password option */}
                  <li className="hover:bg-gray-50">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-blue-600"
                      onClick={openChangePasswordModal}
                    >
                      {/* Use whichever lock icon you prefer */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-3 text-blue-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a4 4 0 00-4 4v2H5a2 2 
           0 00-2 2v6a2 2 0 002 2h10a2 2 
           0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 
           0 00-4-4zm0 12a1 1 0 110-2 1 1 
           0 010 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Change Password
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
      {/* Change Password Modal */}
      {isChangeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsChangeModalOpen(false)}
          ></div>

          <div className="bg-white rounded-lg shadow-lg z-50 p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleSubmitPasswordChange}>
              {/* Current Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border rounded focus:outline-none focus:ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  >
                    {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border rounded focus:outline-none focus:ring"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border rounded focus:outline-none focus:ring"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-4 px-4 py-2 rounded bg-gray-200 text-gray-700"
                  onClick={() => setIsChangeModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideNavbar;
