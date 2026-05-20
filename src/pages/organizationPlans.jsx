import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getPlans,
  getStates,
  getDistricts,
  getBlocks,
  getGPsTehsilWise,
  mapPlanToGP,
  exportYuktdharaData,
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

  const handleExport = async (plan) => {
    try {
      toast.info("Preparing download...");

      const blob = await exportYuktdharaData(plan.id);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${plan.plan}.zip`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Download started");
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
                  gram_panchayat:
                    response.data.gp_name,
                }
              : plan
          )
        );

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
  }, [organizationId]);

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
      const data = await getPlans(organizationId);

      setPlans(data);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Organization Plans
        </h1>

        <div className="text-sm text-gray-500">
          Total Plans: {plans.length}
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-200">
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
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
            {plans.map((plan) => {
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
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleMapGPClick(plan)
                        }
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition"
                      >
                        Map GP
                      </button>

                      <button
                        disabled={!isGPMapped}
                        onClick={() =>
                          handleExport(plan.id)
                        }
                        className={`px-3 py-1.5 text-white rounded-lg transition ${
                          !isGPMapped
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        Export
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
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

          {!plans.length && (
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