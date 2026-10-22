import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Landmark,
  Map,
  MapPin,
  Power,
  PowerOff,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardFooter,
  FormSection,
  SelectField,
  fetchLocationList,
} from "./locationFields";
import SyncGeoserver from "./syncGeoserver";

const LEVEL_LABELS = { state: "State", district: "District", block: "Tehsil" };

const ActivateBlock = () => {
  const [locationType, setLocationType] = useState("");
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);

  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState({
    id: "",
    name: "",
    active_status: null,
  });

  // Helpers
  const getSelectedLevel = () => {
    if (selectedBlock) return "block";
    if (selectedDistrict) return "district";
    if (selectedState) return "state";
    return null;
  };

  const fetchStates = () =>
    fetchLocationList("get_states", "states", "state_name")
      .then(setStatesList)
      .catch(() => toast.error("Failed to load states."));

  const fetchDistricts = (stateId) => {
    if (!stateId) return;
    fetchLocationList(`get_districts/${stateId}`, "districts", "district_name")
      .then(setDistrictsList)
      .catch(() => toast.error("Failed to load districts."));
  };

  const fetchBlocks = (districtId) => {
    if (!districtId) return;
    fetchLocationList(`get_blocks/${districtId}`, "blocks", "block_name")
      .then(setBlocksList)
      .catch(() => toast.error("Failed to load tehsils."));
  };

  // LOCATION TYPE CHANGE
  useEffect(() => {
    // reset selections on changing the top-level target (State/District/Block)
    setSelectedLocation({ id: "", name: "", active_status: null });
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedBlock(null);
    setDistrictsList([]);
    setBlocksList([]);
    if (locationType) fetchStates();
  }, [locationType]);

  // HANDLE STATE CHANGE
  const handleStateChange = (e) => {
    const stateId = e.target.value;
    if (!stateId) {
      setSelectedState(null);
      setSelectedLocation({ id: "", name: "", active_status: null });
      setDistrictsList([]);
      setBlocksList([]);
      return;
    }

    const selected = statesList.find(
      (s) => String(s.id) === String(stateId)
    );
    if (!selected) return;

    const fixedState = {
      id: selected.id,
      name: selected.state_name,
      active_status: selected.active_status === true,
    };

    setSelectedState(fixedState);
    setSelectedLocation(fixedState);

    setSelectedDistrict(null);
    setSelectedBlock(null);
    setBlocksList([]);

    // Only fetch districts if the state is active
    if (fixedState.active_status) {
      fetchDistricts(fixedState.id);
    } else {
      setDistrictsList([]); // ensure empty until activation
    }
  };

  // HANDLE DISTRICT CHANGE
  const handleDistrictChange = (e) => {
    const distId = e.target.value;
    if (!distId) {
      setSelectedDistrict(null);
      // fallback selectedLocation should represent the most-specific selection
      setSelectedLocation(
        selectedState || { id: "", name: "", active_status: null }
      );
      setBlocksList([]);
      return;
    }

    const selected = districtsList.find((d) => String(d.id) === String(distId));
    if (!selected) return;

    const fixedDistrict = {
      id: selected.id,
      name: selected.district_name,
      active_status: selected.active_status === true,
    };

    setSelectedDistrict(fixedDistrict);
    setSelectedLocation(fixedDistrict);

    setSelectedBlock(null);
    fetchBlocks(fixedDistrict.id);
  };

  // HANDLE BLOCK CHANGE
  const handleBlockChange = (e) => {
    const blockId = e.target.value;
    if (!blockId) {
      setSelectedBlock(null);
      setSelectedLocation(
        selectedDistrict ||
          selectedState || { id: "", name: "", active_status: null }
      );
      return;
    }

    const selected = blocksList.find((b) => String(b.id) === String(blockId));
    if (!selected) return;

    const fixedBlock = {
      id: selected.id,
      name: selected.block_name,
      active_status: selected.active_status === true,
    };

    setSelectedBlock(fixedBlock);
    setSelectedLocation(fixedBlock);
  };

  // ACTIVATE / DEACTIVATE
  const updateStatus = async (active) => {
    const selectedLevel = getSelectedLevel();
    if (!selectedLevel) return toast.error("Please select a location first.");

    const locId = selectedLocation.id;
    if (!locId) return toast.error("Please select a location first.");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/activate_location/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location_type: selectedLevel,
            location_id: locId,
            active,
          }),
        }
      );

      if (!res.ok) {
        let msg = "Failed to update status.";
        try {
          const err = await res.json();
          if (err?.detail) msg = err.detail;
        } catch (e) {}
        return toast.error(msg);
      }

      toast.success(
        `${LEVEL_LABELS[selectedLevel]} ${
          active ? "activated" : "deactivated"
        } successfully!`
      );

      setSelectedLocation((prev) => ({ ...prev, active_status: active }));

      if (selectedLevel === "state") {
        setSelectedState((prev) => ({
          ...(prev || {}),
          active_status: active,
        }));
      } else if (selectedLevel === "district") {
        setSelectedDistrict((prev) => ({
          ...(prev || {}),
          active_status: active,
        }));
      } else if (selectedLevel === "block") {
        setSelectedBlock((prev) => ({
          ...(prev || {}),
          active_status: active,
        }));
      }

      // activated a state, load districts immediately for that state id
      if (selectedLevel === "state" && active) {
        fetchDistricts(locId);
      }

      // deactivated a state, clear district/block lists
      if (selectedLevel === "state" && !active) {
        setDistrictsList([]);
        setBlocksList([]);
        setSelectedDistrict(null);
        setSelectedBlock(null);
      }

      //  deactivated a district, clear blocks
      if (selectedLevel === "district" && !active) {
        setBlocksList([]);
        setSelectedBlock(null);
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const levels = [
    { value: "State", label: "State", icon: Map },
    { value: "District", label: "District", icon: Landmark },
    { value: "Block", label: "Tehsil", icon: MapPin },
  ];

  const isActive = selectedLocation.active_status === true;
  const hasSelection = selectedLocation.active_status !== null;
  const selectedLevel = getSelectedLevel();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <ToastContainer />
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Location Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Activate a location, then publish its layers to GeoServer.
          </p>
        </div>

        <Card
          step={1}
          accent="blue"
          icon={Power}
          title="Activate / Deactivate Location"
          subtitle="Control which states, districts and tehsils are live"
        >
          <CardBody>
            <FormSection title="Level">
              <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
                {levels.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLocationType(value)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      locationType === value
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </FormSection>

            {locationType && (
              <FormSection title="Location">
                <SelectField
                  label="State"
                  value={selectedState?.id || ""}
                  onChange={handleStateChange}
                  placeholder="Select a state"
                >
                  {statesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.state_name}
                    </option>
                  ))}
                </SelectField>

                {locationType !== "State" && selectedState && (
                  <SelectField
                    label="District"
                    value={selectedDistrict?.id || ""}
                    onChange={handleDistrictChange}
                    placeholder="Select a district"
                    disabledHint={
                      !selectedState.active_status &&
                      `Activate ${selectedState.name} first to manage its districts.`
                    }
                  >
                    {districtsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.district_name}
                      </option>
                    ))}
                  </SelectField>
                )}

                {locationType === "Block" && selectedDistrict && (
                  <SelectField
                    label="Tehsil"
                    value={selectedBlock?.id || ""}
                    onChange={handleBlockChange}
                    placeholder="Select a tehsil"
                    disabledHint={
                      !selectedDistrict.active_status &&
                      `Activate ${selectedDistrict.name} first to manage its tehsils.`
                    }
                  >
                    {blocksList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.block_name}
                      </option>
                    ))}
                  </SelectField>
                )}
              </FormSection>
            )}
          </CardBody>

          <CardFooter>
            {hasSelection ? (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {LEVEL_LABELS[selectedLevel]}
                  </p>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {selectedLocation.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateStatus(!isActive)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors ${
                    isActive
                      ? "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {isActive ? <PowerOff size={16} /> : <Power size={16} />}
                  {isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-2">
                Pick a level and location to see its status.
              </p>
            )}
          </CardFooter>
        </Card>

        <SyncGeoserver
          prefillState={selectedState}
          prefillDistrict={selectedDistrict}
          prefillBlock={selectedBlock}
        />
      </div>
    </div>
  );
};

export default ActivateBlock;
