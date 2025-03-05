import React, { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/login";
import ActivateBlock from "./pages/activateBlock";
import Dashboard from "./pages/dashboard";
import ProjectDashboard from "./pages/projectDashboard";
import Project from "./pages/project";
import PlanCreation from "./pages/planCreation";
import PreviewLayers from "./pages/previewLayer";
import SetupUser from "./pages/setupUser";
import LocationForm from "./pages/locationForm";
import PlantationAssessment from "./pages/plantationAssessment";
import UserRegistration from "./pages/userRegistration";
import OrgDashboard from "./pages/orgDashboard";
import SideNavbar from "./pages/sidenavbar";
import { ToastContainer } from "react-toastify";

function AppLayout({ currentUser, setCurrentUser }) {
  const location = useLocation();
  const showSidebar = currentUser && location.pathname !== "/";

  return (
    <>
      <div className="flex h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        {showSidebar && (
          <SideNavbar
            currentuser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}

        {/* Add a main content div */}
        <div className={`flex-1 ${showSidebar ? "ml-64" : ""}`}>
          <Routes>
            <Route
              path="/"
              element={<Login setCurrentUser={setCurrentUser} />}
            />
            <Route path="/register" element={<UserRegistration />} />
            {currentUser ? (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/activateBlock" element={<ActivateBlock />} />
                <Route
                  path="/project"
                  element={<Project currentuser={currentUser} />}
                />
                <Route
                  path="/projectDashboard"
                  element={<ProjectDashboard />}
                />
                <Route path="/planCreation" element={<PlanCreation />} />
                <Route path="/previewLayers" element={<PreviewLayers />} />
                <Route path="/setupUser" element={<SetupUser />} />
                <Route path="/orgDashboard" element={<OrgDashboard />} />
                <Route
                  path="/plantationAssessment"
                  element={<PlantationAssessment isEmbedded={false} />}
                />
                <Route
                  path="/generate-layers/:layerName"
                  element={<LocationForm />}
                />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/" replace />} />
            )}
          </Routes>
        </div>
      </div>
    </>
  );
}
function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("currentUser"));
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  return (
    <BrowserRouter>
      <AppLayout currentUser={currentUser} setCurrentUser={setCurrentUser} />
    </BrowserRouter>
  );
}

export default App;
