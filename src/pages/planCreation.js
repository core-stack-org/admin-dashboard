import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@mui/material";

const PlanCreation = ({ onClose, onPlanSaved }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { projectName, stateName, stateId, projectId, planId } =
    location.state || {};

  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [state, setState] = useState({
    id: stateId || "",
    name: stateName || "",
  });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [facilitatorName, setFacilitatorName] = useState("");
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
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
    }
  };

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
    setFacilitatorName("");
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
      console.log("edit mode on", planId);
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
      console.log("Plan state:", data.state, "States list:", statesList);

      const stateNameFromList =
        statesList.find(
          (s) => String(s.state_census_code) === String(data.state)
        )?.state_name || "";

      setState({ id: data.state, name: stateNameFromList });
      console.log("After setState:", {
        id: data.state,
        name: stateNameFromList,
      });
      const districts = await fetchDistricts(data.state);
      const districtName =
        districts.find((d) => String(d.id) === String(data.district))
          ?.district_name || "";
      setDistrict({ id: data.district, name: districtName });

      // 3️⃣ Fetch blocks for the district and set selected block
      const blocks = await fetchBlocks(data.district);
      const blockName =
        blocks.find((b) => String(b.id) === String(data.block))?.block_name ||
        "";
      setBlock({ id: data.block, name: blockName });

      // 4️⃣ Set other fields
      setFacilitatorName(data.facilitator_name || "");
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
      facilitator_name: facilitatorName,
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

      // Parse the response **once**
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
                <option value="">Select District</option>
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
            <select
              value={facilitatorName}
              onChange={(e) => setFacilitatorName(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
            >
              <option value="">Select Facilitator</option>
              {users.map((user) => (
                <option key={user.id} value={user.username || user.name}>
                  {user.username || user.name} ({user.first_name}{" "}
                  {user.last_name})
                </option>
              ))}
            </select>
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
              setShowConfirm(true); // show confirm page instead of hitting API
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
                <strong>Facilitator:</strong> {facilitatorName}
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
                onClick={handlePlanCreation} // 🔥 API hit only after confirm
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

// import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import { useLocation } from "react-router-dom";
// import { ArrowLeft } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const PlanCreation = ({ onClose, onPlanSaved }) => {
//   const { projectId } = useParams();
//   const [statesList, setStatesList] = useState([]);
//   const [districtsList, setDistrictsList] = useState([]);
//   const [blocksList, setBlocksList] = useState([]);
//   const [state, setState] = useState({ id: "", name: "" });
//   const [district, setDistrict] = useState({ id: "", name: "" });
//   const [block, setBlock] = useState({ id: "", name: "" });
//   const [facilitatorName, setFacilitatorName] = useState("");
//   const [plan, setPlan] = useState("");
//   const [villageName, setVillageName] = useState("");
//   const [gramPanchayat, setGramPanchayat] = useState("");

//   const navigate = useNavigate();
//   const location = useLocation();
//   const { projectName, stateName, stateId, planId } = location.state || {};
//   console.log(projectName);
//   console.log(location.state);

//   useEffect(() => {
//     fetchStates();
//   }, []);

//   useEffect(() => {
//     if (stateId) {
//       fetchDistricts(stateId);
//     }
//   }, [stateId]);

//   console.log(projectId);

//   const fetchedRef = useRef(false);

//   useEffect(() => {
//     if (planId && !fetchedRef.current) {
//       fetchPlanDetails();
//       fetchedRef.current = true;
//     }
//   }, [planId]);

//   const fetchPlanDetails = async () => {
//     try {
//       const token = sessionStorage.getItem("accessToken");

//       // Fetch the plan
//       const response = await fetch(
//         `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectId.id}/watershed/plans/${planId}/`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       const data = await response.json();
//       console.log("Plan Data:", data);

//       setPlan(data.plan);
//       setVillageName(data.village_name);
//       setGramPanchayat(data.gram_panchayat);
//       setFacilitatorName(data.facilitator_name);

//       // Fetch states list
//       const stateRes = await fetch(
//         `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const statesListRaw = await stateRes.json();
//       const statesList = statesListRaw.states || [];
//       const stateMatch = statesList.find(
//         (s) => String(s.state_census_code) === String(data.state)
//       );
//       if (!stateMatch) {
//         console.warn(
//           `No match found for state_census_code ${data.state} in list:`,
//           statesList.map((s) => s.state_census_code)
//         );
//         return;
//       }
//       const [districtRes, blockRes] = await Promise.all([
//         fetch(
//           `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${stateMatch.state_census_code}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         ),
//         fetch(
//           `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${data.district}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         ),
//       ]);

//       const districtsData = await districtRes.json();
//       const blocksData = await blockRes.json();

//       const districtsList = districtsData.districts || [];
//       const blocksList = blocksData.blocks || [];

//       const districtMatch = districtsList.find(
//         (d) => String(d.id) === String(data.district)
//       );
//       const blockMatch = blocksList.find(
//         (b) => String(b.id) === String(data.block)
//       );

//       setState({
//         id: data.state,
//         name: stateMatch?.state_name || "",
//       });
//       setDistrict({
//         id: data.district,
//         name: districtMatch?.district_name || "",
//       });
//       setBlock({
//         id: data.block,
//         name: blockMatch?.block_name || "",
//       });
//     } catch (error) {
//       console.error("Failed to fetch plan details:", error);
//     }
//   };

//   const fetchStates = async () => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
//         {
//           method: "GET",
//           headers: {
//             "content-type": "application/json",
//             "ngrok-skip-browser-warning": "420",
//           },
//         }
//       );
//       const data = await response.json();
//       const sortedStates = data.states.sort((a, b) =>
//         a.state_name.localeCompare(b.state_name)
//       );
//       setStatesList(sortedStates);
//     } catch (error) {
//       console.error("Error fetching states:", error);
//     }
//   };

//   const fetchDistricts = async (stateId) => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${stateId}/`,
//         {
//           method: "GET",
//           headers: {
//             "content-type": "application/json",
//             "ngrok-skip-browser-warning": "420",
//           },
//         }
//       );
//       const data = await response.json();
//       const sortedDistricts = data.districts.sort((a, b) =>
//         a.district_name.localeCompare(b.district_name)
//       );
//       setDistrictsList(sortedDistricts);
//     } catch (error) {
//       console.error("Error fetching districts:", error);
//     }
//   };

//   const fetchBlocks = async (selectedDistrict) => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${selectedDistrict}/`,
//         {
//           method: "GET",
//           headers: {
//             "content-type": "application/json",
//             "ngrok-skip-browser-warning": "420",
//           },
//         }
//       );
//       const data = await response.json();
//       const sortedBlocks = data.blocks.sort((a, b) =>
//         a.block_name.localeCompare(b.block_name)
//       );
//       setBlocksList(sortedBlocks);
//     } catch (error) {
//       console.error("Error fetching blocks:", error);
//     }
//   };

//   const handleStateChange = (event) => {
//     const selectedValue = event.target.value;
//     if (!selectedValue) {
//       setState({ id: "", name: "" });
//       return;
//     }

//     const [state_id, state_name] = selectedValue.split("_");
//     setState({ id: state_id, name: state_name });
//     setDistrictsList([]);
//     setBlocksList([]);
//     fetchDistricts(state_id);
//   };

//   const handleDistrictChange = (event) => {
//     const selectedValue = event.target.value;
//     if (!selectedValue) {
//       setDistrict({ id: "", name: "" });
//       return;
//     }

//     const [id, district_name] = selectedValue.split("_");
//     setDistrict({ id: id, name: district_name });
//     setBlocksList([]);
//     fetchBlocks(id);
//   };

//   const handleBlockChange = (event) => {
//     const selectedValue = event.target.value;
//     if (!selectedValue) {
//       setBlock({ id: "", name: "" });
//       return;
//     }

//     const [id, block_name] = selectedValue.split("_");
//     setBlock({ id: id, name: block_name });
//   };

//   const handlePlanCreation = async (event) => {
//     event.preventDefault();

//     if (
//       state.name &&
//       district.name &&
//       block.name &&
//       facilitatorName &&
//       plan &&
//       villageName &&
//       gramPanchayat
//     ) {
//       const token = sessionStorage.getItem("accessToken");
//       const projectIdValue =
//         typeof projectId === "object" ? projectId.id : projectId;

//       const payload = {
//         plan,
//         state: parseInt(state.id),
//         district: parseInt(district.id),
//         block: parseInt(block.id),
//         village_name: villageName,
//         gram_panchayat: gramPanchayat,
//         facilitator_name: facilitatorName,
//         enabled: true,
//         is_completed: false,
//         is_dpr_generated: false,
//         is_dpr_reviewed: false,
//         is_dpr_approved: false,
//       };
//       const method = planId ? "PUT" : "POST";
//       const url = planId
//         ? `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectIdValue}/watershed/plans/${planId}/`
//         : `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectIdValue}/watershed/plans/`;
//       // `${process.env.REACT_APP_BASEURL}api/v1/projects/4/watershed/plans/`;

//       try {
//         const response = await fetch(url, {
//           method,
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         });

