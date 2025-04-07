import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Project = ({ currentUser, closeModal, onClose, statesList }) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [organization, setOrganization] = useState(null);
  const [userId, setUserId] = useState(null);
  const [projectAppType, setProjectAppType] = useState("");
  const [state, setState] = useState({ id: "", name: "" });

  useEffect(() => {
    if (currentUser?.user?.organization) {
      setOrganization(currentUser.user.organization);
      setUserId(currentUser.user.id);
    }
  }, [currentUser]);

  const handleStateChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setState({ id: "", name: "" });
      return;
    }

    const [state_id, state_name] = selectedValue.split("_");
    setState({ id: state_id, name: state_name });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectAppType) {
      toast.error("Project App Type is required");
      return;
    }

    if (!state.id) {
      toast.error("State selection is required");
      return;
    }

    const formData = {
      name: projectName,
      description: projectDescription,
      state: parseInt(state.id), // Only state ID
      app_type: projectAppType,
      enabled: true, // Ensuring it's included
      created_by: userId,
      updated_by: userId,
      organization: currentUser?.user?.organization,
    };

    try {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/`,
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
      sessionStorage.setItem("formData", JSON.stringify(formData));
      toast.success("Project created successfully");
      setTimeout(() => {
        if (closeModal) closeModal();
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to submit project");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-violet-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create Project</h2>
          <button
            onClick={() => {
              if (closeModal) closeModal();
              if (onClose) onClose();
            }}
            className="text-white hover:bg-violet-700 rounded-full p-2 focus:outline-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className=" mb-4">
                <form onSubmit={handleSubmit} className="space-y-2">
                  {/* Project Name */}
                  <div className="w-full">
                    <label className="block text-lg font-medium mb-3">
                      Project Name
                    </label>
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

                  <div>
                    <label className="text-lg font-semibold mb-2 block">
                      State:
                    </label>
                    <select
                      value={
                        state.id && state.name
                          ? `${state.id}_${state.name}`
                          : ""
                      }
                      onChange={handleStateChange}
                      className="w-full px-4 py-3 border text-lg rounded-lg"
                    >
                      <option value="">Select State</option>
                      {statesList.map((state) => (
                        <option
                          key={state.state_census_code}
                          value={`${state.state_census_code}_${state.state_name}`}
                        >
                          {state.state_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition text-lg"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
