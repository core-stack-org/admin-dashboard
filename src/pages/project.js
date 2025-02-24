import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectDashboard from "./projectDashboard";

const Project = () => {
  const [projectName, setProjectName] = useState("");
  const [appType, setAppType] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [organization, setOrganization] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const appTypes = ["Plantation", "Water Restoration", "MWS"];
  const organizations = ["Organization A", "Organization B", "Organization C"];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      projectName,
      appType,
      isPublic,
      organization,
    };
    console.log("Project Data:", formData);
    // alert("Project submitted successfully!");
    console.log("Navigating to /projectDashboard...");
    setShowDashboard(true);

    navigate("/projectDashboard");
  };
  // if (showDashboard) {
  //   return <ProjectDashboard />;
  // }

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
          <select
            value={appType}
            onChange={(e) => setAppType(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option value="" disabled>
              Select an app type
            </option>
            {appTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
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
          <select
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option value="" disabled>
              Select an organization
            </option>
            {organizations.map((org, index) => (
              <option key={index} value={org}>
                {org}
              </option>
            ))}
          </select>
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