//         if (!response.ok) {
//           toast.error("Failed to create or update the plan.");
//           return;
//         }

//         const savedPlan = await response.json();

//         // Notify parent component
//         if (onPlanSaved) {
//           onPlanSaved(savedPlan); // Pass the saved plan to the parent
//         }

//         toast.success(
//           planId ? "Plan updated successfully!" : "Plan created successfully!"
//         );

//         // Close the dialog box
//         onClose();

//         // Clear form fields
//         setFacilitatorName("");
//         setPlan("");
//         setVillageName("");
//         setGramPanchayat("");
//       } catch (error) {
//         console.error("Error:", error);
//         toast.error("An error occurred while creating or updating the plan.");
//       }
//     } else {
//       alert("Please fill in all fields.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="w-full max-w-4xl p-8 rounded-2xl shadow-lg bg-white border border-gray-200">
//         <ToastContainer />

//         {/* Back Button */}
//         <div className="mb-6">
//           <button
//             onClick={() => navigate("/projects")}
//             className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
//           >
//             <ArrowLeft size={20} /> Back to Projects
//           </button>
//         </div>

//         {/* Header */}
//         <div className="text-center mb-10">
//           <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
//             <span className="text-blue-600">Plan Creation</span>
//           </h1>
//           <p className="text-gray-500 mt-2">
//             Fill in the details to create or update a watershed plan for project
//             : {projectName}
//           </p>
//         </div>

