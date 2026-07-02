import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil,Edit, } from "lucide-react";
import {
  getPlans,
  getStates,
  getDistricts,
  getBlocks,
  getGPsTehsilWise,
  mapPlanToGP,
  exportYuktdharaData,
  getGPByCode,
  getGPMapped,
  getDistrictOrg,
  getTehsilOrg,
} from "./base_function";


const PlansPage = () => {
  const { organizationId } = useParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statesMap, setStatesMap] = useState({});
  const [districtsMap, setDistrictsMap] = useState({});
  const [blocksMap, setBlocksMap] = useState({});
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [gpOptions, setGpOptions] = useState([]);
  const [selectedGP, setSelectedGP] = useState("");
  const [showGPModal, setShowGPModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [gpMap, setGpMap] = useState({});
  const [gpExportOptions, setGpExportOptions] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [tehsilOptions, setTehsilOptions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTehsil, setSelectedTehsil] = useState("");
  const [selectedExportGP, setSelectedExportGP] = useState("");

  const handleExportDropdown = async () => {
    try {
      const response = await getDistrictOrg(
        organizationId
      );

      setDistrictOptions(response.data || []);

      setShowExportModal(true);
    } catch (err) {
      console.error(err);

      toast.error("Failed to load districts");
    }
  };

  const handleDistrictChange = async (districtId) => {
    try {
      setSelectedDistrict(districtId);

      setSelectedTehsil("");

      setSelectedExportGP("");

      setGpExportOptions([]);

      const response = await getTehsilOrg(
        organizationId,
        districtId
      );

      setTehsilOptions(response.data || []);
    } catch (err) {
      console.error(err);

      toast.error("Failed to load tehsils");
    }
  };

  const handleTehsilChange = async (tehsilId) => {
    try {
      setSelectedTehsil(tehsilId);

      setSelectedExportGP("");

      const gpData = await getGPMapped(
        organizationId,
        tehsilId
      );

      setGpExportOptions(gpData || []);
    } catch (err) {
      console.error(err);

      toast.error("Failed to load GP list");
    }
  };

  const handleGPExport = async (gpCode) => {
    const selectedGPData = gpExportOptions.find(
      (gp) => gp.gp === Number(gpCode)
    );

    await handleExport(selectedGPData);

    setShowExportModal(false);

    setSelectedDistrict("");

    setSelectedTehsil("");

    setSelectedExportGP("");

    setDistrictOptions([]);

    setTehsilOptions([]);

    setGpExportOptions([]);
  };

  const handleExport = async (gp) => {
    try {
      toast.info("Preparing download...");

      const blob = await exportYuktdharaData(gp.gp);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `Yuktdhara_${gp.gp__gram_panchayat_name}.zip`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Download Available");
    } catch (err) {
      console.error(err);

      toast.error("Export failed");
    }
  };

  const handleMapGPClick = async (plan) => {
    try {
      setSelectedPlan(plan);

      const data = await getGPsTehsilWise(plan.id);

      setGpOptions(data.data || []);

      setShowGPModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Gram Panchayats");
    }
  };

  const handleSaveGP = async () => {
    try {
      const payload = {
        plan_id: selectedPlan.id,
        gp_id: selectedGP,
      };

      const response = await mapPlanToGP(payload);

      if (response.success) {
        toast.success(response.message);

        setPlans((prevPlans) =>
          prevPlans.map((plan) =>
            plan.id === selectedPlan.id
              ? {
                  ...plan,
                  gp: Number(selectedGP),
                  gram_panchayat:
                    response.data.gp_name,
                }
              : plan
          )
        );

        setGpMap((prev) => ({
          ...prev,
          [selectedGP]: response.data.gp_name,
        }));

        setShowGPModal(false);
        setSelectedGP("");
      } else {
        toast.error("Failed to map GP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [organizationId, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadStates = async () => {
    try {
      const states = await getStates();

      const stateObj = {};

      states.forEach((state) => {
        stateObj[state.id] = state.state_name;
      });

      setStatesMap(stateObj);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await getPlans(
        organizationId,
        currentPage
      );

      const data = response.results || [];

      setPlans(data);

      setTotalPages(
        Math.ceil(response.count / 10)
      );

      // Fetch districts
      const uniqueStates = [
        ...new Set(data.map((p) => p.state_soi)),
      ];

      for (const stateCode of uniqueStates) {
        const districts = await getDistricts(stateCode);

        const districtObj = {};

        districts.forEach((district) => {
          districtObj[district.id] =
            district.district_name;
        });

        setDistrictsMap((prev) => ({
          ...prev,
          ...districtObj,
        }));
      }

      // Fetch blocks
      const uniqueDistricts = [
        ...new Set(data.map((p) => p.district_soi)),
      ];

      for (const districtCode of uniqueDistricts) {
        const blocks = await getBlocks(districtCode);

        const blockObj = {};

        blocks.forEach((block) => {
          blockObj[block.id] =
            block.block_name;
        });

        setBlocksMap((prev) => ({
          ...prev,
          ...blockObj,
        }));
      }

      const uniqueGPs = [
          ...new Set(data.map((p) => p.gp).filter(Boolean)),
        ];

      for (const gpCode of uniqueGPs) {
        const gpData = await getGPByCode(gpCode);

        if (gpData.length) {
          setGpMap((prev) => ({
            ...prev,
            [gpCode]:
              gpData[0].gram_panchayat_name,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const searchFields = [
    "plan",
  ];

  const filteredPlans = plans.filter((plan) =>
    searchFields.some((field) =>
      String(plan[field] || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
    )
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 mt-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Organization Plans (DPR Completed &
            Reviewed)
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative inline-block">
            <button
              onClick={handleExportDropdown}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow"
            >
              Export Yuktdhara Data
            </button>

            {showExportDropdown && (
              <div
                className="absolute top-14 right-0 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-[99999] max-h-72 overflow-y-auto"
                style={{
                  position: "absolute",
                  zIndex: 99999,
                }}
              >
                {gpExportOptions?.length ? (
                  gpExportOptions.map((gp) => (
                    <button
                      key={gp.gp}
                      onClick={() => {
                        handleExport(gp);

                        setShowExportDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                    >
                      {gp.gp__gram_panchayat_name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No GP Available
                  </div>
                )}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

  {loading ? (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">
        Loading plans...
      </p>
    </div>
  </div>
) : (
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-visible">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-5 py-4 text-left">
                    Plan Name
                  </th>

                  <th className="px-5 py-4 text-left">
                    Project
                  </th>

                  <th className="px-5 py-4 text-left">
                    Facilitator
                  </th>

                  <th className="px-5 py-4 text-left">
                    State
                  </th>

                  <th className="px-5 py-4 text-left">
                    District
                  </th>

                  <th className="px-5 py-4 text-left">
                    Tehsil
                  </th>

                  <th className="px-5 py-4 text-left">
                    GP
                  </th>
                </tr>
              </thead>

              <tbody>
              {filteredPlans.map((plan) => {
                const isGPMapped =
                  plan.gp &&
                  plan.gp !== "-";

                return (
                  <tr
                    key={plan.id}
                    className="border-b hover:bg-blue-50"
                  >
                    <td className="px-5 py-4">
                      {plan.plan || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {plan.project_name || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {plan.facilitator_name || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {statesMap[plan.state_soi] || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {districtsMap[plan.district_soi] || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {blocksMap[plan.tehsil_soi] || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span>
                          {gpMap[plan.gp] || "-"}
                        </span>

                        <button
                          onClick={() => handleMapGPClick(plan)}
                          className="w-9 h-9 rounded hover:bg-teal-500 flex items-center justify-center text-white transition"
                        >
                          <Edit className="h-5 w-5  " color='#196770'/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
            <div className="flex justify-center items-center gap-4 p-4">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => prev - 1)
                }
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Previous
              </button>

              <span className="text-sm font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => prev + 1)
                }
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                Next
              </button>
            </div>
          </div>
          {showGPModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                  Map Gram Panchayat
                </h2>

                <select
                  value={selectedGP}
                  onChange={(e) =>
                    setSelectedGP(e.target.value)
                  }
                  className="w-full border rounded-lg p-3 mb-4"
                >
                  <option value="">
                    Select Gram Panchayat
                  </option>

                  {gpOptions.map((gp) => (
                    <option
                      key={gp.gram_panchayat_code}
                      value={gp.gram_panchayat_code}
                    >
                      {gp.gram_panchayat_name}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowGPModal(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveGP}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          <ToastContainer position="top-right" />
          {showExportModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                  Export Yuktdhara Data
                </h2>

                <select
                  value={selectedDistrict}
                  onChange={(e) =>
                    handleDistrictChange(e.target.value)
                  }
                  className="w-full border rounded-lg p-3 mb-4"
                >
                  <option value="">
                    Select District
                  </option>

                  {districtOptions.map((district) => (
                    <option
                      key={district.district_soi}
                      value={district.district_soi}
                    >
                      {district.district_soi__district_name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTehsil}
                  onChange={(e) =>
                    handleTehsilChange(e.target.value)
                  }
                  disabled={!selectedDistrict}
                  className="w-full border rounded-lg p-3 mb-4"
                >
                  <option value="">
                    Select Tehsil
                  </option>

                  {tehsilOptions.map((tehsil) => (
                    <option
                      key={tehsil.tehsil_soi}
                      value={tehsil.tehsil_soi}
                    >
                      {tehsil.tehsil_soi__tehsil_name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedExportGP}
                  // onChange={(e) => {
                  //   setSelectedExportGP(e.target.value);

                  //   handleGPExport(e.target.value);
                  // }}
                  onChange={(e) => {
                    setSelectedExportGP(e.target.value);
                  }}
                  disabled={!selectedTehsil}
                  className="w-full border rounded-lg p-3 mb-4"
                >
                  <option value="">
                    Select Gram Panchayat
                  </option>

                  {gpExportOptions.map((gp) => (
                    <option
                      key={gp.gp}
                      value={gp.gp}
                    >
                      {gp.gp__gram_panchayat_name}
                    </option>
                  ))}
                </select>

                {/* <div className="flex justify-end">
                  <button
                    onClick={() =>
                      setShowExportModal(false)
                    }
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                </div> */}

                <div className="flex justify-end gap-3">
  <button
    onClick={() =>
      setShowExportModal(false)
    }
    className="px-4 py-2 border rounded-lg"
  >
    Cancel
  </button>

  <button
    disabled={!selectedExportGP}
    onClick={() =>
      handleGPExport(selectedExportGP)
    }
    className={`px-4 py-2 rounded-lg text-white ${
      !selectedExportGP
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }`}
  >
    Export
  </button>
</div>
              </div>
            </div>
          )}

          {!filteredPlans.length && (
            <div className="text-center py-10 text-gray-500">
              No plans found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlansPage;