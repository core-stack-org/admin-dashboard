import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LayerStatusComponent = () => {
  const navigate = useNavigate();

  const [state, setState] = useState({ id: "", name: "" });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`
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
        `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${selectedState}/`
      );
      const data = await response.json();
      const sorted = data.districts.sort((a, b) =>
        a.district_name.localeCompare(b.district_name)
      );
      setDistrictsList(sorted);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchBlocks = async (selectedDistrict) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${selectedDistrict}/`
      );
      const data = await response.json();
      const sorted = data.blocks.sort((a, b) =>
        a.block_name.localeCompare(b.block_name)
      );
      setBlocksList(sorted);
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  const handleStateChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) return setState({ id: "", name: "" });
    const [id, name] = selectedValue.split("_");
    setState({ id, name });
    setDistrictsList([]);
    setBlocksList([]);
    fetchDistricts(id);
  };

  const handleDistrictChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) return setDistrict({ id: "", name: "" });
    const [id, name] = selectedValue.split("_");
    setDistrict({ id, name });
    setBlocksList([]);
    fetchBlocks(id);
  };

  const handleBlockChange = (event) => {
    const selectedValue = event.target.value;
    if (!selectedValue) return setBlock({ id: "", name: "" });
    const [id, name] = selectedValue.split("_");
    setBlock({ id, name });
  };

  const handleNavigate = () => {
    if (!state.name || !district.name || !block.name) {
      alert("Please select state, district, and block.");
      return;
    }

    navigate("/layer-status-details", {
      state: {
        stateName: state.name,
        districtName: district.name,
        blockName: block.name,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-lg mt-12">
      <h1 className="text-2xl font-bold text-center mb-6">Layer Status</h1>

      <form className="space-y-8">
        <div>
          <label className="text-lg font-semibold mb-2 block">State:</label>
          <select
            value={state.id && state.name ? `${state.id}_${state.name}` : ""}
            onChange={handleStateChange}
            className="w-full px-4 py-3 border text-lg rounded-lg"
          >
            <option value="">Select State</option>
            {statesList.map((s) => (
              <option
                key={s.state_census_code}
                value={`${s.state_census_code}_${s.state_name}`}
              >
                {s.state_name}
              </option>
            ))}
          </select>
        </div>

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
            {districtsList.map((d) => (
              <option
                key={`${d.id}_${d.district_name}`}
                value={`${d.id}_${d.district_name}`}
              >
                {d.district_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-lg font-semibold mb-2 block">Block:</label>
          <select
            value={block.id && block.name ? `${block.id}_${block.name}` : ""}
            onChange={handleBlockChange}
            className="w-full px-4 py-3 border text-lg rounded-lg"
          >
            <option value="">Select Block</option>
            {blocksList.length > 0 ? (
              blocksList.map((b) => (
                <option
                  key={`${b.id}_${b.block_name}`}
                  value={`${b.id}_${b.block_name}`}
                >
                  {b.block_name}
                </option>
              ))
            ) : (
              <option value="">No blocks available</option>
            )}
          </select>
        </div>

        <div className="text-center">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={handleNavigate}
          >
            Check Layer Status
          </button>
        </div>
      </form>
    </div>
  );
};

export default LayerStatusComponent;
