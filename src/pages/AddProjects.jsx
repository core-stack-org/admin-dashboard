import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddMember from "./addMember.jsx";


const AddProject = ({ currentUser }) => {
const location = useLocation();

const editProject = location.state?.project;
const isEdit = location.state?.isEdit;
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectAppType, setProjectAppType] = useState("");

    const [statesList, setStatesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [blocksList, setBlocksList] = useState([]);
    const [organizationsList, setOrganizationsList] = useState([]);

    const [organization, setOrganization] = useState("");
    const [state, setState] = useState({ id: "", name: "" });
    const [district, setDistrict] = useState({ id: "", name: "" });
    const [block, setBlock] = useState({ id: "", name: "" });
    const [userId, setUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
  if (!isEdit || !editProject) return;

  setProjectName(editProject.name || "");
  setProjectDescription(editProject.description || "");
  setProjectAppType(editProject.app_type || "");

  setOrganization(editProject.organization || "");

  setState({
    id: editProject.state_soi || "",
    name: editProject.state_soi_name || "",
  });

  setDistrict({
    id: editProject.district_soi || "",
    name: editProject.district_soi_name || "",
  });

  setBlock({
    id: editProject.tehsil_soi || "",
    name: editProject.tehsil_soi_name || "",
  });
}, [isEdit, editProject]);

