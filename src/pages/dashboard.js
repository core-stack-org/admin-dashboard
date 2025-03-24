import React, { useEffect } from "react";
import SuperAdminDashboard from "./superAdminDashboard.jsx";
import OrgAdminDashboard from "./orgAdminDashboard.jsx";
import ProjectManagerDashboard from "./projectManagerDashboard.jsx";

const Dashboard = ({ currentUser }) => {
  useEffect(() => {
    console.log("Current User:", currentUser);
    const userGroup = currentUser?.user?.groups?.[0]?.name;
    console.log("User Group:", userGroup);
  }, [currentUser]);

  const renderContent = () => {
    if (currentUser?.user?.is_superadmin) {
      return <SuperAdminDashboard currentUser={currentUser} />;
    }

    const userGroup = currentUser?.user?.groups?.[0]?.name;

    if (
      userGroup === "Organization Admin" ||
      userGroup === "Org Admin" ||
      userGroup === "Administrator"
    ) {
      return <OrgAdminDashboard currentUser={currentUser} />;
    } else if (userGroup === "Project Manager") {
      return <ProjectManagerDashboard currentUser={currentUser} />;
    }
    return <p>No content available for this role.</p>;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {renderContent()}
    </div>
  );
};

export default Dashboard;
