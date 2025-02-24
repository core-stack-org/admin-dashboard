import React, { useState, useEffect } from "react";
import layersData from "../jsons/layers.json";
import config from "../services&apis/config.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

const LocationFormComponent = ({ addTask }) => {
  const location = useLocation();
  const { layerName, apiUrl, showDates } = location.state || {};

  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [state, setState] = useState({ id: "", name: "" });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStatusBoxOpen, setIsStatusBoxOpen] = useState(false);
  const api_url = config.api_url;
  console.log(apiUrl);
  const layer_api_url_v1 = config.layer_api_url_v1;
  console.log(layer_api_url_v1);
  const updatedApiUrl = api_url.replace(
    "${config.layer_api_url_v1}",
    layer_api_url_v1
  );

  console.log(updatedApiUrl);
  const dateRange = layersData?.layers_json[layerName]?.date_range || [
    2017,
    new Date().getFullYear() - 2,
  ];
  console.log(dateRange, layerName);

  const layers = Object.keys(layersData.layers_json).map((key) => {
    const label = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return {
      label,
      apiUrl: layersData.layers_json[key].api_url,
      showYear: layersData.layers_json[key].show_year,
    };
  });

  useEffect(() => {
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
  const handleGenerateLayer = async (e) => {
    e.preventDefault();
    setError(null);

    // toast.info("Layer generation started...");
    const taskId = `TASK-${Math.floor(Math.random() * 10000)}`; // Replace with API-generated task ID
    const newTask = { id: taskId, layerName, status: "Started" };

    // Add task to the sidebar
    addTask(newTask);

    // Simulate status updates
    setTimeout(() => {
      addTask({ ...newTask, status: "In Progress" });
      // toast.info("Layer generation in progress...");
    }, 2000);

    setTimeout(() => {
      addTask({ ...newTask, status: "Completed" });
      // toast.success("Layer generation completed!");
    }, 5000);

    const payload = {
      state: state.name,
      district: district.name,
      block: block.name,
      start_year: parseInt(showDates ? dateRange[0] : null),
      end_year: parseInt(showDates ? dateRange[1] : null),
    };

    setIsLoading(true);

    try {
      const response = await fetch(updatedApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "420",
        },
        body: JSON.stringify(payload),
      });
      console.log(updatedApiUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Layer generated successfully:", data);

      toast.success("Layer generated successfully!");

      if (data.success) {
        alert("Layer generated successfully!");
      }
    } catch (error) {
      console.error("Error generating layer:", error);

      toast.error(
        error.message || "Failed to generate layer. Please try again."
      );
      setError(error.message || "Failed to generate layer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateYears = (start, end) => {
    const years = [];
    for (let year = start; year <= end; year++) {
      years.push(year);
    }
    return years;
  };

  const years =
    dateRange.length === 2 ? generateYears(dateRange[0], dateRange[1]) : [];

  return (
    <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-lg mt-32">
      <ToastContainer />
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">{layerName}</h1>{" "}
      </div>

      <form className="space-y-8">
        {/* State Dropdown */}
        <div>
          <label className="text-lg font-semibold mb-2 block">State:</label>
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
          <label className="text-lg font-semibold mb-2 block">District:</label>
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
          <label className="text-lg font-semibold mb-2 block">Block:</label>
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

        {/* Year Fields */}
        {showDates && (
          <>
            {/* Start Year Dropdown */}
            <div>
              <label
                htmlFor="start-year"
                className="text-lg font-semibold mb-2 block"
              >
                Start Year:
              </label>
              <select
                id="start-year"
                value={startYear || dateRange[0]}
                onChange={(e) => setStartYear(e.target.value)}
                className="w-full px-4 py-3 border text-lg rounded-lg"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* End Year Dropdown */}
            <div>
              <label
                htmlFor="end-year"
                className="text-lg font-semibold mb-2 block"
              >
                End Year:
              </label>
              <select
                id="end-year"
                value={endYear || dateRange[1]}
                onChange={(e) => setEndYear(e.target.value)}
                className="w-full px-4 py-3 border text-lg rounded-lg"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="text-center pt-8">
          <button
            type="submit"
            className="bg-blue-600 text-white text-lg px-8 py-3 rounded-lg hover:bg-blue-700"
            onClick={handleGenerateLayer}
          >
            Generate Layer
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationFormComponent;