useEffect(() => {
  const loadEditData = async () => {
    if (!isEdit || !editProject?.state_soi) return;

    await fetchDistricts(editProject.state_soi);

    if (editProject.district_soi) {
      await fetchBlocks(editProject.district_soi);
    }
  };

  loadEditData();
}, [isEdit, editProject]);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/users/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Users API:", data);

      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`
      );

      const data = await response.json();

      const activeStates = data.states
        .filter((s) => s.active_status)
        .sort((a, b) =>
          a.state_name.localeCompare(b.state_name)
        );

      setStatesList(activeStates);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStateChange = (event) => {
    const selectedValue = event.target.value;

    if (!selectedValue) {
      setState({ id: "", name: "" });
      return;
    }

    const [state_id, state_name] = selectedValue.split("_");

    setState({
      id: state_id,
      name: state_name,
    });
  };

  const fetchDistricts = async (stateId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${stateId}/`
      );

      const data = await res.json();

      const activeDistricts = (data.districts || [])
        .filter((d) => d.active_status === true)
        .sort((a, b) =>
          a.district_name.localeCompare(b.district_name)
        );

      setDistrictsList(activeDistricts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDistrictChange = (e) => {
    const [id, name] = e.target.value.split("_");

    setDistrict({ id, name });
    setBlock({ id: "", name: "" });

    fetchBlocks(id);
  };

  const fetchBlocks = async (districtId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${districtId}/`
      );

      const data = await res.json();

      const activeBlocks = (data.blocks || [])
        .filter((b) => b.active_status === true)
        .sort((a, b) =>
          a.block_name.localeCompare(b.block_name)
        );

      setBlocksList(activeBlocks);

      return activeBlocks;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleBlockChange = (e) => {
    const [id, name] = e.target.value.split("_");

    setBlock({ id, name });
  };

  useEffect(() => {
    if (state.id) {
      fetchDistricts(state.id);
    }
  }, [state.id]);

  useEffect(() => {
    if (currentUser?.user) {
      setUserId(currentUser.user.id);

      if (!currentUser.user.is_superadmin) {
        setOrganization(currentUser.user.organization);
        console.log("Set organization to:", currentUser.user.organization);
      } else {
        loadOrganizations();
      }
    }
  }, [currentUser]);

  const loadOrganizations = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/auth/register/available_organizations/`
      );

      const data = await response.json();

      setOrganizationsList(data || []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const fetchUserGroups = async () => {
  try {
    const token = sessionStorage.getItem("accessToken");

    const response = await fetch(
      `${process.env.REACT_APP_BASEURL}/api/v1/groups/`,
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

    console.log("Groups API:", data);

    setUserGroups(data || []);
  } catch (error) {
    console.error("Error fetching groups:", error);
  }
  };  

  // const handleCreateProject = async () => {
  //   try {
  //     const token = sessionStorage.getItem("accessToken");
  //     const payload = {
  //     name: projectName,
  //     description: projectDescription,
  //     state_soi: parseInt(state.id),
  //     district_soi: district?.id ? parseInt(district.id) : null,
  //     tehsil_soi: block?.id ? parseInt(block.id) : null,
  //     app_type: projectAppType,
  //     enabled: true,
  //     created_by: userId,
  //     updated_by: userId,
  //     organization: organization,
  //     };

  //     const apiPath = projectAppType === "community_engagement"
  //     ? "api/v1/create_community/"
  //     : "api/v1/projects/";

  //     const response = await fetch(
  //       `${process.env.REACT_APP_BASEURL}${apiPath}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to create project");
  //     }
  //     const data = await response.json();
  //     toast.success("Project created successfully!");

  //     setTimeout(() => {
  //       navigate("/projectsList");
  //     }, 1500);
  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to create project");
  //   }
  // };

  const handleSaveProject = async () => {
  try {
    const token = sessionStorage.getItem("accessToken");

  const payload = 
              { 
                name: projectName, 
                description: projectDescription, 
                state_soi: parseInt(state.id), 
                district_soi: district?.id ? parseInt(district.id) : null, 
                tehsil_soi: block?.id ? parseInt(block.id) : null, 
                app_type: projectAppType, 
                enabled: true, 
                created_by: userId, 
                updated_by: userId, 
                organization: organization, 
              };

    let url = "";
    let method = "";

    if (isEdit) {
      url = `${process.env.REACT_APP_BASEURL}/api/v1/projects/${editProject.id}/`;
      method = "PUT"; // or PATCH
    } else {
      url =
        projectAppType === "community_engagement"
          ? `${process.env.REACT_APP_BASEURL}api/v1/create_community/`
          : `${process.env.REACT_APP_BASEURL}api/v1/projects/`;

      method = "POST";

      payload.created_by = userId;
      payload.enabled = true;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        isEdit
          ? "Failed to update project"
          : "Failed to create project"
      );
    }

    toast.success(
      isEdit
        ? "Project updated successfully!"
        : "Project created successfully!"
    );

    setTimeout(() => {
      navigate("/projectsList");
    }, 1500);

  } catch (error) {
    console.error(error);

    toast.error(
      isEdit
        ? "Failed to update project"
        : "Failed to create project"
    );
  }
};

  return (
    <div className="p-8 mt-10">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-purple-600 text-center mt-2">
          {isEdit ? "Edit Project" : "Add Project"}
      </h1>


<div className="max-w-6xl mx-auto mt-4 bg-white rounded-2xl shadow-md border border-gray-200 p-8">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {/* Project Name */}
    <div>
      <label className="block mb-2 font-medium">
        Project Name <span className="text-red-500">*</span>
      </label>
      <input
      value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        type="text"
        className="w-full border rounded-lg px-4 py-3"
        placeholder="organization name District name"
      />
    </div>

    {/* Organization */}
    <div>
  <label className="block mb-2 font-medium">
    Organization <span className="text-red-500">*</span>
  </label>

  {currentUser?.user?.is_superadmin ? (
    <select
      value={organization}
      onChange={(e) => setOrganization(e.target.value)}
      className="w-full border rounded-lg px-4 py-3"
    >
      <option value="">Select Organization</option>

      {organizationsList.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  ) : (
    <input
      type="text"
      value={currentUser?.user?.organization_name || ""}
      disabled
      className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
    />
  )}

</div>

    {/* App Type */}
<div>
  <label className="block mb-2 font-medium">
    App Type <span className="text-red-500">*</span>
  </label>

  <select
    value={projectAppType}
    onChange={(e) => setProjectAppType(e.target.value)}
    className="w-full border rounded-lg px-4 py-3"
  >
    <option value="">Select App Type</option>

    <option value="plantation">
      Plantations
    </option>

    <option value="watershed">
      NRM Plans via Commons connect
    </option>

    <option value="waterbody">
      Waterbody Rejuvenation
    </option>

    <option value="community_engagement">
      Community Engagement
    </option>
  </select>

  {projectAppType && (
    <div className="mt-2 text-xs text-gray-600">
      {projectAppType === "watershed" && (
        <p>• Create NRM plans through Commons Connect.</p>
      )}

      {projectAppType === "plantation" && (
        <p>• Track site suitability of plantation projects.</p>
      )}

      {projectAppType === "waterbody" && (
        <p>• Track waterbody rejuvenation and restoration efforts.</p>
      )}

      {projectAppType === "community_engagement" && (
        <p>• Manage community participation for NRM activities.</p>
      )}
    </div>
  )}
</div>

  {/* State */}
    <div>
      <label className="block mb-2 font-medium">
        State <span className="text-red-500">*</span>
      </label>
        <select
    value={state.id && state.name ? `${state.id}_${state.name}` : ""}
    onChange={handleStateChange}
    className="w-full border rounded-lg px-4 py-3"
    >
  <option value="">Select State</option>

  {statesList.map((s) => (
    <option key={s.id}  value={`${s.id}_${s.state_name}`}>
      {s.state_name}
    </option>
  ))}
</select>
    </div>

        {/* District */}
    <div>
      <label className="block mb-2 font-medium">
        District <span className="text-red-500">*</span>
      </label>
        <select
  value={
    district.id && district.name
      ? `${district.id}_${district.name}`
      : ""
  }
  onChange={handleDistrictChange}
  className="w-full border rounded-lg px-4 py-3"
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

    {/* Block */}
    <div>
      <label className="block mb-2 font-medium">
        Tehsil
      </label>
      <select
  value={
    block.id && block.name
      ? `${block.id}_${block.name}`
      : ""
  }
  onChange={handleBlockChange}
  className="w-full border rounded-lg px-4 py-3"
>
  <option value="">Select Tehsil</option>

  {blocksList.map((blk) => (
    <option
      key={blk.id}
      value={`${blk.id}_${blk.block_name}`}
    >
      {blk.block_name}
    </option>
  ))}
</select>
    </div>


  

    {/* Description */}
    <div className="md:col-span-3">
      <label className="block mb-2 font-medium">
        Project Description <span className="text-red-500">*</span>
      </label>
      <textarea
        rows={3}
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
        className="w-full border rounded-lg px-4 py-3"
        placeholder="Please descripbe the Project aim and the expected outcome/impact."
        />
    </div>


  


  </div>

  <div className="flex justify-end gap-4 mt-10">
    <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"   onClick={() => navigate("/dashboard")}>
      Cancel
    </button>

    <button onClick={handleSaveProject}
    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
      {isEdit ? "Update Project" : "Create Project"}
    </button>
  </div>
</div>




{showAddMemberModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="relative w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
      <AddMember
        currentUser={currentUser}
        isSuperAdmin={currentUser?.user?.is_superadmin}
        onClose={() => setShowAddMemberModal(false)}
      />
    </div>
  </div>
)}
    </div>
  );
};

export default AddProject;