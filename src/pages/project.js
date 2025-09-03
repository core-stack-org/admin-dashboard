import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Project = ({ currentUser, closeModal, onClose, statesList }) => {
  console.log(currentUser);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [organization, setOrganization] = useState(null);
  const [userId, setUserId] = useState(null);
  const [projectAppType, setProjectAppType] = useState("");
  const [state, setState] = useState({ id: "", name: "" });
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [organizationsList, setOrganizationsList] = useState([]);

  const [needDesiltingPoint, setNeedDesiltingPoint] = useState(true);

  useEffect(() => {
    if (currentUser?.user?.organization) {
      setOrganization(currentUser.user.organization);
      setUserId(currentUser.user.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.user) {
      setUserId(currentUser.user.id);

      if (!currentUser.user.is_superadmin) {
        // normal user → lock org
        setOrganization(currentUser.user.organization);
      } else {
        // superadmin → fetch org list
        loadOrganization();
      }
    }
  }, [currentUser]);

  const loadOrganization = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/auth/register/available_organizations/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      setOrganizationsList(data || []); // ✅ store org list
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const handleOrgChange = (e) => {
    setOrganization(e.target.value);
  };

  const handleStateChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setState({ id: "", name: "" });
      return;
    }

    const [state_id, state_name] = selectedValue.split("_");
    setState({ id: state_id, name: state_name });
  };

  useEffect(() => {
    if (state.id) {
      fetchDistricts(state.id);
    }
  }, [state.id]);

  const fetchDistricts = async (stateId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_districts/${stateId}/`
      );
      const data = await res.json();
      setDistrictsList(data.districts || []);
      return data.districts || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fetchBlocks = async (districtId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_blocks/${districtId}/`
      );
      const data = await res.json();
      setBlocksList(data.blocks || []);
      return data.blocks || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleDistrictChange = (e) => {
    const [id, name] = e.target.value.split("_");
    setDistrict({ id, name });
    setBlock({ id: "", name: "" });
    fetchBlocks(id);
  };

  const handleBlockChange = (e) => {
    const [id, name] = e.target.value.split("_");
    setBlock({ id, name });
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
      organization: organization,
      ...(projectAppType === "waterbody" && {
        need_desilting_point: needDesiltingPoint,
      }),
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
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
                    />
                  </div>

                  {/* Project App Type (Inside Form) */}
                  <div>
                    <label className="block text-lg font-medium mb-3">
                      Select Project App Type
                    </label>
                    <select
                      value={projectAppType}
                      onChange={(e) => {
                        const selectedType = e.target.value;
                        setProjectAppType(selectedType);
                        if (selectedType === "waterbody") {
                          setNeedDesiltingPoint(true);
                        }
                      }}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                      required
                    >
                      <option value="" disabled>
                        Select app type
                      </option>
                      <option value="plantation">Plantations</option>
                      <option value="watershed">Watershed Planning</option>
                      <option value="waterbody">Waterbody Rejuvenation</option>
                    </select>
                  </div>
                  {projectAppType === "waterbody" && (
                    <div className="flex items-center justify-between mt-4">
                      <label className="text-lg font-medium">
                        Need Desilting Point
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={needDesiltingPoint}
                          onChange={() =>
                            setNeedDesiltingPoint(!needDesiltingPoint)
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>
                  )}

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

                  {/* District Dropdown */}

                  <div className="mt-4">
                    <label className="text-lg font-semibold mb-2 block">
                      District:
                    </label>
                    <select
                      value={
                        district.id && district.name
                          ? `${district.id}_${district.name}`
                          : ""
                      }
                      onChange={handleDistrictChange}
                      className="w-full px-4 py-3 border text-lg rounded-lg"
                    >
                      <option value="">Select District</option>
                      {districtsList.map((dist) => (
                        <option
                          key={dist.district_census_code}
                          value={`${dist.district_census_code}_${dist.district_name}`}
                        >
                          {dist.district_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Block Dropdown */}

                  <div className="mt-4">
                    <label className="text-lg font-semibold mb-2 block">
                      Block:
                    </label>
                    <select
                      value={
                        block.id && block.name
                          ? `${block.id}_${block.name}`
                          : ""
                      }
                      onChange={handleBlockChange}
                      className="w-full px-4 py-3 border text-lg rounded-lg"
                    >
                      <option value="">Select Block</option>
                      {blocksList.map((blk) => (
                        <option
                          key={blk.block_code}
                          value={`${blk.block_code}_${blk.block_name}`}
                        >
                          {blk.block_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentUser?.user?.is_superadmin && (
                    <div>
                      <label className="text-lg font-semibold mb-2 block">
                        Organization:
                      </label>
                      <select
                        value={organization || ""}
                        onChange={handleOrgChange}
                        className="w-full px-4 py-3 border text-lg rounded-lg"
                        required
                      >
                        <option value="">Select Organization</option>
                        {organizationsList.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name} {/* ✅ show name, pass id */}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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
