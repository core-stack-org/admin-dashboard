import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@mui/material";
import Select from "react-select";

const PlanCreation = ({ onClose, onPlanSaved }) => {
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDprGenerated, setIsDprGenerated] = useState(false);
  const [isDprReviewed, setIsDprReviewed] = useState(false);
  const [isDprApproved, setIsDprApproved] = useState(false);
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
        }
      );

      const data = await response.json();

      // ✅ Handle both array and paginated formats
      const usersArray = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];

      // ✅ Sort alphabetically by first name, fallback to username
      const sortedUsers = usersArray.sort((a, b) =>
        (a.first_name || a.username || "").localeCompare(
          b.first_name || b.username || ""
        )
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
          { headers: { Authorization: `Bearer ${token}` } }
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

  const resetForm = () => {
    // setState({ id: "", name: "" });
    setDistrict({ id: "", name: "" });
    setBlock({ id: "", name: "" });
    setFacilitator("");
    setPlan("");
    setVillageName("");
    setGramPanchayat("");
    setIsCompleted(false);
    setIsDprGenerated(false);
    setIsDprReviewed(false);
    setIsDprApproved(false);
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
        }
      );
      const data = await res.json();

      const stateNameFromList =
        statesList.find(
          (s) => String(s.state_census_code) === String(data.state)
        )?.state_name || "";

      setState({ id: data.state, name: stateNameFromList });

      const districts = await fetchDistricts(data.state);
      const districtName =
        districts.find((d) => String(d.id) === String(data.district))
          ?.district_name || "";
      setDistrict({ id: data.district, name: districtName });

      //  Fetch blocks for the district and set selected block
      const blocks = await fetchBlocks(data.district);
      const blockName =
        blocks.find((b) => String(b.id) === String(data.block))?.block_name ||
        "";
      setBlock({ id: data.block, name: blockName });

      //  Set other fields
      setFacilitator(data.facilitator_name || "");
      setPlan(data.plan || "");
      setVillageName(data.village_name || "");
      setGramPanchayat(data.gram_panchayat || "");
      setIsCompleted(data.is_completed || false);
    } catch (error) {
      console.error("Error fetching plan details:", error);
    }
  };

  const handlePlanCreation = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("accessToken");

    const payload = {
      plan,
      state: parseInt(state.id),
      district: parseInt(district.id),
      block: parseInt(block.id),
      village_name: villageName,
      gram_panchayat: gramPanchayat,
      facilitator_name: facilitator.first_name,
      enabled: true,
      is_completed: isCompleted,
      is_dpr_generated: isDprGenerated,
      is_dpr_reviewed: isDprReviewed,
      is_dpr_approved: isDprApproved,
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
    } catch (error) {
      console.error(error);
      toast.error("Error saving plan");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl p-4 rounded-2xl shadow-lg bg-white border border-gray-200 mt-24">
        <ToastContainer />

        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(`/projects/${projectId}/plans`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={20} /> Back to Projects
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span className="text-blue-600">
              {isEditMode ? "Edit Plan" : "Plan Creation"}
            </span>
          </h1>
          <p className="text-gray-500 mt-2">
            Fill in the details to create a watershed plan for project:{" "}
            {projectName}
          </p>
        </div>

        {/* Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* State */}
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
              Block <span className="text-red-500">*</span>
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
                <option value="">Select Block</option>
                {blocksList.map((b) => (
                  <option key={b.id} value={`${b.id}_${b.block_name}`}>
                    {b.block_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Facilitator */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Facilitator Name <span className="text-red-500">*</span>
            </label>
            {/* <Select
              value={
                facilitatorName
                  ? {
                      value: facilitatorName,
                      label: users.find(
                        (u) =>
                          u.username === facilitatorName ||
                          u.name === facilitatorName
                      )
                        ? `${facilitatorName} (${
                            users.find(
                              (u) =>
                                u.username === facilitatorName ||
                                u.name === facilitatorName
                            )?.first_name || ""
                          } ${
                            users.find(
                              (u) =>
                                u.username === facilitatorName ||
                                u.name === facilitatorName
                            )?.last_name || ""
                          })`
                        : facilitatorName,
                    }
                  : null
              }
              onChange={(selected) =>
                setFacilitatorName(selected ? selected.value : "")
              }
              options={users.map((user) => ({
                value: user.username || user.name,
                label: `${user.username || user.name} (${user.first_name} ${
                  user.last_name
                })`,
              }))}
              placeholder="Select Facilitator"
              isClearable
              className="w-full"
              styles={{
                control: (base, state) => ({
                  ...base,
                  padding: "2px",
                  borderRadius: "8px",
                  borderColor: state.isFocused ? "#60A5FA" : "#E5E7EB",
                  boxShadow: state.isFocused ? "0 0 0 2px #BFDBFE" : "none",
                  "&:hover": {
                    borderColor: "#60A5FA",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
            /> */}
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
                          u.name === facilitator.username
                      )
                    ? {
                        value: facilitator.username,
                        label: `${
                          users.find(
                            (u) =>
                              u.username === facilitator.username ||
                              u.name === facilitator.username
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
                    u.username === selected.value || u.name === selected.value
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

          {/* Village */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Village Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              placeholder="Enter Village Name"
            />
          </div>

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

          {/* Toggles in 2-column layout */}
          {isEditMode && (
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="col-span-full">
                <hr className="my-2 border-gray-300" />
              </div>
              {/* Completed */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Is Plan Completed?
                </label>
                <Switch
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  color="primary"
                />
              </div>

              {/* DPR Generated */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  DPR Generated?
                </label>
                <Switch
                  checked={isDprGenerated}
                  onChange={(e) => setIsDprGenerated(e.target.checked)}
                  color="primary"
                />
              </div>

              {/* DPR Reviewed */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  DPR Reviewed?
                </label>
                <Switch
                  checked={isDprReviewed}
                  onChange={(e) => setIsDprReviewed(e.target.checked)}
                  color="primary"
                />
              </div>

              {/* DPR Approved */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  DPR Approved?
                </label>
                <Switch
                  checked={isDprApproved}
                  onChange={(e) => setIsDprApproved(e.target.checked)}
                  color="primary"
                />
              </div>
            </div>
          )}
        </form>

        {/* Submit */}
        <div className="text-center pt-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowConfirm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-md transition-all"
          >
            {isEditMode ? "Update Plan" : "Create Plan"}
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              Confirm {isEditMode ? "Update" : "Creation"}
            </h2>

            <ul className="text-gray-700 space-y-2 mb-6">
              <li>
                <strong>State:</strong> {state.name}
              </li>
              <li>
                <strong>District:</strong> {district.name}
              </li>
              <li>
                <strong>Block:</strong> {block.name}
              </li>
              <li>
                <li>
                  <strong>Facilitator:</strong>{" "}
                  {facilitator.username === "others"
                    ? facilitator.first_name || "N/A"
                    : `${facilitator.first_name || ""} ${
                        facilitator.last_name || ""
                      }`.trim() ||
                      facilitator.username ||
                      "N/A"}
                </li>
              </li>
              <li>
                <strong>Plan:</strong> {plan}
              </li>
              <li>
                <strong>Village:</strong> {villageName}
              </li>
              <li>
                <strong>Gram Panchayat:</strong> {gramPanchayat}
              </li>
              {isEditMode && (
                <>
                  <li>
                    <strong>Completed:</strong> {isCompleted ? "Yes" : "No"}
                  </li>
                  <li>
                    <strong>DPR Generated:</strong>{" "}
                    {isDprGenerated ? "Yes" : "No"}
                  </li>
                  <li>
                    <strong>DPR Reviewed:</strong>{" "}
                    {isDprReviewed ? "Yes" : "No"}
                  </li>
                  <li>
                    <strong>DPR Approved:</strong>{" "}
                    {isDprApproved ? "Yes" : "No"}
                  </li>
                </>
              )}
            </ul>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePlanCreation}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCreation;
