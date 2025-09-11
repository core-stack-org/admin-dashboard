import React, { useState, useEffect } from "react";
import layersData from "../jsons/layers.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

const LocationFormComponent = ({ currentUser }) => {
  console.log(currentUser);
  const location = useLocation();
  const { layerName, showDates } = location.state || {};

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [geeAccounts, setGeeAccounts] = useState([]);
  const [selectedGEEAccount, setSelectedGEEAccount] = useState("");

  const dateRange = layersData?.layers_json[layerName]?.date_range || [
    2017,
    new Date().getFullYear() - 2,
  ];

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

  console.log(layersData.layers_json);

  useEffect(() => {
    fetchStates();
  }, []);

  const normalizeName = (str) =>
    str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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

      const normalizedStates = data.states.map((state) => ({
        ...state,
        state_name: normalizeName(state.state_name),
      }));

      const sortedStates = normalizedStates.sort((a, b) =>
        a.state_name.localeCompare(b.state_name)
      );

      setStatesList(sortedStates);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchDistricts = async (selectedState) => {
    setDistrictsLoading(true);
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

      const normalizedDistricts = data.districts.map((district) => ({
        ...district,
        district_name: normalizeName(district.district_name),
      }));

      const sortedDistricts = normalizedDistricts.sort((a, b) =>
        a.district_name.localeCompare(b.district_name)
      );
      setDistrictsList(sortedDistricts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setDistrictsLoading(false);
    }
  };

  const fetchBlocks = async (selectedDistrict) => {
    setBlocksLoading(true);
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
      const normalizedBlocks = data.blocks.map((block) => ({
        ...block,
        block_name: normalizeName(block.block_name),
      }));

      const sortedBlocks = normalizedBlocks.sort((a, b) =>
        a.block_name.localeCompare(b.block_name)
      );
      setBlocksList(sortedBlocks);
    } catch (error) {
      console.error("Error fetching blocks:", error);
    } finally {
      setBlocksLoading(false);
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

  useEffect(() => {
    const fetchGEEAccounts = async () => {
      const token = sessionStorage.getItem("accessToken");
      console.log(token);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}api/v1/geeaccounts/`,
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
        console.log("GEEEEEEEE", data);
        setGeeAccounts(data);
      } catch (error) {
        console.error("Error fetching GEE accounts:", error);
      }
    };

    fetchGEEAccounts();
  }, []);

  const handleGEEAccountChange = (event) => {
    setSelectedGEEAccount(event.target.value);
  };

  const handleGenerateLayer = async (e) => {
    e.preventDefault();
    setError(null);
    console.log(layerName);
    const selectedLayer = layersData.layers_json[layerName];
    console.log(selectedLayer);
    const apiUrlSuffix = selectedLayer.api_url.split("/").slice(-2).join("/");
    console.log(apiUrlSuffix);

    const token = sessionStorage.getItem("accessToken");

    const apiUrl = `${process.env.REACT_APP_BASEURL}api/v1/${apiUrlSuffix}`;
    console.log(apiUrl);

    setIsLoading(true);

    try {
      let response;
      if (layerName === "FES CLART") {
        if (!selectedFile) {
          toast.error("Please upload a file.");
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("state", state.name);
        formData.append("district", district.name);
        formData.append("block", block.name);
        formData.append("clart_file", selectedFile);
        formData.append("gee_account_id", selectedGEEAccount);

        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "420",
          },
          body: formData,
        });
      } else {
        let payload = {
          state: state.name,
          district: district.name,
          block: block.name,
          gee_account_id: selectedGEEAccount,
        };

        if (layerName === "LULC Farm Boundaries" || layerName === "LULC V4") {
          payload.start_year = 2023;
          payload.end_year = 2024;
        } else {
          payload.start_year = parseInt(
            showDates ? startYear || dateRange[0] : null
          );
          payload.end_year = parseInt(
            showDates ? endYear || dateRange[1] : null
          );
        }

        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error: ${response.statusText}`);
      }

      const data = await response.json();
      toast.success("Layer generation initiated successfully!");
      if (data.success) {
        alert("Layer generation initiated successfully!");
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
    layerName === "LULC Farm Boundaries" || layerName === "LULC V4"
      ? [2023, 2024]
      : dateRange.length === 2
      ? generateYears(dateRange[0], dateRange[1])
      : [];

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
          <div className="relative">
            <select
              value={
                district.id && district.name
                  ? `${district.id}_${district.name}`
                  : ""
              }
              onChange={handleDistrictChange}
              disabled={districtsLoading} // disable when loading
              className="w-full px-4 py-3 border text-lg rounded-lg pr-10" // add space for spinner
            >
              <option value="">
                {districtsLoading ? "Loading districts..." : "Select District"}
              </option>
              {!districtsLoading &&
                districtsList.map((district) => (
                  <option
                    key={`${district.id}_${district.district_name}`}
                    value={`${district.id}_${district.district_name}`}
                  >
                    {district.district_name}
                  </option>
                ))}
            </select>

            {/* Spinner */}
            {districtsLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Block Dropdown */}

        <div>
          <label className="text-lg font-semibold mb-2 block">Block:</label>
          <select
            value={block.id && block.name ? `${block.id}_${block.name}` : ""}
            onChange={handleBlockChange}
            disabled={blocksLoading}
            className="w-full px-4 py-3 border text-lg rounded-lg"
          >
            <option value="">
              {" "}
              {districtsLoading ? "Loading blocks..." : "Select Block"}
            </option>
            {!blocksLoading && blocksList && blocksList.length > 0 ? (
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
          {blocksLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="animate-spin h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {layerName === "FES CLART" && (
          <div>
            <label className="text-lg font-semibold mb-2 block">
              Upload File:
            </label>
            <input
              type="file"
              accept=".zip,.geojson,.kml,.tiff"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full px-4 py-2 border text-lg rounded-lg"
            />
          </div>
        )}

        {/* Start Year Dropdown */}
        {showDates && (
          <div>
            <label className="text-lg font-semibold mb-2 block">
              Start Year:
            </label>
            <select
              value={
                layerName === "LULC Farm Boundaries" || layerName === "LULC V4"
                  ? "2023"
                  : startYear || dateRange[0]
              }
              onChange={(e) => setStartYear(e.target.value)}
              disabled={layerName === "LULC Farm Boundaries"}
              className="w-full px-4 py-3 border text-lg rounded-lg"
            >
              <option value="">Select Start Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* End Year Dropdown */}
        {showDates && (
          <div>
            <label className="text-lg font-semibold mb-2 block">
              End Year:
            </label>
            <select
              value={
                layerName === "LULC Farm Boundaries" || layerName === "LULC V4"
                  ? "2024"
                  : endYear || dateRange[1]
              }
              onChange={(e) => setEndYear(e.target.value)}
              disabled={layerName === "LULC Farm Boundaries"}
              className="w-full px-4 py-3 border text-lg rounded-lg"
            >
              <option value="">Select End Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* GEE Account Dropdown */}
        <div>
          <label className="text-lg font-semibold mb-2 block">
            Select GEE Account:
          </label>
          <select
            value={selectedGEEAccount}
            onChange={handleGEEAccountChange}
            className="w-full px-4 py-3 border text-lg rounded-lg"
          >
            <option value="">Select GEE Account</option>
            {Array.isArray(geeAccounts) &&
              geeAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
          </select>
        </div>

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