//         {/* Form */}
//         <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* State Dropdown */}
//           {/* State Dropdown / Pre-populated */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               State
//             </label>
//             <input
//               type="text"
//               value={stateName || ""} // pre-populated from navigate state
//               disabled
//               className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
//             />
//           </div>

//           {/* District Dropdown */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               District
//             </label>
//             {planId ? (
//               <input
//                 type="text"
//                 value={district.name || ""}
//                 disabled
//                 className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-600"
//               />
//             ) : (
//               <select
//                 value={
//                   district.id && district.name
//                     ? `${district.id}_${district.name}`
//                     : ""
//                 }
//                 onChange={handleDistrictChange}
//                 className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
//               >
//                 <option value="">Select District</option>
//                 {districtsList.map((district) => (
//                   <option
//                     key={`${district.id}_${district.district_name}`}
//                     value={`${district.id}_${district.district_name}`}
//                   >
//                     {district.district_name}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>

//           {/* Block Dropdown */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Block
//             </label>
//             {planId ? (
//               <input
//                 type="text"
//                 value={block.name || ""}
//                 disabled
//                 className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-600"
//               />
//             ) : (
//               <select
//                 value={
//                   block.id && block.name ? `${block.id}_${block.name}` : ""
//                 }
//                 onChange={handleBlockChange}
//                 className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
//               >
//                 <option value="">Select Block</option>
//                 {blocksList && blocksList.length > 0 ? (
//                   blocksList.map((block) => (
//                     <option
//                       key={`${block.id}_${block.block_name}`}
//                       value={`${block.id}_${block.block_name}`}
//                     >
//                       {block.block_name}
//                     </option>
//                   ))
//                 ) : (
//                   <option value="">No blocks available</option>
//                 )}
//               </select>
//             )}
//           </div>

