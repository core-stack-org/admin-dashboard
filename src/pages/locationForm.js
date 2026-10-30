import React, { useState, useEffect } from "react";
import layersData from "../jsons/layers.json";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { MapPin, Layers, Satellite, Calendar, Upload } from "lucide-react";
import {
  FormSelect,
  SectionHeading,
  PageCard,
  SubmitButton,
} from "./formControls";

const LocationFormComponent = ({ currentUser }) => {
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

  const handleStateChange = (selectedValue) => {
    if (!selectedValue) {
      setState({ id: "", name: "" });
      return;
    }

    const [state_id, state_name] = selectedValue.split("_");
    setState({ id: state_id, name: state_name });
    setDistrict({ id: "", name: "" });
    setBlock({ id: "", name: "" });
    setDistrictsList([]);
    setBlocksList([]);
    fetchDistricts(state_id);
  };

  const handleDistrictChange = (selectedValue) => {
    if (!selectedValue) {
      setDistrict({ id: "", name: "" });
      return;
    }

    const [id, district_name] = selectedValue.split("_");
    setDistrict({ id: id, name: district_name });
    setBlock({ id: "", name: "" });
    setBlocksList([]);
    fetchBlocks(id);
  };

  const handleBlockChange = (selectedValue) => {
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
        setGeeAccounts(data);
      } catch (error) {
        console.error("Error fetching GEE accounts:", error);
      }
    };

    fetchGEEAccounts();
  }, []);

  const handleGenerateLayer = async (e) => {
    e.preventDefault();
    setError(null);
    if (!state.name) {
      toast.error("Please select a state.");
      return;
    }
    if (!district.name) {
      toast.error("Please select a district.");
      return;
    }
    if (!block.name) {
      toast.error("Please select a block.");
      return;
    }

    if (!selectedGEEAccount) {
      toast.error("Please select GEE account.");
      return;
    }
    const selectedLayer = layersData.layers_json[layerName];
    const apiUrlSuffix = selectedLayer.api_url.split("/").slice(-2).join("/");

    const token = sessionStorage.getItem("accessToken");

    const apiUrl = `${process.env.REACT_APP_BASEURL}api/v1/${apiUrlSuffix}`;

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

      await response.json();
      toast.success("Layer generation initiated successfully!");
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

  const isFixedLulc =
    layerName === "LULC Farm Boundaries" || layerName === "LULC V4";

  const stateOptions = statesList.map((s) => ({
    value: `${s.id}_${s.state_name}`,
    label: s.state_name,
  }));

  const districtOptions = districtsList.map((d) => ({
    value: `${d.id}_${d.district_name}`,
    label: d.district_name,
  }));

  const blockOptions = blocksList.map((b) => ({
    value: `${b.id}_${b.block_name}`,
    label: b.block_name,
  }));

  const yearOptions = years.map((year) => ({
    value: String(year),
    label: String(year),
  }));

  const geeAccountOptions = Object.entries(geeAccounts || {}).flatMap(
    ([email, accounts]) =>
      (Array.isArray(accounts) ? accounts : []).map((acc) => ({
        value: String(acc.id),
        label: acc.name,
        group: email,
      }))
  );

  return (
    <PageCard
      icon={Layers}
      title={layerName || "Generate Layer"}
      subtitle="Select a location and GEE account to generate this layer."
    >
      <form className="space-y-8 px-8 py-6" onSubmit={handleGenerateLayer}>
        <section>
          <SectionHeading>Location</SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormSelect
              label="State"
              icon={MapPin}
              options={stateOptions}
              value={state.id && state.name ? `${state.id}_${state.name}` : ""}
              onChange={handleStateChange}
              placeholder="Select state"
            />
            <FormSelect
              label="District"
              icon={MapPin}
              options={districtOptions}
              value={
                district.id && district.name
                  ? `${district.id}_${district.name}`
                  : ""
              }
              onChange={handleDistrictChange}
              placeholder={
                districtsLoading ? "Loading districts..." : "Select district"
              }
              disabled={!state.id || districtsLoading}
            />
            <FormSelect
              label="Block"
              icon={MapPin}
              options={blockOptions}
              value={block.id && block.name ? `${block.id}_${block.name}` : ""}
              onChange={handleBlockChange}
              placeholder={blocksLoading ? "Loading blocks..." : "Select block"}
              disabled={!district.id || blocksLoading}
              emptyMessage="No blocks available"
            />
          </div>
        </section>

        <section>
          <SectionHeading>Layer Configuration</SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormSelect
              label="GEE Account"
              icon={Satellite}
              options={geeAccountOptions}
              value={selectedGEEAccount}
              onChange={setSelectedGEEAccount}
              placeholder="Select GEE account"
            />

            {layerName === "FES CLART" && (
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Upload className="h-4 w-4 text-gray-400" />
                  Upload File
                </label>
                <input
                  type="file"
                  accept=".zip,.geojson,.kml,.tiff"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm file:mr-3 file:border-0 file:bg-blue-50 file:px-3.5 file:py-2.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            )}
          </div>

          {showDates && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormSelect
                label="Start Year"
                icon={Calendar}
                options={yearOptions}
                value={isFixedLulc ? "2023" : String(startYear || dateRange[0])}
                onChange={setStartYear}
                placeholder="Select start year"
                disabled={layerName === "LULC Farm Boundaries"}
              />
              <FormSelect
                label="End Year"
                icon={Calendar}
                options={yearOptions}
                value={isFixedLulc ? "2024" : String(endYear || dateRange[1])}
                onChange={setEndYear}
                placeholder="Select end year"
                disabled={layerName === "LULC Farm Boundaries"}
              />
            </div>
          )}
        </section>

        <div className="flex justify-end border-t border-gray-100 pt-6">
          <SubmitButton loading={isLoading} loadingText="Generating...">
            Generate Layer
          </SubmitButton>
        </div>
      </form>
    </PageCard>
  );
};

export default LocationFormComponent;
