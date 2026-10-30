import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MapPin, FileSpreadsheet } from "lucide-react";
import {
  FormSelect,
  SectionHeading,
  PageCard,
  SubmitButton,
} from "./formControls";


const GenerateExcelComponent = () => {
  const [state, setState] = useState({ id: "", name: "" });
  const [district, setDistrict] = useState({ id: "", name: "" });
  const [block, setBlock] = useState({ id: "", name: "" });
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
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
      const activeStates = data.states
        .filter((s) => s.active_status === true)
        .sort((a, b) => a.state_name.localeCompare(b.state_name));
      setStatesList(activeStates);
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
      const activeDistricts = data.districts
        .filter((d) => d.active_status === true)
        .sort((a, b) => a.district_name.localeCompare(b.district_name));

      setDistrictsList(activeDistricts);
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
      const activeBlocks = data.blocks
        .filter((s) => s.active_status === true)
        .sort((a, b) => a.block_name.localeCompare(b.block_name));

      setBlocksList(activeBlocks);
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

  const handleGenerateExcel = async () => {
    if (!state.name || !district.name || !block.name) {
      toast.error("Please select a state, district, and block to generate Excel.");
      return;
    }
    setLoading(true);
    try {
      const url = new URL(
        `${process.env.REACT_APP_BASEURL}/api/v1/generate_stats_excel_file/`
      );

      url.searchParams.append("state", state.name);
      url.searchParams.append("district", district.name);
      url.searchParams.append("block", block.name);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download Excel file");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${block.name}_data.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Excel downloaded.");
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Something went wrong while generating the Excel file.");
    }
    finally {
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

  const isFormValid = Boolean(state.name && district.name && block.name);

  return (
    <PageCard
      icon={FileSpreadsheet}
      title="Generate Excel for Block"
      subtitle="Download block-level stats as an Excel file."
    >
      <form
        className="space-y-8 px-8 py-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerateExcel();
        }}
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
          {loading && (
            <p className="mt-4 text-sm text-gray-500">
              Generating the Excel file. This can take a minute for large
              blocks.
            </p>
          )}
        </section>

        <div className="flex justify-end border-t border-gray-100 pt-6">
          <SubmitButton
            loading={loading}
            loadingText="Generating Excel..."
            disabled={!isFormValid}
          >
            Download Excel
          </SubmitButton>
        </div>
      </form>
    </PageCard>
  );
};

export default GenerateExcelComponent;
