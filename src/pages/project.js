import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProjectDashboard from "./projectDashboard";
import AsyncSelect from "react-select/async";

const Project = ({ currentuser }) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [organization, setOrganization] = useState(null);
  const [userId, setUserId] = useState(null);
  const [projectAppType, setProjectAppType] = useState("");

  console.log(currentuser.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentuser?.user?.organization) {
      setOrganization(currentuser.user.organization);
      setUserId(currentuser.user.id);
    }
  }, [currentuser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Selected App Type:", projectAppType); // Debugging

    if (!projectAppType) {
      console.error("Project App Type is required");
      return;
    }

    const formData = {
      name: projectName,
      description: projectDescription,
      organization: organization,
      created_by: userId,
      updated_by: userId,
    };

    try {
      console.log(formData);
      const token = sessionStorage.getItem("accessToken");
      console.log(token);
      // 1st API Call - Create Project
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/projects/`,
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
      const projectId = data.id;
      console.log("Project Created with ID:", projectId, projectAppType);

      // 2nd API Call - Enable App Type
      const enableAppResponse = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/projects/${projectId}/enable_app/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ app_type: projectAppType }),
        }
      );

      if (!enableAppResponse.ok) {
        throw new Error("Failed to enable app");
      }

      navigate("/projectDashboard");
    } catch (error) {
      console.error("Error submitting project:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-32 p-12 bg-white shadow-md rounded-md">
      <h1 className="text-3xl font-bold mb-10 text-center">Create Project</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Name */}
        <div>
          <label className="block text-lg font-medium mb-3">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter project name"
            required
          />
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-lg font-medium mb-3">
            Project Description
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter project description"
            required
          />
        </div>

        {/* Project App Type (Inside Form) */}
        <div>
          <label className="block text-lg font-medium mb-3">
            Select Project App Type
          </label>
          <select
            value={projectAppType}
            onChange={(e) => setProjectAppType(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option value="" disabled>
              Select app type
            </option>
            <option value="plantation">plantation</option>
            <option value="watershed">watershed</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-lg"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Project;
