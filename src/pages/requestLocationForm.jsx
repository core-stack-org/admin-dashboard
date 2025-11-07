import React, { useState, useEffect } from "react";
import layersData from "../jsons/layers.json";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";

const RequestLocationForm = () => {
  const [layerNames, setLayerNames] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

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
  }, []);

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

    const wfsurl = `${process.env.REACT_APP_IMAGE_LAYER_URL}/plantation/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=plantation%3Acfpt_infoplantation_suitability&outputFormat=application%2Fjson`;
    // const geojsonViewUrl = `https://geoserver.core-stack.org:8443/geoserver/plantation/wms?service=WMS&version=1.1.0&request=GetMap&layers=plantation%3A${formattedOrganizationName}_${formattedProjectName}_suitability&bbox=77.60057629388909%2C16.03395532759504%2C77.75345653355072%2C16.07371263198302&width=768&height=330&srs=EPSG%3A4326&styles=&format=application/openlayers`;
    let dynamicBbox = "";
    try {
      const response = await fetch(wfsurl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const adminLayer = await response.json();

      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(adminLayer),
      });

      const extent = vectorSource.getExtent();

      dynamicBbox =
        extent[0] + "%2C" + extent[1] + "%2C" + extent[2] + "%2C" + extent[3];
      setBBox(extent);
    } catch (error) {}
    const url = `${process.env.REACT_APP_IMAGE_LAYER_URL}/${workspace}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${workspace}%3A${dynamicEnd}&bbox=${dynamicBbox}&width=768&height=431&srs=EPSG%3A4326&styles=&format=application/openlayers`;

    window.open(url, "_blank");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Request Data Layers
      </h2>

      <div className="w-full h-[90vh]">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSesYshZg_HmNc0FgF-JSBye-AeN6mdyrhF2cjGmqLYeD7WgZA/viewform?embedded=true"
          width="100%"
          height="100%"
          title="Request Data Layers Form"
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
};

export default RequestLocationForm;
