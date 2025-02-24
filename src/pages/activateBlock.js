// src/ActivateBlock.js
import React, { useState, useEffect } from "react";
import config from "../../src/services&apis/config.js";
import { ToastContainer, toast } from "react-toastify";

const ActivateBlock = () => {
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [state, setState] = useState({ id: "", name: "" });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const api_url = config.api_url;

  useEffect(() => {
    console.log("fetch states use effect");
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch(`${api_url}/api/v1/get_states/`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "ngrok-skip-browser-warning": "420",
        },
      });
      const data = await response.json();
      const sortedStates = data.states.sort((a, b) =>
        a.state_name.localeCompare(b.state_name)
      );
      console.log(sortedStates);
      setStatesList(sortedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchDistricts = async (selectedState) => {
    try {
      const response = await fetch(
        `${api_url}/api/v1/get_districts/${selectedState}/`,
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
      console.log(sortedDistricts);
      setDistrictsList(sortedDistricts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchBlocks = async (selectedDistrict) => {
    try {
      const response = await fetch(
        `${api_url}/api/v1/get_blocks/${selectedDistrict}/`,
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
      console.log(sortedBlocks);
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

  const handleActivateBlock = async (event) => {
    event.preventDefault();

    const requestBody = {
      state_id: state.id,
      district_id: district.id,
      block_id: block.id,
    };

    console.log("Request Body:", requestBody);

    try {
      const response = await fetch(`${api_url}/api/v1/activate_entities/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        if (response.status === 200) {
          const responseData = await response.json();
          if (responseData.message === "Block already activated") {
            toast.info("Block is already activated!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            console.log("Block is already activated.");
          } else {
            toast.success("Block activated successfully!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            console.log("Block Activation Success!");
          }
        } else if (response.status === 204) {
          toast.warning("Block deactivated! Please reactivate...", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          console.log("Block Deactivation Success!");
        } else {
          throw new Error(`Unexpected HTTP status: ${response.status}`);
        }
      } else {
        throw new Error("Failed to fetch. Network response was not ok.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while activating the block.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-lg mt-32">
      <ToastContainer />
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Activate Block</h1>{" "}
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

        {/* Submit Button */}
        <div className="text-center pt-8">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={handleActivateBlock}
          >
            Activate Block
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivateBlock;
