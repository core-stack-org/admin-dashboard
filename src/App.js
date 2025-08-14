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
import PlanCreation from "./pages/planCreation";
import PreviewLayers from "./pages/previewLayer";
import LocationForm from "./pages/locationForm";
import PlantationAssessment from "./pages/plantationAssessment";
import GenerateApiKeyPage from "./GenerateApiKeyPage";
import UserRegistration from "./pages/userRegistration";
import SideNavbar from "./pages/sidenavbar";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
                <Route
                  path="/dashboard"
                  element={<Dashboard currentUser={currentUser} />}
                />
                <Route path="/activateBlock" element={<ActivateBlock />} />

                <Route path="/planCreation" element={<PlanCreation />} />
                <Route path="/previewLayers" element={<PreviewLayers />} />
                <Route
                  path="/plantationAssessment"
                  element={<PlantationAssessment isEmbedded={false} />}
                />
                <Route
                  path="/generateApiKey"
                  element={<GenerateApiKeyPage currentUser={currentUser} />}
                />
                <Route
                  path="/generate-layers/:layerName"
                  element={<LocationForm currentUser={currentUser} />}
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
    return JSON.parse(sessionStorage.getItem("currentUser"));
  });

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  return (
    <BrowserRouter>
      <AppLayout currentUser={currentUser} setCurrentUser={setCurrentUser} />
    </BrowserRouter>
  );
}

export default App;
