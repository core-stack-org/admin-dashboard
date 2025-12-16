import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Tooltip,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Menu,
} from "@mui/material";
import {
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
  ArrowLeftCircle,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";

const AllPlans = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { projectName } = location.state || {};

  const [statesList, setStatesList] = useState([]);
  const [districtsCache, setDistrictsCache] = useState({});
  const [blocksCache, setBlocksCache] = useState({});

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const normalizeName = (str) =>
    str
      ? str
          .toLowerCase()
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "";

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setStatesList(data.states || data.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStates();
  }, []);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.REACT_APP_BASEURL}api/v1/projects/${projectId}/watershed/plans/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "1",
            },
          }
        );
        const data = await res.json();
        const projectPlans = (data.results || data).filter(
          (p) => String(p.project) === String(projectId)
        );
        setPlans(projectPlans);

        // Preload districts for all states in plans
        const statesToFetch = [...new Set(projectPlans.map((p) => p.state))];
        statesToFetch.forEach((stateCode) => fetchDistricts(stateCode));

        const districtsToFetch = [
          ...new Set(projectPlans.map((p) => p.district)),
        ];
        districtsToFetch.forEach((districtCode) => fetchBlocks(districtCode));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [projectId]);

  // Fetch districts for a state and cache them
  const fetchDistricts = async (stateCode) => {
    if (districtsCache[stateCode]) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${stateCode}/`,
        { headers: { "content-type": "application/json" } }
      );
      const data = await res.json();
      const districts = (data.districts || []).map((d) => ({
        ...d,
        district_name: normalizeName(d.district_name),
      }));
      setDistrictsCache((prev) => ({ ...prev, [stateCode]: districts }));
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve district name from cache
  const getDistrictName = (stateCode, districtCode) => {
    const districts = districtsCache[stateCode] || [];

    return (
      districts.find((d) => String(d.id) === String(districtCode))
        ?.district_name || "Unknown District"
    );
  };

  // Resolve state name
  const getStateName = (stateCode) =>
    statesList.find((s) => String(s.state_census_code) === String(stateCode))
      ?.state_name || "Unknown State";

  const fetchBlocks = async (districtCode) => {
    if (blocksCache[districtCode]) return; // already cached

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_blocks/${districtCode}/`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "ngrok-skip-browser-warning": "420",
          },
        }
      );

      const data = await response.json();
      const blocks = (data.blocks || []).map((b) => ({
        ...b,
        block_name: normalizeName(b.block_name),
      }));

      setBlocksCache((prev) => ({ ...prev, [districtCode]: blocks }));
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  // Resolve block name from cache
  const getBlockName = (districtCode, blockCode) => {
    const blocks = blocksCache[districtCode] || [];

    return (
      blocks.find((b) => String(b.id) === String(blockCode))?.block_name ||
      "Unknown Block"
    );
  };

  const togglePlanEnabled = async (plan) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const url = `${process.env.REACT_APP_BASEURL}api/v1/projects/${plan.project}/watershed/plans/${plan.id}/`;

      const payload = { enabled: !plan.enabled }; // flip boolean

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update plan enabled state");

      const updatedPlan = await response.json();

      toast.success(
        `Plan ${updatedPlan.enabled ? "enabled" : "disabled"} successfully!`
      );

      // refresh plans in UI (assuming you have setPlans from useState)
      setPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...p, enabled: updatedPlan.enabled } : p
        )
      );
    } catch (error) {
      console.error("Error toggling enabled state:", error);
      toast.error("Failed to update plan status");
    }
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDeletePlan = async (plan) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return; // optional confirmation

    try {
      const token = sessionStorage.getItem("accessToken");
      const url = `${process.env.REACT_APP_BASEURL}api/v1/projects/${plan.project}/watershed/plans/${plan.id}/`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "1",
        },
      });

      if (response.status === 204) {
        toast.success("Plan deleted successfully!");
        // remove from UI
        setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      } else {
        throw new Error("Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-6">
        <CircularProgress />
      </div>
    );

  return (
    <div className="h-screen flex flex-col p-6 mt-16">
      <div className="pt-2 bg-white rounded-xl mt-2 flex items-center px-6">
        <Tooltip title="Back to Dashboard">
          <IconButton onClick={() => navigate("/projects")}>
            <ArrowLeftCircle className="w-7 h-7 text-blue-600 hover:text-purple-600 transition-colors" />
          </IconButton>
        </Tooltip>

        {/* Centered Title */}
        <h1 className="flex-1 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-center drop-shadow-md">
          Plans for Project {projectName}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto mt-6">
        <div className="rounded-2xl shadow-lg border border-gray-200 bg-white overflow-y-auto h-full">
          {plans.length > 0 ? (
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-black top-0 z-10">
                <tr>
                  <th className="px-6 py-4">S. no.</th>
                  <th className="px-6 py-4">Plan Name</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4">Block</th>
                  <th className="px-6 py-4">Village</th>
                  <th className="px-6 py-4">Gram Panchayat</th>
                  <th className="px-6 py-4">Facilitator</th>
                  <th className="px-6 py-4">Enabled</th>
                  <th className="px-6 py-4">Completed</th>
                  <th className="px-6 py-4">DPR Generated</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.map((plan, i) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-gray-50 transition duration-200 text-gray-700"
                  >
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">
                      {plan.plan || "-"}
                    </td>
                    <td className="px-6 py-4">{getStateName(plan.state)}</td>
                    <td className="px-6 py-4">
                      {getDistrictName(plan.state, plan.district)}
                    </td>
                    <td className="px-6 py-4">
                      {getBlockName(plan.district, plan.block)}
                    </td>
                    <td className="px-6 py-4">{plan.village_name || "-"}</td>
                    <td className="px-6 py-4">{plan.gram_panchayat || "-"}</td>
                    <td className="px-6 py-4">
                      {plan.facilitator_name || "-"}
                    </td>
                    <td className="px-6 py-4">{plan.enabled ? "Yes" : "No"}</td>
                    <td className="px-6 py-4">
                      {plan.is_completed ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4">
                      {plan.is_dpr_generated ? "Yes" : "No"}
                    </td>

                    <td className="px-6 py-4 flex gap-2">
                      {/* Edit - always visible */}
                      <Tooltip title="Edit" arrow>
                        <IconButton
                          size="small"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() =>
                            navigate(`/projects/${plan.project}/planCreation`, {
                              state: {
                                projectId: plan.project,
                                planId: plan.id,
                                projectName: projectName,
                              },
                            })
                          }
                        >
                          <Pencil
                            size={18}
                            className="text-blue-500 hover:text-blue-700"
                          />
                        </IconButton>
                      </Tooltip>

                      {/* More actions menu */}
                      <Tooltip title="More actions" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => setAnchorEl(e.currentTarget)}
                        >
                          <MoreVertical size={18} />
                        </IconButton>
                      </Tooltip>

                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                      >
                        {/* Enable/Disable */}
                        <MenuItem
                          onClick={() => {
                            togglePlanEnabled(plan);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon>
                            {plan.enabled ? (
                              <CheckCircle
                                size={18}
                                className="text-yellow-500"
                              />
                            ) : (
                              <Ban size={18} className="text-green-500" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              plan.enabled ? "Disable Plan" : "Enable Plan"
                            }
                          />
                        </MenuItem>

                        {/* Delete */}
                        <MenuItem
                          onClick={() => {
                            handleDeletePlan(plan);
                            handleMenuClose();
                          }}
                        >
                          <ListItemIcon>
                            <Trash2 size={18} className="text-red-500" />
                          </ListItemIcon>
                          <ListItemText primary="Delete Plan" />
                        </MenuItem>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-gray-500 text-center">No plans available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPlans;