//           {/* Facilitator Name */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Facilitator Name
//             </label>
//             <input
//               type="text"
//               value={facilitatorName}
//               onChange={(e) => setFacilitatorName(e.target.value)}
//               className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
//               placeholder="Enter Facilitator Name"
//             />
//           </div>

//           {/* Plan */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Plan
//             </label>
//             <input
//               type="text"
//               value={plan}
//               onChange={(e) => setPlan(e.target.value)}
//               className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
//               placeholder="Enter Plan"
//             />
//           </div>

//           {/* Village Name */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Village Name
//             </label>
//             <input
//               type="text"
//               value={villageName}
//               onChange={(e) => setVillageName(e.target.value)}
//               className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
//               placeholder="Enter Village Name"
//             />
//           </div>

//           {/* Gram Panchayat */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Gram Panchayat
//             </label>
//             <input
//               type="text"
//               value={gramPanchayat}
//               onChange={(e) => setGramPanchayat(e.target.value)}
//               className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
//               placeholder="Enter Gram Panchayat"
//             />
//           </div>
//         </form>

//         {/* Submit Button */}
//         <div className="text-center pt-10">
//           <button
//             type="submit"
//             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-md transition-all"
//             onClick={handlePlanCreation}
//           >
//             {planId ? "Update Plan" : "Create Plan"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlanCreation;

// // import React, { useState, useEffect } from "react";
// // import { ToastContainer, toast } from "react-toastify";

// // const PlanCreation = () => {
// //   const [statesList, setStatesList] = useState([]);
// //   const [districtsList, setDistrictsList] = useState([]);
// //   const [blocksList, setBlocksList] = useState([]);
// //   const [state, setState] = useState({ id: "", name: "" });
// //   const [district, setDistrict] = useState({ id: "", name: "" });
// //   const [block, setBlock] = useState({ id: "", name: "" });
// //   const [facilitatorName, setFacilitatorName] = useState("");
// //   const [plan, setPlan] = useState("");
// //   const [villageName, setVillageName] = useState("");
// //   const [gramPanchayat, setGramPanchayat] = useState("");

// //   useEffect(() => {
// //     fetchStates();
// //   }, []);

// //   const fetchStates = async () => {
// //     try {
// //       const response = await fetch(
// //         `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
// //         {
// //           method: "GET",
// //           headers: {
// //             "content-type": "application/json",
// //             "ngrok-skip-browser-warning": "420",
// //           },
// //         }
// //       );
// //       const data = await response.json();
// //       const sortedStates = data.states.sort((a, b) =>
// //         a.state_name.localeCompare(b.state_name)
// //       );
// //       setStatesList(sortedStates);
// //     } catch (error) {
// //       console.error("Error fetching states:", error);
// //     }
// //   };

// //   const fetchDistricts = async (selectedState) => {
// //     try {
// //       const response = await fetch(
// //         `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${selectedState}/`,
// //         {
// //           method: "GET",
// //           headers: {
// //             "content-type": "application/json",
// //             "ngrok-skip-browser-warning": "420",
// //           },
// //         }
// //       );
// //       const data = await response.json();
// //       const sortedDistricts = data.districts.sort((a, b) =>
// //         a.district_name.localeCompare(b.district_name)
// //       );
// //       setDistrictsList(sortedDistricts);
// //     } catch (error) {
// //       console.error("Error fetching districts:", error);
// //     }
// //   };

