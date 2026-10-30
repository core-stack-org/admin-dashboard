import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MapPin, Layers, Satellite, Cpu, Calendar } from "lucide-react";
import {
  FormSelect,
  FormInput,
  SectionHeading,
  PageCard,
  SubmitButton,
} from "./formControls";

const LOCAL_API_BASE_URL = "https://www.cse.iitd.ernet.in/act4dws6/";
const LOCAL_AUTH_URL =
  "https://www.cse.iitd.ernet.in/act4dws6/api/v1/auth/login/";

const COMPUTE_OPTIONS = [
  { value: "gee", label: "Google Earth Engine (GEE)" },
  { value: "local", label: "Local" },
];

const GEE_MAP_TYPES = [
  {
    value: "map_1",
    label: "Map 1: Tehsil level admin boundaries and MWS layer",
    description: "Covers Admin boundaries and MWS",
  },
  {
    value: "map_2",
    label: "Map 2: Hydrology layer (Fortnight and Annual)",
    description: "Covers hydrology (Fortnight and Annual) Layer",
  },
  {
    value: "map_3",
    label: "Map 3: NDVI, Drought, Stream Order, CLART and Site Suitability",
    description:
      "Covers NDVI Timeseries, Drought Causality, Stream Order, CLART and Site Suitability Layers",
  },
];

const LOCAL_MAP_TYPES = [
  {
    value: "dynamic_layers",
    label: "Dynamic Layers",
    description:
      "Layers that are periodically recomputed (ex: NREGA, LULC, Change Detection etc).",
  },
  {
    value: "static_layers",
    label: "Static Layers",
    description:
      "Layers that do not change over time (ex: Aquifer, Livestocks, Canal etc).",
  },
  {
    value: "gee_layers",
    label: "GEE Layers",
    description:
      "Layers computed on Google Earth Engine using the selected GEE account.",
  },
];

const MAP_TYPES_BY_COMPUTE = {
  gee: GEE_MAP_TYPES,
  local: LOCAL_MAP_TYPES,
};

const getLocalAccessToken = async (username, password) => {
  const response = await fetch(LOCAL_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Local authentication failed",
    );
  }

  return data.access;
};

