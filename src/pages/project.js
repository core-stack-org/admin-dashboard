import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Project = ({ currentUser }) => {
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [organization, setOrganization] = useState(null);
  const [userId, setUserId] = useState(null);
  const [projectAppType, setProjectAppType] = useState("");
  const [state, setState] = useState({ id: "", name: "" });
  const [statesList, setStatesList] = useState([]);

  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [organizationsList, setOrganizationsList] = useState([]);

  const [needDesiltingPoint, setNeedDesiltingPoint] = useState(true);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      const activeSortedStates = data.states
        .filter((s) => s.active_status === true)
        .sort((a, b) => a.state_name.localeCompare(b.state_name));

      setStatesList(activeSortedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

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
      setOrganizationsList(data || []);
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
        `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${stateId}/`
      );
      const data = await res.json();
      const activeDistricts = (data.districts || []).filter(
        (d) => d.active_status === true
      );

      // Sort alphabetically by district_name
      activeDistricts.sort((a, b) =>
        a.district_name.localeCompare(b.district_name)
      );

      setDistrictsList(activeDistricts);
      return activeDistricts;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fetchBlocks = async (districtId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${districtId}/`
      );
      const data = await res.json();
      const activeBlocks = (data.blocks || [])
        .filter((b) => b.active_status === true)
        .sort((a, b) => a.block_name.localeCompare(b.block_name));
      setBlocksList(activeBlocks);

      return activeBlocks;
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
      state: parseInt(state.id),
      district: district?.id ? parseInt(district.id) : null,
      block: block?.id ? parseInt(block.id) : null,
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
      const apiPath =  projectAppType === "community_engagement" ? "api/v1/create_community/" : "api/v1/projects/";

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}${apiPath}`,
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
        navigate("/projects");
      }, 2000);
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error("Failed to submit project");
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto px-32 pt-24">
      <ToastContainer position="bottom-right" />

      {/* Header */}
      <div className="bg-violet-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
        <h2 className="text-xl font-semibold">Create Project</h2>
        <button
          onClick={() => navigate(-1)}
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
      <div className="bg-white p-6 rounded-b-lg border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter project name eg., Gram Vaani Jamui (organization name District name)"
              required
            />
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Project Description
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter project description"
            />
          </div>

          {/* Project App Type */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Select Project App Type <span className="text-red-500">*</span>
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
              <option value="community_engagement">Community Engagement</option>
            </select>
          </div>

          {projectAppType === "waterbody" && (
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium">
                Need Desilting Point
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={needDesiltingPoint}
                  onChange={() => setNeedDesiltingPoint(!needDesiltingPoint)}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-violet-600 relative">
                  <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-full"></div>
                </div>
              </label>
            </div>
          )}

          {/* Location Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-lg font-medium mb-2">
                State: <span className="text-red-500">*</span>
              </label>
              <select
                value={
                  state.id && state.name ? `${state.id}_${state.name}` : ""
                }
                onChange={handleStateChange}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="">Select State</option>
                {statesList.map((state) => (
                  <option
                    key={state.id}
                    value={`${state.id}_${state.state_name}`}
                  >
                    {state.state_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
                District (Optional):
              </label>
              <select
                value={
                  district.id && district.name
                    ? `${district.id}_${district.name}`
                    : ""
                }
                onChange={handleDistrictChange}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="">Select District</option>
                {districtsList.map((dist) => (
                  <option
                    key={dist.id}
                    value={`${dist.id}_${dist.district_name}`}
                  >
                    {dist.district_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
                Block (Optional):
              </label>
              <select
                value={
                  block.id && block.name ? `${block.id}_${block.name}` : ""
                }
                onChange={handleBlockChange}
                className="w-full px-4 py-3 border rounded-lg"
              >
                <option value="">Select Block</option>
                {blocksList.map((blk) => (
                  <option key={blk.id} value={`${blk.id}_${blk.block_name}`}>
                    {blk.block_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Organization Dropdown for superadmin */}
          {currentUser?.user?.is_superadmin && (
            <div>
              <label className="block text-lg font-medium mb-2">
                Organization: <span className="text-red-500">*</span>
              </label>
              <select
                value={organization || ""}
                onChange={handleOrgChange}
                className="w-full px-4 py-3 border rounded-lg"
                required
              >
                <option value="">Select Organization</option>
                {organizationsList.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit */}
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
  );
};

export default Project;
