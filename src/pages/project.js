import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectDashboard from "./projectDashboard";
import AsyncSelect from "react-select/async";

const Project = () => {
  const [projectName, setProjectName] = useState("");
  const [appType, setAppType] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [organization, setOrganization] = useState(null);

  const navigate = useNavigate();

  const loadOrganization = async () => {
    console.log("Fetching organizations...");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/org/get_org`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      console.log("Data received:", data);
      return data.map((org) => ({
        value: org.id,
        label: org.name,
      }));
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  };

  const loadAppType = async (inputValue) => {
    try {
      const token = sessionStorage.getItem("accessToken"); // Retrieve the token
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/proj/get_app_type`,
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
      console.log("app:", data);
      return data.map((app) => ({
        value: app.app_type_id,
        label: app.app_name,
      }));
    } catch (error) {
      console.error("Error fetching app types:", error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("posting project data");
    const formData = {
      project_name: projectName,
      is_public: isPublic ? 1 : 0,
      app_type: appType.value,
      organization: organization.value,
    };
    console.log(formData);
    try {
      const token = sessionStorage.getItem("accessToken");
      console.log(token);
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/proj/create_project`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const data = await response.json();
      console.log("Project created successfully:", data);

      // Navigate to project dashboard after successful submission
      setShowDashboard(true);
      navigate("/projectDashboard");
    } catch (error) {
      console.error("Error submitting project:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-32 p-8 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-8 text-center">Create Project</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter project name"
            required
          />
        </div>

        {/* App Type */}
        <div>
          <label className="block text-sm font-medium mb-2">App Type</label>
          <AsyncSelect
            cacheOptions
            loadOptions={loadAppType}
            defaultOptions
            onChange={(selected) => setAppType(selected)}
            placeholder="Select or search for an App type"
            classNamePrefix="react-select"
          />
        </div>

        {/* isPublic */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Is Public</label>
          <div
            onClick={() => setIsPublic(!isPublic)}
            className={`w-12 h-6 flex items-center rounded-full cursor-pointer ${
              isPublic ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-md transform ${
                isPublic ? "translate-x-6" : ""
              } transition-transform`}
            ></div>
          </div>
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium mb-2">Organization</label>
          <AsyncSelect
            loadOptions={loadOrganization}
            defaultOptions
            onChange={(selected) => setOrganization(selected)}
            placeholder="Select or search for an Organisation"
            classNamePrefix="react-select"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Project;
