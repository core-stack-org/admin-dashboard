import React, { useState, useEffect } from "react";
import layersData from "../jsons/layers.json";
import config from "../services&apis/config";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";

const PreviewLayerComponent = () => {
  console.log("preview layers");
  const [layerNames, setLayerNames] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const api_url = config.api_url;
  const [state, setState] = useState({ id: "", name: "" });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [bbox, setBBox] = useState(null);

  useEffect(() => {
    const layers = Object.keys(layersData.layers_json).map((key) =>
      key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    );
    setLayerNames(layers);
    console.log("Layer Names:", layers);
  }, []);

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

  const handleLayerChange = (event) => {
    setSelectedLayer(event.target.value);
  };

  const handlePreviewLayers = async () => {
    if (!state.name || !district.name || !block.name || !selectedLayer) {
      alert(
        "Please select a state, district, block, and layer before previewing."
      );
      return;
    }

    const formattedDistrict = district.name.toLowerCase().replace(/ /g, "_");
    const formattedBlock = block.name.toLowerCase().replace(/ /g, "_");

    const selectedLayerData = layersData.layers_json[selectedLayer];
    if (!selectedLayerData) {
      console.error("Layer data not found for selected layer:", selectedLayer);
      return;
    }

    const { workspace, end } = selectedLayerData;

    const dynamicEnd = end
      ? end
          .replace(/distname/g, formattedDistrict)
          .replace(/blockname/g, formattedBlock)
      : `${formattedDistrict}_${formattedBlock}`;

    const wfsurl = `https://geoserver.core-stack.org:8443/geoserver/panchayat_boundaries/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=panchayat_boundaries%3A${formattedDistrict}_${formattedBlock}&outputFormat=application%2Fjson`;

    console.log(wfsurl);
    let dynamicBbox = "";
    try {
      const response = await fetch(wfsurl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const adminLayer = await response.json();
      console.log("Admin Layer Data:", adminLayer);

      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(adminLayer),
      });

      const extent = vectorSource.getExtent();
      console.log("Calculated BBox (OpenLayers):", extent);
      console.log("Extent element 0:", extent[0]);
      console.log("Extent element 1:", extent[1]);
      console.log("Extent element 2:", extent[2]);
      console.log("Extent element 3:", extent[3]);
      dynamicBbox =
        extent[0] + "%2C" + extent[1] + "%2C" + extent[2] + "%2C" + extent[3];
      console.log("Dynamic BBox:", dynamicBbox);

      setBBox(extent); // Optionally store the bbox in the state
    } catch (error) {
      console.error("Error fetching WFS data:", error);
    }
    const url = `https://geoserver.core-stack.org:8443/geoserver/${workspace}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${workspace}%3A${dynamicEnd}&bbox=${dynamicBbox}&width=768&height=431&srs=EPSG%3A4326&styles=&format=application/openlayers`;

    // [86.934374, 24.023475, 87.34125, 24.25222];

    console.log("District Name:", district.name);
    console.log("Block Name:", block.name);
    console.log("Dynamic 'end':", dynamicEnd);
    console.log("dynamic url with dynamic bbox", url);

    // setPreviewUrl(url);
    // Open the dynamically generated URL in a new tab
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-lg mt-12">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Preview Layer</h1>{" "}
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

        {/* Layer Dropdown */}
        <div>
          <label className="text-lg font-semibold mb-2 block">
            Select Layer:
          </label>
          <select
            id="layer"
            value={selectedLayer}
            onChange={handleLayerChange}
            className="w-full px-4 py-3 border text-lg rounded-lg"
            disabled={!block.id} // Enable only if block is selected
          >
            <option value="">-- Select Layer --</option>
            {layerNames.map((layer, index) => (
              <option key={index} value={layer}>
                {layer}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={handlePreviewLayers}
          >
            Preview
          </button>
        </div>
      </form>
      {/* {previewUrl && (
        <div className="mt-4">
          <iframe
            src={previewUrl}
            title="Layer Preview"
            className="w-full h-96 border-none"
            allow="cross-origin-isolated"
          />
        </div>
      )} */}

      {/* {previewUrl && (
        <div className="mt-4">
          <iframe
            src={previewUrl}
            title="Layer Preview"
            style={{ width: "100%", height: "400px", border: "none" }}
          ></iframe>
        </div>
      )} */}
    </div>
  );
};

export default PreviewLayerComponent;