// //   const fetchBlocks = async (selectedDistrict) => {
// //     try {
// //       const response = await fetch(
// //         `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${selectedDistrict}/`,
// //         {
// //           method: "GET",
// //           headers: {
// //             "content-type": "application/json",
// //             "ngrok-skip-browser-warning": "420",
// //           },
// //         }
// //       );
// //       const data = await response.json();
// //       const sortedBlocks = data.blocks.sort((a, b) =>
// //         a.block_name.localeCompare(b.block_name)
// //       );
// //       setBlocksList(sortedBlocks);
// //     } catch (error) {
// //       console.error("Error fetching blocks:", error);
// //     }
// //   };

// //   const handleStateChange = (event) => {
// //     const selectedValue = event.target.value;
// //     if (!selectedValue) {
// //       setState({ id: "", name: "" });
// //       return;
// //     }

// //     const [state_id, state_name] = selectedValue.split("_");
// //     setState({ id: state_id, name: state_name });
// //     setDistrictsList([]);
// //     setBlocksList([]);
// //     fetchDistricts(state_id);
// //   };

// //   const handleDistrictChange = (event) => {
// //     const selectedValue = event.target.value;
// //     if (!selectedValue) {
// //       setDistrict({ id: "", name: "" });
// //       return;
// //     }

// //     const [id, district_name] = selectedValue.split("_");
// //     setDistrict({ id: id, name: district_name });
// //     setBlocksList([]);
// //     fetchBlocks(id);
// //   };

// //   const handleBlockChange = (event) => {
// //     const selectedValue = event.target.value;
// //     if (!selectedValue) {
// //       setBlock({ id: "", name: "" });
// //       return;
// //     }

// //     const [id, block_name] = selectedValue.split("_");
// //     setBlock({ id: id, name: block_name });
// //   };

// //   const handlePlanCreation = (event) => {
// //     event.preventDefault();
// //     if (
// //       state.name &&
// //       district.name &&
// //       block.name &&
// //       facilitatorName &&
// //       plan &&
// //       villageName &&
// //       gramPanchayat
// //     ) {
// //       const requestOptions = {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           state: parseInt(state.id),
// //           district: parseInt(district.id),
// //           block: parseInt(block.id),
// //           facilitator_name: facilitatorName,
// //           plan,
// //           village_name: villageName,
// //           gram_panchayat: gramPanchayat,
// //         }),
// //       };

// //       fetch(`${process.env.REACT_APP_BASEURL}/api/v1/add_plan/`, requestOptions)
// //         .then((response) => {
// //           if (!response.ok) {
// //             toast.error("Failed to create the plan.");
// //             throw new Error(`HTTP error! Status: ${response.status}`);
// //           }
// //           return response.json();
// //         })
// //         .then((data) => {
// //           toast.success("Plan created successfully!");
// //         })
// //         .catch((error) => {
// //           console.error("Error:", error);
// //         });

// //       // Reset form fields
// //       setFacilitatorName("");
// //       setPlan("");
// //       setVillageName("");
// //       setGramPanchayat("");
// //     } else {
// //       alert("Please fill in all fields.");
// //     }
// //   };

// //   return (
// //     <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-lg mt-0">
// //       <ToastContainer />
// //       <div className="text-center mb-6">
// //         <h1 className="text-3xl font-bold">Plan Creation</h1>{" "}
// //       </div>
// //       <form className="space-y-8">
// //         {/* State Dropdown */}
// //         <div>
// //           <label className="text-lg font-semibold mb-2 block text-left">
// //             State:
// //           </label>
// //           <select
// //             value={state.id && state.name ? `${state.id}_${state.name}` : ""}
// //             onChange={handleStateChange}
// //             className="w-full px-4 py-3 border text-lg rounded-lg"
// //           >
// //             <option value="">Select State</option>
// //             {statesList.map((state) => (
// //               <option
// //                 key={state.state_census_code}
// //                 value={`${state.state_census_code}_${state.state_name}`}
// //               >
// //                 {state.state_name}
// //               </option>
// //             ))}
// //           </select>
// //         </div>

