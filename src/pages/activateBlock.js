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
  const [selectedLocation, setSelectedLocation] = useState({
    id: "",
    name: "",
    active_status: null,
  });
  const [actualLocationType, setActualLocationType] = useState("State");
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    if (locationType === "State") fetchStates();
    else if (locationType === "District") fetchDistricts();
    else if (locationType === "Block") fetchBlocks();

    // Reset selections on locationType change
    setSelectedLocation({ id: "", name: "", active_status: null });
    setSelectedState(null);
    setSelectedDistrict(null);
  }, [locationType]);

  useEffect(() => {
    // Fetch blocks only when the district is activated
    if (selectedDistrict?.active_status) {
      fetchBlocks(selectedDistrict.id);
    }
  }, [selectedDistrict]); // Re-run when selectedDistrict changes

  const fetchStates = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/v1/get_states/`
      );
      const data = await res.json();
      const sorted = data.states.sort((a, b) =>
        a.state_name.localeCompare(b.state_name)
      );
      setStatesList(sorted);
    } catch {
      toast.error("Failed to load states.");
    }
  };

  const fetchDistricts = async (selectedState) => {
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
      const sortedBlocks = data.blocks.sort((a, b) =>
        a.block_name.localeCompare(b.block_name)
      );
      setBlocksList(sortedBlocks);
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  const handleActivate = async () => {
    if (selectedLocation.active_status !== false) return;

    const locationTypeToUse = selectedBlock
      ? "block"
      : selectedDistrict
      ? "district"
      : "state";

    const requestBody = {
      location_type: locationTypeToUse,
      location_id: selectedLocation.id,
      active: true,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/activate_location/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        toast.success(`${locationTypeToUse} activated successfully!`);
        const updatedLocation = { ...selectedLocation, active_status: true };
        setSelectedLocation(updatedLocation);

        if (locationTypeToUse === "state") {
          setSelectedState(updatedLocation);
          fetchDistricts(updatedLocation.id);
        } else if (locationTypeToUse === "district") {
          setSelectedDistrict(updatedLocation);
          fetchBlocks(updatedLocation.id);
        } else if (locationTypeToUse === "block") {
          setSelectedBlock(updatedLocation);
        }
      } else {
        toast.error("Failed to activate.");
      }
    } catch (error) {
      console.error("Activation error:", error);
      toast.error("Network error.");
    }
  };

  const handleDeactivate = async () => {
    const { id, active_status } = selectedLocation;
    if (active_status !== true) return;

    const locationTypeToUse = selectedBlock
      ? "block"
      : selectedDistrict
      ? "district"
      : "state";

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/activate_location/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location_type: locationTypeToUse,
            location_id: id,
            active: false,
          }),
        }
      );

      if (res.ok) {
        toast.success(`${locationTypeToUse} deactivated successfully!`);
        const updatedLocation = { ...selectedLocation, active_status: false };
        setSelectedLocation(updatedLocation);

        if (locationTypeToUse === "state") {
          setSelectedState(updatedLocation);
        } else if (locationTypeToUse === "district") {
          setSelectedDistrict(updatedLocation);
        } else if (locationTypeToUse === "block") {
          setSelectedBlock(updatedLocation);
        }
      } else {
        toast.error("Failed to deactivate.");
      }
    } catch (err) {
      console.error("Deactivation error:", err);
      toast.error("Network error.");
    }
  };

  const getLocationOptions = () => {
    if (locationType === "State") {
      return statesList.map((s) => ({
        id: s.state_census_code,
        name: s.state_name,
        active_status: s.active_status,
      }));
    } else if (locationType === "District") {
      return districtsList.map((d) => ({
        id: d.id,
        name: d.district_name,
        active_status: d.active_status,
        state_census_code: d.state_census_code,
      }));
    } else if (locationType === "Block") {
      return blocksList.map((b) => ({
        id: b.id,
        name: b.block_name,
        active_status: b.active_status,
        district_id: b.district_id,
      }));
    }
    return [];
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-8 mt-24">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-center">
        Activate/Deactivate Location
      </h2>

      {/* Location Type */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Location Type:</label>
        <select
          className="w-full p-3 border rounded"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value)}
        >
          <option value="">Select Location Type</option>
          <option value="State">State</option>
          <option value="District">District</option>
          <option value="Block">Block</option>
        </select>
      </div>

      {/* Primary Dropdown */}
      {locationType && (
        <div className="mb-6">
          <label className="block font-semibold mb-2">
            Select {locationType}:
          </label>
          <select
            className="w-full p-3 border rounded"
            value={selectedLocation.id}
            onChange={(e) => {
              const selected = getLocationOptions().find(
                (item) => item.id === e.target.value
              );
              setSelectedLocation(
                selected || { id: "", name: "", active_status: null }
              );

              if (locationType === "State") {
                setSelectedState(selected || null);
                setSelectedDistrict(null);
                setActualLocationType("State"); // <-- ADD THIS LINE
              }

              if (locationType === "District") {
                setSelectedDistrict(selected || null);
                setActualLocationType("District"); // <-- Optional fallback
              }
            }}

            // onChange={(e) => {
            //   const selected = getLocationOptions().find(
            //     (item) => item.id === e.target.value
            //   );
            //   setSelectedLocation(
            //     selected || { id: "", name: "", active_status: null }
            //   );

            //   if (locationType === "State") {
            //     setSelectedState(selected || null);
            //     setSelectedDistrict(null);
            //   }

            //   if (locationType === "District") {
            //     setSelectedDistrict(selected || null);
            //   }
            // }}
          >
            <option value="">Select {locationType}</option>
            {getLocationOptions().map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Conditional Dropdowns */}
      {selectedState?.active_status && (
        <div className="mb-6">
          <label className="block font-semibold mb-2">Select District:</label>
          <select
            className="w-full p-3 border rounded"
            value={selectedDistrict?.id || ""}
            onChange={(e) => {
              const selected = districtsList.find(
                (d) => String(d.id) === e.target.value
              );
              setSelectedDistrict(selected || null);

              setSelectedLocation(
                selected || { id: "", name: "", active_status: null }
              );
              setActualLocationType("District"); // <-- ADD THIS LINE
            }}

            // onChange={(e) => {
            //   const selected = districtsList.find(
            //     (d) => String(d.id) === e.target.value
            //   );
            //   setSelectedDistrict(selected || null);
            //   setSelectedLocation(
            //     selected || { id: "", name: "", active_status: null }
            //   );

            //   // if (selected?.id) {
            //   //   fetchBlocks(selected.id); // <-- ADD THIS
            //   // }
            // }}
          >
            <option value="">Select District</option>
            {districtsList
              .filter(
                (d) => d.state_census_code === selectedState.state_census_code
              )
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.district_name}
                </option>
              ))}
          </select>
        </div>
      )}
      {selectedDistrict?.active_status && (
        <div className="mb-6">
          <label className="block font-semibold mb-2">Select Block:</label>
          <select
            className="w-full p-3 border rounded"
            value={selectedBlock?.id || ""}
            onChange={(e) => {
              const selected = blocksList.find(
                (b) => String(b.id) === e.target.value
              );
              setSelectedBlock(selected || null);
              setSelectedLocation(
                selected || { id: "", name: "", active_status: null }
              );
            }}
          >
            <option value="">Select Block</option>
            {blocksList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.block_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          className={`px-6 py-2 rounded text-white ${
            selectedLocation.active_status === false
              ? "bg-green-600 hover:bg-green-700"
              : "bg-green-300 cursor-not-allowed"
          }`}
          disabled={selectedLocation.active_status !== false}
          onClick={handleActivate}
        >
          Activate
        </button>

        <button
          className={`px-6 py-2 rounded text-white ${
            selectedLocation.active_status === true
              ? "bg-red-600 hover:bg-red-700"
              : "bg-red-300 cursor-not-allowed"
          }`}
          disabled={selectedLocation.active_status !== true}
          onClick={handleDeactivate}
        >
          Deactivate
        </button>
      </div>
    </div>
  );
};

export default ActivateBlock;
