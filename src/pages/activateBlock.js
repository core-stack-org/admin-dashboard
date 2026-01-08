import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // FETCH STATES
  const fetchStates = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await res.json();
      const sorted = (data.states || []).sort((a, b) =>
        a.state_name.localeCompare(b.state_name)
      );
      setStatesList(sorted);
    } catch {
      toast.error("Failed to load states.");
    }
  };

  // FETCH DISTRICTS
  const fetchDistricts = async (stateId) => {
    if (!stateId) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${stateId}/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await res.json();
      const sorted = (data.districts || []).sort((a, b) =>
        a.district_name.localeCompare(b.district_name)
      );
      setDistrictsList(sorted);
    } catch {
      toast.error("Failed to load districts.");
    }
  };

  // FETCH BLOCKS
  const fetchBlocks = async (districtId) => {
    if (!districtId) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${districtId}/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );
      const data = await res.json();
      const sorted = (data.blocks || []).sort((a, b) =>
        a.block_name.localeCompare(b.block_name)
      );
      setBlocksList(sorted);
    } catch {
      toast.error("Failed to load blocks.");
    }
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
        `${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} ${
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

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-8 mt-24">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-center">
        Activate/Deactivate Location
      </h2>

      {/* LOCATION TYPE */}
      <div className="mb-4">
        <label className="font-semibold">Location Type:</label>
        <select
          className="w-full p-3 border rounded mt-2"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value)}
        >
          <option value="">Select Location Type</option>
          <option value="State">State</option>
          <option value="District">District</option>
          <option value="Block">Block</option>
        </select>
      </div>

      {/* STATE DROPDOWN */}
      {(locationType === "State" ||
        locationType === "District" ||
        locationType === "Block") && (
        <div className="mb-4">
          <label className="font-semibold">Select State:</label>
          <select
            className="w-full p-3 border rounded mt-2"
            value={selectedState?.id || ""}
            onChange={handleStateChange}
          >
            <option value="">Select State</option>
            {statesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.state_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* DISTRICT DROPDOWN */}
      {locationType !== "State" && selectedState && (
        <div className="mb-4">
          <label className="font-semibold">Select District:</label>
          <select
            className="w-full p-3 border rounded mt-2"
            disabled={!selectedState.active_status}
            value={selectedDistrict?.id || ""}
            onChange={handleDistrictChange}
          >
            {!selectedState.active_status ? (
              <option>Please activate state first</option>
            ) : (
              <>
                <option value="">Select District</option>
                {districtsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.district_name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )}

      {/* BLOCK DROPDOWN */}
      {locationType === "Block" && selectedDistrict && (
        <div className="mb-4">
          <label className="font-semibold">Select Block:</label>
          <select
            className="w-full p-3 border rounded mt-2"
            disabled={!selectedDistrict.active_status}
            value={selectedBlock?.id || ""}
            onChange={handleBlockChange}
          >
            {!selectedDistrict.active_status ? (
              <option>Please activate district first</option>
            ) : (
              <>
                <option value="">Select Block</option>
                {blocksList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.block_name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => updateStatus(true)}
          disabled={
            selectedLocation.active_status === true ||
            selectedLocation.active_status === null
          }
          className={`px-6 py-2 rounded text-white ${
            selectedLocation.active_status === false
              ? "bg-green-600 hover:bg-green-700"
              : "bg-green-300 cursor-not-allowed"
          }`}
        >
          Activate
        </button>

        <button
          onClick={() => updateStatus(false)}
          disabled={
            selectedLocation.active_status === false ||
            selectedLocation.active_status === null
          }
          className={`px-6 py-2 rounded text-white ${
            selectedLocation.active_status === true
              ? "bg-red-600 hover:bg-red-700"
              : "bg-red-300 cursor-not-allowed"
          }`}
        >
          Deactivate
        </button>
      </div>
    </div>
  );
};

export default ActivateBlock;