const LayerMapJsonComponent = ({ currentUser }) => {
  const [state, setState] = useState({ id: "", name: "" });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [compute, setCompute] = useState("");
  const [mapType, setMapType] = useState("");
  const [geeAccounts, setGeeAccounts] = useState([]);
  const [selectedGEEAccount, setSelectedGEEAccount] = useState("");
  const [manualGeeId, setManualGeeId] = useState(false);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [loading, setLoading] = useState(false);

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
        },
      );
      const data = await response.json();
      const sortedStates = data.states.sort((a, b) =>
        a.state_name.localeCompare(b.state_name),
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
        },
      );
      const data = await response.json();
      const sortedDistricts = data.districts.sort((a, b) =>
        a.district_name.localeCompare(b.district_name),
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
        },
      );
      const data = await response.json();
      const sortedBlocks = data.blocks.sort((a, b) =>
        a.block_name.localeCompare(b.block_name),
      );
      setBlocksList(sortedBlocks);
    } catch (error) {
      console.error("Error fetching blocks:", error);
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

    const [district_census_code, district_name] = selectedValue.split("_");
    setDistrict({ id: district_census_code, name: district_name });
    setBlock({ id: "", name: "" });
    setBlocksList([]);
    fetchBlocks(district_census_code);
  };

  const handleBlockChange = (selectedValue) => {
    if (!selectedValue) {
      setBlock({ id: "", name: "" });
      return;
    }

    const [block_census_code, block_name] = selectedValue.split("_");
    setBlock({ id: block_census_code, name: block_name });
  };

  const handleComputeChange = (selectedValue) => {
    setCompute(selectedValue);
    setMapType("");
    setSelectedGEEAccount("");
  };

  useEffect(() => {
    if (!compute) return;
    const fetchGEEAccounts = async () => {
      setGeeAccounts([]);
      try {
        let baseUrl = process.env.REACT_APP_BASEURL;
        let token = sessionStorage.getItem("accessToken");
        if (compute === "local") {
          baseUrl = LOCAL_API_BASE_URL;
          token = await getLocalAccessToken(
            currentUser?.loginCredentials?.username,
            currentUser?.loginCredentials?.password,
          );
        }
        const response = await fetch(`${baseUrl}api/v1/geeaccounts/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "420",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setGeeAccounts(data);
      } catch (error) {
        console.error("Error fetching GEE accounts:", error);
        toast.error("Failed to load GEE accounts.");
      }
    };

    fetchGEEAccounts();
  }, [compute, currentUser]);

  const yearFieldsRequired =
    Boolean(mapType) && !(compute === "gee" && mapType === "map_1");

  useEffect(() => {
    if (yearFieldsRequired) {
      setStartYear(2017);
      setEndYear(2024);
    } else {
      setStartYear("");
      setEndYear("");
    }
  }, [yearFieldsRequired]);

  const geeAccountRequired = compute === "local" && mapType === "gee_layers";
  const showGeeAccount = compute === "gee" || geeAccountRequired;

  const isFormValid = Boolean(
    state.name &&
    district.name &&
    block.name &&
    compute &&
    mapType &&
    (!geeAccountRequired || selectedGEEAccount),
  );

  const handleGenerateJsonMapLayer = async () => {
    if (!state.name || !district.name || !block.name) {
      toast.error(
        "Please select a state, district, and block to generate the layer.",
      );
      return;
    }
    if (!compute) {
      toast.error("Please select a compute option to generate the layer.");
      return;
    }
    if (!mapType) {
      toast.error("Please select a map type to generate the layer.");
      return;
    }
    if (geeAccountRequired && !selectedGEEAccount) {
      toast.error("Please select a GEE account to generate GEE layers.");
      return;
    }

    const token = sessionStorage.getItem("accessToken");
    const username = currentUser?.loginCredentials?.username;
    const password = currentUser?.loginCredentials?.password;

    let localToken = null;

    if (compute === "local") {
      localToken = await getLocalAccessToken(username, password);
    }

    const payload = {
      state: state.name,
      district: district.name,
      block: block.name,
      map: mapType,
      ...(compute === "local" && { compute }),
      ...(showGeeAccount && { gee_account_id: selectedGEEAccount }),
      ...(yearFieldsRequired && { start_year: startYear, end_year: endYear }),
    };

    const endpoint =
      compute === "local"
        ? `${LOCAL_API_BASE_URL}api/v1/generate_layer_in_order/`
        : `${process.env.REACT_APP_BASEURL}api/v1/generate_layer_in_order/`;

    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${compute === "local" ? localToken : token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to generate layers");

      await response.json();
      toast.success("Layer generation started successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong while generating the layers.");
    } finally {
      setLoading(false);
    }
  };

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

  const geeAccountOptions = (
    Array.isArray(geeAccounts)
      ? [["", geeAccounts]]
      : Object.entries(geeAccounts)
  ).flatMap(([email, accounts]) =>
    (Array.isArray(accounts) ? accounts : []).map((acc) => ({
      value: String(acc.id),
      label: acc.name,
      group: email,
    })),
  );

  const availableMapTypes = MAP_TYPES_BY_COMPUTE[compute] || [];

  const mapTypeOptions = availableMapTypes.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  const selectedMapDescription = availableMapTypes.find(
    (m) => m.value === mapType,
  )?.description;

  return (
    <PageCard
      icon={Layers}
      title="Generate Layer from JSON Map"
      subtitle="Select a location and map configuration to generate layers."
    >
      <form
        className="space-y-8 px-8 py-6"
        onSubmit={(e) => e.preventDefault()}
      >
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
              placeholder="Select district"
              disabled={!state.id}
            />

            <FormSelect
              label="Block"
              icon={MapPin}
              options={blockOptions}
              value={block.id && block.name ? `${block.id}_${block.name}` : ""}
              onChange={handleBlockChange}
              placeholder="Select block"
              disabled={!district.id}
              emptyMessage="No blocks available"
            />
          </div>
        </section>

        <section>
          <SectionHeading>Map Configuration</SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormSelect
              label="Compute"
              icon={Cpu}
              options={COMPUTE_OPTIONS}
              value={compute}
              onChange={handleComputeChange}
              placeholder="Select compute"
            />

            <FormSelect
              label="Map Type"
              icon={Layers}
              options={mapTypeOptions}
              value={mapType}
              onChange={setMapType}
              placeholder="Select map type"
              disabled={!compute}
            />

            {showGeeAccount && (
              <div>
                {manualGeeId ? (
                  <FormInput
                    label="GEE Account ID"
                    icon={Satellite}
                    type="number"
                    min="1"
                    value={selectedGEEAccount}
                    onChange={(e) => setSelectedGEEAccount(e.target.value)}
                    placeholder="Enter GEE account ID"
                  />
                ) : (
                  <FormSelect
                    label="GEE Account"
                    icon={Satellite}
                    options={geeAccountOptions}
                    value={selectedGEEAccount}
                    onChange={setSelectedGEEAccount}
                    placeholder="Select GEE account"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setManualGeeId(!manualGeeId);
                    setSelectedGEEAccount("");
                  }}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  {manualGeeId ? "Select from list" : "Enter ID manually"}
                </button>
              </div>
            )}
          </div>
          {selectedMapDescription && (
            <p className="mt-2 text-xs text-gray-500">
              {selectedMapDescription}
            </p>
          )}

          {yearFieldsRequired && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormInput
                label="Start Year"
                icon={Calendar}
                type="number"
                min="2000"
                max="2100"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="Enter start year"
              />
              <FormInput
                label="End Year"
                icon={Calendar}
                type="number"
                min="2000"
                max="2100"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="Enter end year"
              />
            </div>
          )}
        </section>

        <div className="flex justify-end border-t border-gray-100 pt-6">
          <SubmitButton
            loading={loading}
            loadingText="Generating..."
            disabled={!isFormValid}
            onClick={handleGenerateJsonMapLayer}
          >
            Generate Layer
          </SubmitButton>
        </div>
      </form>
    </PageCard>
  );
};

export default LayerMapJsonComponent;
