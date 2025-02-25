import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

const PlanCreation = () => {
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

  useEffect(() => {
    fetchStates();
  }, []);

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

  const handlePlanCreation = (event) => {
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
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: parseInt(state.id),
          district: parseInt(district.id),
          block: parseInt(block.id),
          facilitator_name: facilitatorName,
          plan,
          village_name: villageName,
          gram_panchayat: gramPanchayat,
        }),
      };

      fetch(`${process.env.REACT_APP_API_URL}/api/v1/add_plan/`, requestOptions)
        .then((response) => {
          if (!response.ok) {
            toast.error("Failed to create the plan.");
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          toast.success("Plan created successfully!");
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      // Reset form fields
      setFacilitatorName("");
      setPlan("");
      setVillageName("");
      setGramPanchayat("");
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-lg mt-12">
      <ToastContainer />
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Plan Creation</h1>{" "}
      </div>
      <form className="space-y-8">
        {/* State Dropdown */}
        <div>
          <label className="text-lg font-semibold mb-2 block text-left">
            State:
          </label>
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
        </div>

        {/* District Dropdown */}
        <div>
          <label className="text-lg font-semibold mb-2 block text-left">
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
            {districtsList.map((district) => (
              <option
                key={`${district.id}_${district.district_name}`} // Ensure uniqueness
                value={`${district.id}_${district.district_name}`}
              >
                {district.district_name}
              </option>
            ))}
          </select>
        </div>

        {/* Block Dropdown */}
        <div>
          <label className="text-lg font-semibold mb-2 block text-left">
            Block:
          </label>
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
        </div>

        {/* Facilitator Name */}
        <div>
          <label className="text-lg font-semibold mb-2 block text-left">
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
          <label className="text-lg font-semibold mb-2 block text-left">
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
          <label className="text-lg font-semibold mb-2 block text-left">
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
          <label className="text-lg font-semibold mb-2 block text-left">
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={handlePlanCreation}
          >
            Create Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanCreation;
