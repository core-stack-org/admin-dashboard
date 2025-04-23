// import React, { useState, useEffect } from "react";
// import { ToastContainer, toast } from "react-toastify";

// const ActivateBlock = () => {
//   const [statesList, setStatesList] = useState([]);
//   const [districtsList, setDistrictsList] = useState([]);
//   const [blocksList, setBlocksList] = useState([]);
//   const [state, setState] = useState({ id: "", name: "" });
//   const [district, setDistrict] = useState({ id: "", name: "" });
//   const [block, setBlock] = useState({ id: "", name: "" });

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

//   const handleActivateBlock = async (event) => {
//     event.preventDefault();

//     const requestBody = {
//       state_id: state.id,
//       district_id: district.id,
//       block_id: block.id,
//     };
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_API_URL}/api/v1/activate_location/`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(requestBody),
//         }
//       );

//       console.warn("Response status:", response.status);

//       if (response.ok) {
//         if (response.status === 200) {
//           const responseData = await response.json();
//           if (responseData.message === "Block already activated") {
//             toast.info("Block is already activated!", {
//               position: "top-right",
//               autoClose: 3000,
//               hideProgressBar: false,
//               closeOnClick: true,
//               pauseOnHover: true,
//               draggable: true,
//             });
//           } else {
//             toast.success("Block activated successfully!", {
//               position: "top-right",
//               autoClose: 3000,
//               hideProgressBar: false,
//               closeOnClick: true,
//               pauseOnHover: true,
//               draggable: true,
//             });
//           }
//         } else if (response.status === 204) {
//           toast.warning("Block deactivated! Please reactivate...", {
//             position: "top-right",
//             autoClose: 3000,
//             hideProgressBar: false,
//             closeOnClick: true,
//             pauseOnHover: true,
//             draggable: true,
//           });
//         } else {
//           throw new Error(`Unexpected HTTP status: ${response.status}`);
//         }
//       } else {
//         throw new Error("Failed to fetch. Network response was not ok.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error("An error occurred while activating the block.", {
//         position: "top-right",
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-lg mt-32">
//       <ToastContainer />
//       <div className="text-center mb-6">
//         <h1 className="text-2xl font-bold">Activate Location</h1>{" "}
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

//         {/* Submit Button */}
//         <div className="text-center pt-8">
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//             onClick={handleActivateBlock}
//           >
//             Activate Block
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ActivateBlock;

import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

const ActivateBlock = () => {
  const [locationType, setLocationType] = useState("State");
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState({
    id: "",
    name: "",
  });

  useEffect(() => {
    if (locationType === "State") fetchStates();
    else if (locationType === "District") fetchDistricts();
    else if (locationType === "Block") fetchBlocks();
  }, [locationType]);

  const fetchStates = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_states/`
      );
      const data = await response.json();
      const sorted = data.states.sort((a, b) =>
        a.state_name.localeCompare(b.state_name)
      );
      setStatesList(sorted);
    } catch (error) {
      toast.error("Failed to load states.");
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_districts_all/`
      );
      const data = await response.json();
      const sorted = data.districts.sort((a, b) =>
        a.district_name.localeCompare(b.district_name)
      );
      setDistrictsList(sorted);
    } catch (error) {
      toast.error("Failed to load districts.");
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_blocks_all/`
      );
      const data = await response.json();
      const sorted = data.blocks.sort((a, b) =>
        a.block_name.localeCompare(b.block_name)
      );
      setBlocksList(sorted);
    } catch (error) {
      toast.error("Failed to load blocks.");
    }
  };

  const handleActivate = () => {
    const endpoint = `${process.env.REACT_APP_BASEURL}api/v1/activate_location/`;
    handleSubmit(endpoint, true, selectedLocation);
  };

  const handleDeactivate = () => {
    const endpoint = `${process.env.REACT_APP_BASEURL}/api/v1/activate_location/`;
    handleSubmit(endpoint, false, selectedLocation);
  };

  const handleSubmit = async (endpoint, isActive, location) => {
    if (!location || !location.id) {
      toast.error("Please select a valid location.");
      return;
    }

    const requestBody = {
      location_type: locationType.toLowerCase(),
      location_id: location.id,
      active: isActive,
    };

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const label =
          locationType.charAt(0).toUpperCase() + locationType.slice(1);
        toast.success(
          `${label} ${isActive ? "activated" : "deactivated"} successfully!`
        );
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Network error while submitting.");
    }
  };

  const getLocationOptions = () => {
    if (locationType === "State")
      return statesList.map((s) => ({
        id: s.state_census_code,
        name: s.state_name,
      }));
    if (locationType === "District")
      return districtsList.map((d) => ({ id: d.id, name: d.district_name }));
    if (locationType === "Block")
      return blocksList.map((b) => ({ id: b.id, name: b.block_name }));
    return [];
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-8 mt-24">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-center">
        Activate/Deactivate Location
      </h2>

      {/* Location Type Selector */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Location Type:</label>
        <select
          className="w-full p-3 border rounded"
          value={locationType}
          onChange={(e) => {
            setLocationType(e.target.value);
            setSelectedId("");
          }}
        >
          <option value="State">State</option>
          <option value="District">District</option>
          <option value="Block">Block</option>
        </select>
      </div>

      {/* Location Dropdown */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">
          Select {locationType}:
        </label>
        <select
          className="w-full p-3 border rounded"
          value={selectedLocation.id}
          onChange={(e) => {
            const selected = getLocationOptions().find(
              (item) => item.id === e.target.value
            );
            setSelectedLocation(selected || { id: "", name: "" });
          }}
        >
          <option value="">Select {locationType}</option>
          {getLocationOptions().map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          onClick={handleActivate}
        >
          Activate
        </button>
        <button
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          onClick={handleDeactivate}
        >
          Deactivate
        </button>
      </div>
    </div>
  );
};

export default ActivateBlock;