// //         {/* District Dropdown */}
// //         <div>
// //           <label className="text-lg font-semibold mb-2 block text-left">
// //             District:
// //           </label>
// //           <select
// //             value={
// //               district.id && district.name
// //                 ? `${district.id}_${district.name}`
// //                 : ""
// //             }
// //             onChange={handleDistrictChange}
// //             className="w-full px-4 py-3 border text-lg rounded-lg"
// //           >
// //             <option value="">Select District</option>
// //             {districtsList.map((district) => (
// //               <option
// //                 key={`${district.id}_${district.district_name}`} // Ensure uniqueness
// //                 value={`${district.id}_${district.district_name}`}
// //               >
// //                 {district.district_name}
// //               </option>
// //             ))}
// //           </select>
// //         </div>

// //         {/* Block Dropdown */}
// //         <div>
// //           <label className="text-lg font-semibold mb-2 block text-left">
// //             Block:
// //           </label>
// //           <select
// //             value={block.id && block.name ? `${block.id}_${block.name}` : ""}
// //             onChange={handleBlockChange}
// //             className="w-full px-4 py-3 border text-lg rounded-lg"
// //           >
// //             <option value="">Select Block</option>
// //             {blocksList && blocksList.length > 0 ? (
// //               blocksList.map((block) => (
// //                 <option
// //                   key={`${block.id}_${block.block_name}`} // Ensure uniqueness
// //                   value={`${block.id}_${block.block_name}`}
// //                 >
// //                   {block.block_name}
// //                 </option>
// //               ))
// //             ) : (
// //               <option value="">No blocks available</option>
// //             )}
// //           </select>
// //         </div>

// //         {/* Facilitator Name */}
// //         <div>
// //           <label className="text-lg font-semibold mb-2 block text-left">
// //             Facilitator Name:
// //           </label>
// //           <input
// //             type="text"
// //             value={facilitatorName}
// //             onChange={(e) => setFacilitatorName(e.target.value)}
// //             className="w-full px-4 py-3 border text-lg rounded-lg"
// //             placeholder="Enter Facilitator Name"
// //           />
// //         </div>

// //         {/* Plan */}
// //         <div>
// //           <label className="text-lg font-semibold mb-2 block text-left">
// //             Plan:
// //           </label>
// //           <input
// //             type="text"
// //             value={plan}
// //             onChange={(e) => setPlan(e.target.value)}
// //             className="w-full px-4 py-3 border text-lg rounded-lg"
// //             placeholder="Enter Plan"
// //           />
// //         </div>

// //         {/* Village Name */}
// //         <div>
// //           <label className="text-lg font-semibold mb-2 block text-left">
// //             Village Name:
// //           </label>
// //           <input
// //             type="text"
// //             value={villageName}
// //             onChange={(e) => setVillageName(e.target.value)}
// //             className="w-full px-4 py-3 border text-lg rounded-lg"
// //             placeholder="Enter Village Name"
// //           />
// //         </div>

// //         {/* Gram Panchayat */}
// //         <div>
// //           <label className="text-lg font-semibold mb-2 block text-left">
// //             Gram Panchayat:
// //           </label>
// //           <input
// //             type="text"
// //             value={gramPanchayat}
// //             onChange={(e) => setGramPanchayat(e.target.value)}
// //             className="w-full px-4 py-3 border text-lg rounded-lg"
// //             placeholder="Enter Gram Panchayat"
// //           />
// //         </div>

// //         {/* Submit Button */}
// //         <div className="text-center pt-8">
// //           <button
// //             type="submit"
// //             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
// //             onClick={handlePlanCreation}
// //           >
// //             Create Plan
// //           </button>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // };

// // export default PlanCreation;
