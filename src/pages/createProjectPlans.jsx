import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ArrowLeft ,FilePlus} from "lucide-react";
import Select from "react-select";

const CreateProjectPlans = ({ onClose, onPlanSaved }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    projectName,
    stateName,
    stateId,
    projectId,
    planId,
    districtId,
    districtName,
    blockId,
    blockName,
  } = location.state || {};

  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [state, setState] = useState({
    id: stateId || "",
    name: stateName || "",
  });
  const [district, setDistrict] = useState({
    id: districtId || "",
    name: districtName || "",
  });
  const [block, setBlock] = useState({
    id: blockId || "",
    name: blockName || "",
  });
  const [facilitator, setFacilitator] = useState({
    username: "",
    first_name: "",
    last_name: "",
  });
  const [plan, setPlan] = useState("");
  const [villageName, setVillageName] = useState("");
  const [gramPanchayat, setGramPanchayat] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [users, setUsers] = useState([]);
  const selectRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [forceCloseMenu, setForceCloseMenu] = useState(false);

  const loadUsers = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/users/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      // Handle both array and paginated formats
      const usersArray = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : [];

      // Sort alphabetically by first name, fallback to username
      const sortedUsers = usersArray.sort((a, b) =>
        (a.first_name || a.username || "").localeCompare(
          b.first_name || b.username || "",
        ),
      );

      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const options = [
    ...users.map((user) => ({
      value: user.username || user.name,
      label: `${user.username || user.name} (${user.first_name || ""} ${
        user.last_name || ""
      })`,
    })),
    { value: "others", label: "Others" },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setStatesList(data.states || data.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (state.id) {
      fetchDistricts(state.id);
    }
  }, [state.id]);

  useEffect(() => {
    if (districtId) {
      setDistrict({ id: districtId, name: districtName || "" });
      setBlock({ id: blockId, name: blockName || "" });

      fetchBlocks(districtId);
    }
  }, [districtId]);

  const fetchDistricts = async (stateId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${stateId}/`,
      );
      const data = await res.json();
      const activeDistricts = (data.districts || []).filter(
        (d) => d.active_status === true,
      );

      // Sort alphabetically by district_name
      activeDistricts.sort((a, b) =>
        a.district_name.localeCompare(b.district_name),
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
        `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${districtId}/`,
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

  const handleVillageBlur = () => {
  const formattedVillage = villageName.trim().replace(/\s+/g, "_");

  setPlan(formattedVillage ? `Plan_${formattedVillage}` : "");
};

  const resetForm = () => {
    // setState({ id: "", name: "" });
    setDistrict({ id: "", name: "" });
    setBlock({ id: "", name: "" });
    setFacilitator("");
    setPlan("");
    setVillageName("");
    setGramPanchayat("");
    setShowConfirm(false);
  };

  useEffect(() => {
    if (planId && statesList.length) {
      setIsEditMode(true);
      fetchPlanDetails(planId);
    }
  }, [planId, statesList]);

  const fetchPlanDetails = async (id) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectId}/watershed/plans/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "1",
          },
        },
      );
      const data = await res.json();

      const stateNameFromList =
        statesList.find((s) => String(s.id) === String(data.state_soi))
          ?.state_name || "";

      setState({ id: data.state_soi, name: stateNameFromList });

      const districts = await fetchDistricts(data.state_soi);
      const districtName =
        districts.find((d) => String(d.id) === String(data.district_soi))
          ?.district_name || "";
      setDistrict({ id: data.district_soi, name: districtName });

      //  Fetch blocks for the district and set selected block
      const blocks = await fetchBlocks(data.district_soi);
      const blockName =
        blocks.find((b) => String(b.id) === String(data.tehsil_soi))
          ?.block_name || "";
      setBlock({ id: data.tehsil_soi, name: blockName });

      //  Set other fields
      setFacilitator(data.facilitator_name || "");
      setPlan(data.plan || "");
      setVillageName(data.village_name || "");
      setGramPanchayat(data.gram_panchayat || "");
    } catch (error) {
      console.error("Error fetching plan details:", error);
    }
  };

  const handlePlanCreation = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("accessToken");

    const payload = {
      plan,
      state_soi: parseInt(state.id),
      district_soi: parseInt(district.id),
      tehsil_soi: parseInt(block.id),
      village_name: villageName,
      gram_panchayat: gramPanchayat,
      // facilitator_name: facilitator.first_name,
      facilitator_name:
        `${facilitator.first_name} ${facilitator.last_name || ""}`.trim(),
      enabled: true,
    };

    try {
      const url = planId
        ? `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectId}/watershed/plans/${planId}/`
        : `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectId}/watershed/plans/`;

      const method = planId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show API error messages in toast
        if (data.message && Array.isArray(data.message)) {
          toast.error(data.message[0]);
        } else {
          toast.error("Error saving plan");
        }
        return;
      }

      // Success
      toast.success(planId ? "Plan updated!" : "Plan created!");
      setShowConfirm(false);
      resetForm();
      if (onPlanSaved) onPlanSaved(data);
      if (onClose) onClose();
      if (isEditMode) {
        navigate(`/projects/${projectId}/plans`);
      }
        } catch (error) {
      console.error(error);
      toast.error("Error saving plan");
    }
  };

  return (
      <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-8 pt-6 pb-2 mt-16">      
      <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-purple-100 shadow-xl p-8">
        <ToastContainer />

        {/* Header */}
<div className="mb-8">
  <div className="flex items-center justify-between border-b border-gray-200 pb-4">

    <button
      onClick={() => navigate(`/dashboard`)}
      className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
    >
      <ArrowLeft size={20} />
      Back to Projects
    </button>

    <p className="text-lg text-gray-700">
      Create and manage NRM plans for{" "}
      <span className="font-semibold text-gray-900">
        {projectName}
      </span>
    </p>

    <div className="w-[150px]" />
  </div>
</div>

        {/* Form */}
  <form className="space-y-6">
            {/* State */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={state.name}
              disabled
              className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* District */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              District <span className="text-red-500">*</span>
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={district.name}
                disabled
                className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            ) : (
              <select
                value={
                  district.id && district.name
                    ? `${district.id}_${district.name}`
                    : ""
                }
                onChange={handleDistrictChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              >
                <option value="">Select district</option>
                {districtsList.map((d) => (
                  <option key={d.id} value={`${d.id}_${d.district_name}`}>
                    {d.district_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Block */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Tehsil <span className="text-red-500">*</span>
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={block.name}
                disabled
                className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            ) : (
              <select
                value={
                  block.id && block.name ? `${block.id}_${block.name}` : ""
                }
                onChange={handleBlockChange}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              >
                <option value="">Select Tehsil</option>
                {blocksList.map((b) => (
                  <option key={b.id} value={`${b.id}_${b.block_name}`}>
                    {b.block_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Gram Panchayat */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Gram Panchayat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={gramPanchayat}
              onChange={(e) => setGramPanchayat(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              placeholder="Enter Gram Panchayat"
            />
          </div>

                    {/* Village */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Village Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              onBlur={handleVillageBlur}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              placeholder="Enter Village Name"
            />
          </div>
                  {/* Plan */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Plan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              placeholder="Enter Plan  eg., (Plan_VillageName)"
            />
          </div>
</div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">

   {/* Facilitator */}
            <div className="md:col-span-2  max-w-[500px]">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Facilitator Name <span className="text-red-500">*</span>
            </label>
            <Select
              ref={selectRef}
              menuIsOpen={forceCloseMenu ? false : menuOpen}
              onMenuOpen={() => {
                if (!forceCloseMenu) setMenuOpen(true);
              }}
              onMenuClose={() => setMenuOpen(false)}
              value={
                facilitator.username
                  ? facilitator.username === "others"
                    ? { value: "others", label: "Others" }
                    : users.find(
                          (u) =>
                            u.username === facilitator.username ||
                            u.name === facilitator.username,
                        )
                      ? {
                          value: facilitator.username,
                          label: `${
                            users.find(
                              (u) =>
                                u.username === facilitator.username ||
                                u.name === facilitator.username,
                            ).username || facilitator.username
                          }${
                            facilitator.first_name || facilitator.last_name
                              ? ` (${[
                                  facilitator.first_name,
                                  facilitator.last_name,
                                ]
                                  .filter(Boolean)
                                  .join(" ")})`
                              : ""
                          }`,
                        }
                      : null
                  : null
              }
              onChange={(selected) => {
                if (!selected) {
                  setFacilitator({
                    username: "",
                    first_name: "",
                    last_name: "",
                  });
                  return;
                }

                if (selected.value === "others") {
                  setFacilitator({
                    username: "others",
                    first_name: "",
                    last_name: "",
                  });
                  setForceCloseMenu(true);
                  setMenuOpen(false);
                  setTimeout(() => {
                    document
                      .getElementById("custom-facilitator-input")
                      ?.focus();
                  }, 100);
                  return;
                }

                const selectedUser = users.find(
                  (u) =>
                    u.username === selected.value || u.name === selected.value,
                );
                if (selectedUser) {
                  setFacilitator({
                    username: selectedUser.username || selectedUser.name,
                    first_name: selectedUser.first_name || "",
                    last_name: selectedUser.last_name || "",
                  });
                }

                setForceCloseMenu(false);
              }}
              options={options}
              placeholder="Select Facilitator"
              isClearable
              isLoading={users.length === 0}
              className="w-full"
              styles={{
                control: (base, state) => ({
                  ...base,
                  padding: "2px",
                  borderRadius: "8px",
                  borderColor: state.isFocused ? "#60A5FA" : "#E5E7EB",
                  boxShadow: state.isFocused ? "0 0 0 2px #BFDBFE" : "none",
                  "&:hover": { borderColor: "#60A5FA" },
                }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />

            {facilitator.username === "others" && (
              <input
                id="custom-facilitator-input"
                type="text"
                placeholder="Enter facilitator name"
                className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={facilitator.first_name}
                onChange={(e) =>
                  setFacilitator({
                    username: "others",
                    first_name: e.target.value,
                    last_name: "",
                  })
                }
              />
            )}

          </div>
                  {/* Submit */}
<div className="ml-auto">
            <button
  onClick={(e) => {
    e.preventDefault();
    setShowConfirm(true);
  }}
  className="
    bg-gradient-to-r
    from-purple-600
    to-violet-600
    hover:from-purple-700
    hover:to-violet-700
    text-white
    px-10
    py-3
    rounded-xl
    text-lg
    font-semibold
    shadow-lg
    transition-all
    duration-300
    hover:scale-105
    flex
    items-center
    justify-center
    gap-2
    
  "
>
  <FilePlus size={20} />
  {isEditMode ? "Update Plan" : "Create Plan"}
</button>
        </div>
</div>


       

    




        </form>


      </div>

    {showConfirm && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">

      {/* Header */}
      <div className="bg-purple-600 hover:bg-purple-700 px-6 py-5">
        <h2 className="text-2xl font-bold text-white">
          {isEditMode ? "Confirm Plan Update" : "Confirm Plan Creation"}
        </h2>
        <p className="text-purple-100 text-sm mt-1">
          Please review the details before proceeding
        </p>
      </div>

      {/* Details */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">State</p>
            <p className="font-semibold">{state.name || "-"}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">District</p>
            <p className="font-semibold">{district.name || "-"}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Block</p>
            <p className="font-semibold">{block.name || "-"}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Facilitator</p>
            <p className="font-semibold">
              {facilitator.username === "others"
                ? facilitator.first_name || "-"
                : `${facilitator.first_name || ""} ${
                    facilitator.last_name || ""
                  }`.trim() || facilitator.username}
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Plan Name</p>
            <p className="font-semibold">{plan || "-"}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Village</p>
            <p className="font-semibold">{villageName || "-"}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 col-span-2">
            <p className="text-xs text-gray-500">Gram Panchayat</p>
            <p className="font-semibold">{gramPanchayat || "-"}</p>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={() => setShowConfirm(false)}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handlePlanCreation}
            className="
              bg-gradient-to-r
              from-purple-600
              to-violet-600
              hover:from-purple-700
              hover:to-violet-700
              text-white
              px-8
              py-3
              rounded-xl
              font-semibold
              shadow-lg
              transition-all
              duration-300
            "
          >
            {isEditMode ? "Update Plan" : "Create Plan"}
          </button>

        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default CreateProjectPlans;
