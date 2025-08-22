import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const PlanCreation = ({ onClose, onPlanSaved }) => {
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [state, setState] = useState({ id: "", name: "" });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [facilitatorName, setFacilitatorName] = useState("");
  const [plan, setPlan] = useState("");
  const [villageName, setVillageName] = useState("");
  const [gramPanchayat, setGramPanchayat] = useState("");

  const location = useLocation();
  const { project, planId } = location.state || {};
  const projectId = project?.id;

  useEffect(() => {
    fetchStates();
  }, []);

  console.log(projectId);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (planId && !fetchedRef.current) {
      fetchPlanDetails();
      fetchedRef.current = true;
    }
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");

      // Fetch the plan
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectId.id}/watershed/plans/${planId}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log("Plan Data:", data);

      setPlan(data.plan);
      setVillageName(data.village_name);
      setGramPanchayat(data.gram_panchayat);
      setFacilitatorName(data.facilitator_name);

      // Fetch states list
      const stateRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_states/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const statesListRaw = await stateRes.json();
      const statesList = statesListRaw.states || [];
      const stateMatch = statesList.find(
        (s) => String(s.state_census_code) === String(data.state)
      );
      if (!stateMatch) {
        console.warn(
          `No match found for state_census_code ${data.state} in list:`,
          statesList.map((s) => s.state_census_code)
        );
        return;
      }
      const [districtRes, blockRes] = await Promise.all([
        fetch(
          `${process.env.REACT_APP_API_URL}/api/v1/get_districts/${stateMatch.state_census_code}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `${process.env.REACT_APP_API_URL}/api/v1/get_blocks/${data.district}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      const districtsData = await districtRes.json();
      const blocksData = await blockRes.json();

      const districtsList = districtsData.districts || [];
      const blocksList = blocksData.blocks || [];

      const districtMatch = districtsList.find(
        (d) => String(d.id) === String(data.district)
      );
      const blockMatch = blocksList.find(
        (b) => String(b.id) === String(data.block)
      );

      setState({
        id: data.state,
        name: stateMatch?.state_name || "",
      });
      setDistrict({
        id: data.district,
        name: districtMatch?.district_name || "",
      });
      setBlock({
        id: data.block,
        name: blockMatch?.block_name || "",
      });
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_states/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      const sortedStates = data.states.sort((a, b) =>
        a.state_name.localeCompare(b.state_name)
      );
      setStatesList(sortedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchDistricts = async (selectedState) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_districts/${selectedState}/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      const sortedDistricts = data.districts.sort((a, b) =>
        a.district_name.localeCompare(b.district_name)
      );
      setDistrictsList(sortedDistricts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchBlocks = async (selectedDistrict) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_blocks/${selectedDistrict}/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await response.json();
      const sortedBlocks = data.blocks.sort((a, b) =>
        a.block_name.localeCompare(b.block_name)
      );
      setBlocksList(sortedBlocks);
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  const handleStateChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setState({ id: "", name: "" });
      return;
    }

    const [state_id, state_name] = selectedValue.split("_");
    setState({ id: state_id, name: state_name });
    setDistrictsList([]);
    setBlocksList([]);
    fetchDistricts(state_id);
  };

  const handleDistrictChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setDistrict({ id: "", name: "" });
      return;
    }

    const [id, district_name] = selectedValue.split("_");
    setDistrict({ id: id, name: district_name });
    setBlocksList([]);
    fetchBlocks(id);
  };

  const handleBlockChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setBlock({ id: "", name: "" });
      return;
    }

    const [id, block_name] = selectedValue.split("_");
    setBlock({ id: id, name: block_name });
  };

  const handlePlanCreation = async (event) => {
    event.preventDefault();

    if (
      state.name &&
      district.name &&
      block.name &&
      facilitatorName &&
      plan &&
      villageName &&
      gramPanchayat
    ) {
      const token = sessionStorage.getItem("accessToken");
      const projectIdValue =
        typeof projectId === "object" ? projectId.id : projectId;

      const payload = {
        plan,
        state: parseInt(state.id),
        district: parseInt(district.id),
        block: parseInt(block.id),
        village_name: villageName,
        gram_panchayat: gramPanchayat,
        facilitator_name: facilitatorName,
      };
      const method = planId ? "PUT" : "POST";
      const url = planId
        ? `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectIdValue}/watershed/plans/${planId}/`
        : `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectIdValue}/watershed/plans/`;
      // `${process.env.REACT_APP_BASEURL}api/v1/projects/4/watershed/plans/`;

      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          toast.error("Failed to create or update the plan.");
          return;
        }

        const savedPlan = await response.json();

        // Notify parent component
        if (onPlanSaved) {
          onPlanSaved(savedPlan); // Pass the saved plan to the parent
        }

        toast.success(
          planId ? "Plan updated successfully!" : "Plan created successfully!"
        );

        // Close the dialog box
        onClose();

        // Clear form fields
        setFacilitatorName("");
        setPlan("");
        setVillageName("");
        setGramPanchayat("");
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while creating or updating the plan.");
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg">
      <ToastContainer />
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold">Plan Creation</h1>{" "}
      </div>
      <form className="space-y-8">
        {/* State Dropdown */}
        <div>
          <label className="text-base font-medium mb-2 block text-left">
            State:
          </label>
          {planId ? (
            <input
              type="text"
              value={state.name || ""}
              disabled
              className="w-full px-4 py-3 border text-lg rounded-lg"
            />
          ) : (
            <select
              value={state.id && state.name ? `${state.id}_${state.name}` : ""}
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
          )}
        </div>

        {/* District Dropdown */}
        <div>
          <label className="text-base font-medium mb-2 block text-left">
            District:
          </label>
          {planId ? (
            <input
              type="text"
              value={district.name || ""}
              disabled
              className="w-full px-4 py-3 border text-lg rounded-lg"
            />
          ) : (
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
              {districtsList.map((district) => (
                <option
                  key={`${district.id}_${district.district_name}`} // Ensure uniqueness
                  value={`${district.id}_${district.district_name}`}
                >
                  {district.district_name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Block Dropdown */}
        <div>
          <label className="text-base font-medium mb-2 block text-left">
            Block:
          </label>
          {planId ? (
            <input
              type="text"
              value={block.name || ""}
              disabled
              className="w-full px-4 py-3 border text-lg rounded-lg"
            />
          ) : (
            <select
              value={block.id && block.name ? `${block.id}_${block.name}` : ""}
              onChange={handleBlockChange}
              className="w-full px-4 py-3 border text-lg rounded-lg"
            >
              <option value="">Select Block</option>
              {blocksList && blocksList.length > 0 ? (
                blocksList.map((block) => (
                  <option
                    key={`${block.id}_${block.block_name}`} // Ensure uniqueness
                    value={`${block.id}_${block.block_name}`}
                  >
                    {block.block_name}
                  </option>
                ))
              ) : (
                <option value="">No blocks available</option>
              )}
            </select>
          )}
        </div>

        {/* Facilitator Name */}
        <div>
          <label className="text-base font-medium mb-2 block text-left">
            Facilitator Name:
          </label>
          <input
            type="text"
            value={facilitatorName}
            onChange={(e) => setFacilitatorName(e.target.value)}
            className="w-full px-4 py-3 border text-lg rounded-lg"
            placeholder="Enter Facilitator Name"
          />
        </div>

        {/* Plan */}
        <div>
          <label className="text-base font-medium mb-2 block text-left">
            Plan:
          </label>
          <input
            type="text"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full px-4 py-3 border text-lg rounded-lg"
            placeholder="Enter Plan"
          />
        </div>

        {/* Village Name */}
        <div>
          <label className="text-base font-medium mb-2 block text-left">
            Village Name:
          </label>
          <input
            type="text"
            value={villageName}
            onChange={(e) => setVillageName(e.target.value)}
            className="w-full px-4 py-3 border text-lg rounded-lg"
            placeholder="Enter Village Name"
          />
        </div>

        {/* Gram Panchayat */}
        <div>
          <label className="text-base font-medium mb-2 block text-left">
            Gram Panchayat:
          </label>
          <input
            type="text"
            value={gramPanchayat}
            onChange={(e) => setGramPanchayat(e.target.value)}
            className="w-full px-4 py-3 border text-lg rounded-lg"
            placeholder="Enter Gram Panchayat"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center pt-8">
          <button
            type="submit"
            className="bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700"
            onClick={handlePlanCreation}
          >
            {planId ? "Update Plan" : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanCreation;

// import React, { useState, useEffect } from "react";
// import { ToastContainer, toast } from "react-toastify";

// const PlanCreation = () => {
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

//   useEffect(() => {
//     fetchStates();
//   }, []);

//   const fetchStates = async () => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_API_URL}/api/v1/get_states/`,
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

//   const fetchDistricts = async (selectedState) => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_API_URL}/api/v1/get_districts/${selectedState}/`,
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
//         `${process.env.REACT_APP_API_URL}/api/v1/get_blocks/${selectedDistrict}/`,
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

//   const handlePlanCreation = (event) => {
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
//       const requestOptions = {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           state: parseInt(state.id),
//           district: parseInt(district.id),
//           block: parseInt(block.id),
//           facilitator_name: facilitatorName,
//           plan,
//           village_name: villageName,
//           gram_panchayat: gramPanchayat,
//         }),
//       };

//       fetch(`${process.env.REACT_APP_API_URL}/api/v1/add_plan/`, requestOptions)
//         .then((response) => {
//           if (!response.ok) {
//             toast.error("Failed to create the plan.");
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           toast.success("Plan created successfully!");
//         })
//         .catch((error) => {
//           console.error("Error:", error);
//         });

//       // Reset form fields
//       setFacilitatorName("");
//       setPlan("");
//       setVillageName("");
//       setGramPanchayat("");
//     } else {
//       alert("Please fill in all fields.");
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-lg mt-0">
//       <ToastContainer />
//       <div className="text-center mb-6">
//         <h1 className="text-3xl font-bold">Plan Creation</h1>{" "}
//       </div>
//       <form className="space-y-8">
//         {/* State Dropdown */}
//         <div>
//           <label className="text-lg font-semibold mb-2 block text-left">
//             State:
//           </label>
//           <select
//             value={state.id && state.name ? `${state.id}_${state.name}` : ""}
//             onChange={handleStateChange}
//             className="w-full px-4 py-3 border text-lg rounded-lg"
//           >
//             <option value="">Select State</option>
//             {statesList.map((state) => (
//               <option
//                 key={state.state_census_code}
//                 value={`${state.state_census_code}_${state.state_name}`}
//               >
//                 {state.state_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* District Dropdown */}
//         <div>
//           <label className="text-lg font-semibold mb-2 block text-left">
//             District:
//           </label>
//           <select
//             value={
//               district.id && district.name
//                 ? `${district.id}_${district.name}`
//                 : ""
//             }
//             onChange={handleDistrictChange}
//             className="w-full px-4 py-3 border text-lg rounded-lg"
//           >
//             <option value="">Select District</option>
//             {districtsList.map((district) => (
//               <option
//                 key={`${district.id}_${district.district_name}`} // Ensure uniqueness
//                 value={`${district.id}_${district.district_name}`}
//               >
//                 {district.district_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Block Dropdown */}
//         <div>
//           <label className="text-lg font-semibold mb-2 block text-left">
//             Block:
//           </label>
//           <select
//             value={block.id && block.name ? `${block.id}_${block.name}` : ""}
//             onChange={handleBlockChange}
//             className="w-full px-4 py-3 border text-lg rounded-lg"
//           >
//             <option value="">Select Block</option>
//             {blocksList && blocksList.length > 0 ? (
//               blocksList.map((block) => (
//                 <option
//                   key={`${block.id}_${block.block_name}`} // Ensure uniqueness
//                   value={`${block.id}_${block.block_name}`}
//                 >
//                   {block.block_name}
//                 </option>
//               ))
//             ) : (
//               <option value="">No blocks available</option>
//             )}
//           </select>
//         </div>

//         {/* Facilitator Name */}
//         <div>
//           <label className="text-lg font-semibold mb-2 block text-left">
//             Facilitator Name:
//           </label>
//           <input
//             type="text"
//             value={facilitatorName}
//             onChange={(e) => setFacilitatorName(e.target.value)}
//             className="w-full px-4 py-3 border text-lg rounded-lg"
//             placeholder="Enter Facilitator Name"
//           />
//         </div>

//         {/* Plan */}
//         <div>
//           <label className="text-lg font-semibold mb-2 block text-left">
//             Plan:
//           </label>
//           <input
//             type="text"
//             value={plan}
//             onChange={(e) => setPlan(e.target.value)}
//             className="w-full px-4 py-3 border text-lg rounded-lg"
//             placeholder="Enter Plan"
//           />
//         </div>

//         {/* Village Name */}
//         <div>
//           <label className="text-lg font-semibold mb-2 block text-left">
//             Village Name:
//           </label>
//           <input
//             type="text"
//             value={villageName}
//             onChange={(e) => setVillageName(e.target.value)}
//             className="w-full px-4 py-3 border text-lg rounded-lg"
//             placeholder="Enter Village Name"
//           />
//         </div>

//         {/* Gram Panchayat */}
//         <div>
//           <label className="text-lg font-semibold mb-2 block text-left">
//             Gram Panchayat:
//           </label>
//           <input
//             type="text"
//             value={gramPanchayat}
//             onChange={(e) => setGramPanchayat(e.target.value)}
//             className="w-full px-4 py-3 border text-lg rounded-lg"
//             placeholder="Enter Gram Panchayat"
//           />
//         </div>

//         {/* Submit Button */}
//         <div className="text-center pt-8">
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//             onClick={handlePlanCreation}
//           >
//             Create Plan
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PlanCreation;
