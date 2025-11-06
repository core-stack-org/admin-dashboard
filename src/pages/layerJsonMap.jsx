import React, { useState, useEffect } from "react";
import layersData from "../jsons/layers.json";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";

const LayerMapJsonComponent = () => {
  const [state, setState] = useState({ id: "", name: "" });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [mapType, setMapType] = useState("");
  const [geeAccounts, setGeeAccounts] = useState([]);
  const [selectedGEEAccount, setSelectedGEEAccount] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
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
        `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${selectedState}/`,
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
        `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${selectedDistrict}/`,
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

    const [district_census_code, district_name] = selectedValue.split("_");
    setDistrict({ id: district_census_code, name: district_name });
    setBlocksList([]);
    fetchBlocks(district_census_code);
  };

  const handleBlockChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) {
      setBlock({ id: "", name: "" });
      return;
    }

    const [block_census_code, block_name] = selectedValue.split("_");
    setBlock({ id: block_census_code, name: block_name });
  };

  useEffect(() => {
    const fetchGEEAccounts = async () => {
      const token = sessionStorage.getItem("accessToken");
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

  useEffect(() => {
    if (mapType && mapType !== "map_1") {
      setStartYear(2017);
      setEndYear(2024);
    } else {
      setStartYear("");
      setEndYear("");
    }
  }, [mapType]);

  const handleGenerateJsonMapLayer = async () => {
    if (!state.name || !district.name || !block.name) {
      alert("Please select a state, district, and block to generate Excel.");
      return;
    }
    const token = sessionStorage.getItem("accessToken");

    const payload = {
      state: state.name,
      district: district.name,
      block: block.name,
      map: mapType,
      gee_account_id: selectedGEEAccount,
      ...(mapType !== "map_1" && { start_year: startYear, end_year: endYear }),
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/generate_layer_in_order/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to generate layers");

      const data = await response.json();
      alert("Layer generation started successfully!");
      console.log("Response:", data);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong while generating the layers.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-lg mt-28">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Generate Layer Map Json</h1>{" "}
      </div>
      <form className="space-y-8">
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

        {/* Map Dropdown */}
        <div>
          <label className="text-lg font-semibold mb-2 block">Map Type:</label>
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
            className="w-full px-4 py-3 border text-lg rounded-lg"
          >
            <option value="">Select Map</option>
            <option
              value="map_1"
              title="Covers Admin boundaries, NREGA, and MWS."
            >
              Map 1 - Tehsil-level Basic Layers
            </option>
            <option
              value="map_2_1"
              title="Covers hydrology(Fortnight and Annual)"
            >
              Map 2_1 - Hydrology(Fortnight and Annual)
            </option>
            <option
              value="map_2_2"
              title="Covers LULC with Vectorise LULC, Cropping Intensity, SWB, Drought, Drought Causality, Crop grid, Change detection and vectorise Change detection."
            >
              Map 2_2 - LULC & Cropping
            </option>
            <option
              value="map_3"
              title="Covers Restoration, Aquifer vector, Terrin raster, Terrain cluster, LULC on slope cluster and plain cluster. "
            >
              Map 3 - Restoration & Terrain
            </option>
            <option
              value="map_4"
              title="Covers SOGE vector, Stream order vector, drainage lines, CLART, Tree health ch raster and vector, Tree health ccd raster and vector, Tree health overall change raster and vector. "
            >
              Map 4 - Tree Health & Drainage
            </option>
          </select>
        </div>

        {/*  Year Fields */}
        {mapType && mapType !== "map_1" && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-lg font-semibold mb-2 block">
                Start Year:
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={startYear || 2017}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="Enter start year"
                className="w-full px-4 py-3 border text-lg rounded-lg"
              />
            </div>
            <div>
              <label className="text-lg font-semibold mb-2 block">
                End Year:
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={endYear || 2024}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="Enter end year"
                className="w-full px-4 py-3 border text-lg rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={handleGenerateJsonMapLayer}
          >
            Generate Layer
          </button>
        </div>
      </form>
    </div>
  );
};

export default LayerMapJsonComponent;
