import React, { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/login";
import ActivateBlock from "./pages/activateBlock";
import SideNavBar from "./pages/sidenavbar";
import Dashboard from "./pages/dashboard";
import ProjectDashboard from "./pages/projectDashboard";
import Project from "./pages/project";
import PlanCreation from "./pages/planCreation";
import PreviewLayers from "./pages/previewLayer";
import SetupUser from "./pages/setupUser";
import LocationForm from "./pages/locationForm";
import PlantationAssessment from "./pages/plantationAssessment";
import UserRegistration from "./pages/userRegistration";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("currentUser"));
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  return (
    <>
      <BrowserRouter>
        <div className="flex h-screen">
          {currentUser && <SideNavBar setCurrentUser={setCurrentUser} />}
          {/* Add a main content div */}
          <div className={`flex-1 ${currentUser ? "ml-64" : ""}`}>
            <Routes>
              <Route
                path="/"
                element={<Login setCurrentUser={setCurrentUser} />}
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/activateBlock" element={<ActivateBlock />} />
              <Route path="/project" element={<Project />} />
              <Route path="/projectDashboard" element={<ProjectDashboard />} />
              <Route path="/planCreation" element={<PlanCreation />} />
              <Route path="/previewLayers" element={<PreviewLayers />} />
              <Route path="/setupUser" element={<SetupUser />} />
              <Route path="/userregistration" element={<UserRegistration />} />
              <Route
                path="/plantationAssessment"
                element={<PlantationAssessment isEmbedded={false} />}
              />
              <Route
                path="/generate-layers/:layerName"
                element={<LocationForm />}
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
