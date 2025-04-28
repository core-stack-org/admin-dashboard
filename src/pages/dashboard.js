import React from "react";
import SuperAdminDashboard from "./superAdminDashboard.jsx";
import OrgAdminDashboard from "./orgAdminDashboard.jsx";
import ProjectManagerDashboard from "./projectManagerDashboard.jsx";
import AppUserDashboard from "./appUserDashboard.js";

const Dashboard = ({ currentUser }) => {
  const getHighestPriorityRole = () => {
    if (currentUser?.user?.is_superadmin) {
      return "Super Admin";
    }

    const userGroups = currentUser?.user?.groups?.map((g) => g.name) || [];

    const priorityOrder = [
      "Organization Admin",
      "Org Admin",
      "Administrator",
      "Project Manager",
      "App User",
    ];

    for (const role of priorityOrder) {
      if (userGroups.includes(role)) {
        return role;
      }
    }

    // If no known roles found, fallback to App User
    return "App User";
  };

  const renderContent = () => {
    const highestRole = getHighestPriorityRole();

    switch (highestRole) {
      case "Super Admin":
        return <SuperAdminDashboard currentUser={currentUser} />;
      case "Organization Admin":
      case "Org Admin":
      case "Administrator":
        return <OrgAdminDashboard currentUser={currentUser} />;
      case "Project Manager":
        return <ProjectManagerDashboard currentUser={currentUser} />;
      case "App User":
      default:
        return <AppUserDashboard currentUser={currentUser} />;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {renderContent()}
    </div>
  );
};

export default Dashboard;
