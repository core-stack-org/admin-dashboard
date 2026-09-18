import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import {
  MapPin,
  Layers,
  Satellite,
  Cpu,
  Calendar,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";

const LOCAL_API_BASE_URL = "https://www.cse.iitd.ernet.in/act4dws6/";
const LOCAL_AUTH_URL = "https://www.cse.iitd.ernet.in/act4dws6/api/v1/auth/login/";

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
    description: "Layers that are periodically recomputed (ex: NREGA, LULC, Change Detection etc).",
  },
  {
    value: "static_layers",
    label: "Static Layers",
    description: "Layers that do not change over time (ex: Aquifer, Livestocks, Canal etc).",
  },
];

const MAP_TYPES_BY_COMPUTE = {
  gee: GEE_MAP_TYPES,
  local: LOCAL_MAP_TYPES,
};

const FormSelect = ({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  emptyMessage = "No results found",
}) => {
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value) || null;

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.label.toLowerCase().includes(query.toLowerCase())
        );

  const groups = [];
  const groupIndex = new Map();
  filteredOptions.forEach((option) => {
    const key = option.group || "";
    if (!groupIndex.has(key)) {
      groupIndex.set(key, []);
      groups.push([key, groupIndex.get(key)]);
    }
    groupIndex.get(key).push(option);
  });

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        {label}
      </label>
      <Combobox
        value={selected}
        onChange={(option) => onChange(option ? option.value : "")}
        onClose={() => setQuery("")}
        disabled={disabled}
        by="value"
      >
        <div className="relative">
          <div className="group relative flex items-center rounded-lg border border-gray-300 bg-white shadow-sm transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/40 hover:border-gray-400 has-[:disabled]:cursor-not-allowed has-[:disabled]:border-gray-200 has-[:disabled]:bg-gray-50 has-[:disabled]:hover:border-gray-200">
            <ComboboxInput
              className="w-full rounded-lg bg-transparent py-2.5 pl-3.5 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-400"
              displayValue={(option) => option?.label ?? ""}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-4 w-4 text-gray-400 group-has-[:disabled]:text-gray-300" />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            transition
            className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-lg border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black/5 transition duration-100 ease-in focus:outline-none data-[closed]:data-[leave]:opacity-0"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-2 text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              groups.map(([group, groupOptions]) => (
                <div key={group || "__ungrouped"}>
                  {group && (
                    <div className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {group}
                    </div>
                  )}
                  {groupOptions.map((option) => (
                    <ComboboxOption
                      key={option.value}
                      value={option}
                      className="group/option relative cursor-pointer select-none py-2 pl-9 pr-3.5 text-sm text-gray-900 data-[focus]:bg-blue-50 data-[focus]:text-blue-900"
                    >
                      <span className="block truncate group-data-[selected]/option:font-semibold">
                        {option.label}
                      </span>
                      <span className="absolute inset-y-0 left-3 hidden items-center text-blue-600 group-data-[selected]/option:flex">
                        <Check className="h-4 w-4" />
                      </span>
                    </ComboboxOption>
                  ))}
                </div>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
};

const FormInput = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
      {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      {label}
    </label>
    <input
      className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      {...props}
    />
  </div>
);

const SectionHeading = ({ children }) => (
  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
    {children}
  </h2>
);

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

  const yearFieldsRequired = Boolean(mapType) && !(compute === "gee" && mapType === "map_1");

  useEffect(() => {
    if (yearFieldsRequired) {
      setStartYear(2017);
      setEndYear(2024);
    } else {
      setStartYear("");
      setEndYear("");
    }
  }, [yearFieldsRequired]);

  const isFormValid = Boolean(
    state.name && district.name && block.name && compute && mapType
  );

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

  if (!response.ok) {
    throw new Error("Local authentication failed");
  }

  const data = await response.json();

  return data.access;
};
  const handleGenerateJsonMapLayer = async () => {
    if (!state.name || !district.name || !block.name) {
      toast.error("Please select a state, district, and block to generate the layer.");
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
      gee_account_id: selectedGEEAccount,
      ...(compute === "local" && { compute }),
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

  const geeAccountOptions = Object.entries(geeAccounts).flatMap(
    ([email, accounts]) =>
      accounts.map((acc) => ({
        value: String(acc.id),
        label: acc.name,
        group: email,
      }))
  );

  const availableMapTypes = MAP_TYPES_BY_COMPUTE[compute] || [];

  const mapTypeOptions = availableMapTypes.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  const selectedMapDescription = availableMapTypes.find(
    (m) => m.value === mapType
  )?.description;

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-16">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
        <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Layers className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Generate Layer from JSON Map
                </h1>
                <p className="text-sm text-gray-500">
                  Select a location and map configuration to generate layers.
                </p>
              </div>
            </div>
          </div>

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
                  value={
                    state.id && state.name ? `${state.id}_${state.name}` : ""
                  }
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
                  value={
                    block.id && block.name ? `${block.id}_${block.name}` : ""
                  }
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
                  label="GEE Account"
                  icon={Satellite}
                  options={geeAccountOptions}
                  value={selectedGEEAccount}
                  onChange={setSelectedGEEAccount}
                  placeholder="Select GEE account"
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
              <button
                type="submit"
                disabled={loading || !isFormValid}
                onClick={handleGenerateJsonMapLayer}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Generating..." : "Generate Layer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LayerMapJsonComponent;
