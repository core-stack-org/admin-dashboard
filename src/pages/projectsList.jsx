import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  CircularProgress,
  IconButton,
  Popover,
  Box,
  TextField,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Menu,
  Switch
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Edit2,
  Eye,
  Download,
  Upload,
  FilePlus,
  ArrowLeftCircle,
  Settings,
  BarChart3,
  FilterX,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ProjectMemberRegistration from "./ProjectMemberRegistration";

const ProjectsList = ({ currentUser }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedProjectForPlans, setSelectedProjectForPlans] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(false);
 const [disabledProjectsApi, setDisabledProjectsApi] = useState([]);
 const [selectedState, setSelectedState] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedAppType, setSelectedAppType] = useState("");
    const [selectedOrganization, setSelectedOrganization] = useState("");
  const [filterType, setFilterType] = useState("");
   const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [statesList, setStatesList] = useState([]);
    const [districtsCache, setDistrictsCache] = useState({});
    const [blocksCache, setBlocksCache] = useState({});
    const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
const [selectedProject, setSelectedProject] = useState(null);
const [showProjects, setShowProjects] = useState(true);
const [showPlans, setShowPlans] = useState(false);
const [compactProjects, setCompactProjects] = useState(false);
const [activeTab, setActiveTab] = useState("projects");
 const location = useLocation();
  const currentPageFromState = location.state?.currentPage;
  const [page, setPage] = useState(currentPageFromState || 1);
  const rowsPerPage = 5;

  const navigate = useNavigate();
  const isSuperAdmin = currentUser?.user?.is_superadmin;
  const selectedProjectId = location.state?.selectedProjectId;    


  console.log(statesList);
  // fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}api/v1/projects/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "420",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        const statesResponse = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`
        );
        const statesData = await statesResponse.json();

        const stateMap = {};
        statesData.states.forEach((s) => {
          stateMap[String(s.id)] = s.state_name;
        });

        const updatedProjects = data
          .map((p) => ({
            ...p,
            state_name: p.state_soi_name || p.state_name || stateMap[String(p.state)] || "Unknown State",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setProjects(updatedProjects);

      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  //fetc diabled projects
  useEffect(() => {
    const fetchDisabledProjects = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.REACT_APP_BASEURL}api/v1/projects/disabled/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch disabled projects");

        const data = await res.json();
        setDisabledProjectsApi(data);
      } catch (err) {
        console.error("Error fetching disabled projects:", err);
      }
    };

    fetchDisabledProjects();
  }, []);




  useEffect(() => {
  setPage(1);
}, [
  selectedState,
  selectedStatus,
  selectedAppType,
  selectedOrganization,
]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/get_states/`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setStatesList(data.states || data.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStates();
  }, []);


  // Fetch districts for a state and cache them
  const fetchDistricts = async (stateCode) => {
    if (districtsCache[stateCode]) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/get_districts/${stateCode}/`,
        { headers: { "content-type": "application/json" } },
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
    statesList.find((s) => String(s.id) === String(stateCode))?.state_name ||
    "Unknown State";

    const normalizeName = (str) =>
  str
    ? str
        .toLowerCase()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

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
        },
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

useEffect(() => {
  const fetchPlans = async () => {
    if (!selectedProjectForPlans) {
      setPlans([]);
      return;
    }

    try {
      setLoadingPlans(true);

      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/projects/${selectedProjectForPlans}/watershed/plans/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }

      const data = await response.json();

      console.log("PLANS RESPONSE", data);
     for (const plan of data) {
  if (plan.state_soi) {
    await fetchDistricts(plan.state_soi);
  }

  if (plan.district_soi) {
    await fetchBlocks(plan.district_soi);
  }
}
      setPlans(data);
    } catch (error) {
      console.error("Plans Error:", error);
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  fetchPlans();
}, [selectedProjectForPlans]);

useEffect(() => {
  if (currentPageFromState) {
    setPage(currentPageFromState);
  }
}, [currentPageFromState]);




  // memoized filter lists
  const appTypes = useMemo(
    () => Array.from(new Set(projects.map((p) => p.app_type).filter(Boolean))),
    [projects]
  );
  const organizations = useMemo(
    () =>
      Array.from(
        new Set(projects.map((p) => p.organization_name).filter(Boolean))
      ),
    [projects]
  );
  const states = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.state_name).filter(Boolean))),
    [projects]
  );

  // apply filters
  const allProjects = useMemo(() => {
    return [...projects, ...disabledProjectsApi];
  }, [projects, disabledProjectsApi]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      return (
        (selectedState
          ? p.state_name?.toLowerCase() === selectedState.toLowerCase()
          : true) &&
        (selectedAppType
          ? p.app_type?.toLowerCase() === selectedAppType.toLowerCase()
          : true) &&
        (selectedOrganization
          ? p.organization_name?.toLowerCase() ===
          selectedOrganization.toLowerCase()
          : true) &&
        (selectedStatus
          ? (p.status || "Active").toLowerCase() ===
          selectedStatus.toLowerCase()
          : true)
      );
    });
  }, [
    allProjects,
    selectedState,
    selectedStatus,
    selectedAppType,
    selectedOrganization,
  ]);


  const enabledProjects = useMemo(() => {
    return filteredProjects.filter(p => p.enabled !== false);
  }, [filteredProjects]);

  const disabledProjects = useMemo(() => {
    return filteredProjects.filter(p => p.enabled === false);
  }, [filteredProjects]);

  const totalPages = Math.ceil(enabledProjects.length / rowsPerPage);

  const paginatedProjects = enabledProjects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // popover handlers
  const handleFilterClick = (e, type) => {
    setAnchorEl(e.currentTarget);
    setFilterType(type);
    setSearchText("");
  };
  const handleFilterClose = () => {
    setAnchorEl(null);
    setFilterType("");
    setSearchText("");
  };

  // clear all filters
  const clearAllFilters = () => {
    setSelectedState("");
    setSelectedStatus("");
    setSelectedAppType("");
    setSelectedOrganization("");
    setSearchText("");
    setAnchorEl(null);
  };

 

  const exportProjectsToExcel = () => {
    const dataToExport = filteredProjects.map((p, index) => ({
      "S. No": index + 1,
      Name: p.name || "N/A",
      "App Type": p.app_type_display || p.app_type || "N/A",
      State: p.state_name || "N/A",
      Organization: p.organization_name || "N/A",
      Status: p.enabled ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // auto column width
    const colWidths = Object.keys(dataToExport[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...dataToExport.map((row) =>
          row[key] ? row[key].toString().length : 10
        )
      ),
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Projects_List.xlsx");
  };

  return (
    <Box>
<div className="flex items-center justify-between px-2">

  {/* Left Side - Tabs */}
  <div className="flex items-center gap-6">

    <button
      onClick={() => setActiveTab("projects")}
      className={`px-10 py-4 rounded-xl border ${
        activeTab === "projects"
          ? "bg-purple-50 border-purple-500 text-purple-700"
          : "bg-white border-gray-200"
      }`}
    >
      Projects 
    </button>

    <button
      onClick={() => setActiveTab("plans")}
      className={`px-10 py-4 rounded-xl border ${
        activeTab === "plans"
          ? "bg-purple-50 border-purple-500 text-purple-700"
          : "bg-white border-gray-200"
      }`}
    >
      Plans
    </button>

  </div>

  {/* Center - Applied Filters */}
  <div className="flex flex-wrap items-center gap-2">

    {selectedState && (
      <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
        State: {selectedState}
        <button
          onClick={() => setSelectedState("")}
          className="ml-1 font-bold hover:text-red-500"
        >
          ×
        </button>
      </span>
    )}

    {selectedAppType && (
      <span className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full">
        App Type: {selectedAppType}
        <button
          onClick={() => setSelectedAppType("")}
          className="ml-1 font-bold hover:text-red-500"
        >
          ×
        </button>
      </span>
    )}

    {selectedOrganization && (
      <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
        Org: {selectedOrganization}
        <button
          onClick={() => setSelectedOrganization("")}
          className="ml-1 font-bold hover:text-red-500"
        >
          ×
        </button>
      </span>
    )}

  </div>

  {/* Right Side - Actions */}
  {activeTab === "projects" && (
  <div className="flex items-center gap-3">

    <Tooltip title="Add Project">
      <IconButton
        onClick={() => navigate("/projects/add")}
        sx={{
          color: "#9333ea",
          "&:hover": {
            backgroundColor: "rgba(147,51,234,0.1)",
          },
        }}
      >
        <Plus size={22} />
      </IconButton>
    </Tooltip>

    <Tooltip title="Export Excel">
      <IconButton
        onClick={exportProjectsToExcel}
        sx={{
          color: "#16a34a",
          "&:hover": {
            backgroundColor: "rgba(22,163,74,0.1)",
          },
        }}
      >
        <Download size={22} />
      </IconButton>
    </Tooltip>

  </div>
  )}

</div>
      <div className="flex flex-col">
        {compactProjects && (
  <div className="mx-4 mt-3 p-4 bg-purple-50 border border-purple-100 rounded-xl flex justify-between items-center">
    <div>
      <p className="font-semibold text-gray-700">
        Showing {paginatedProjects.length} of {enabledProjects.length} projects
      </p>

      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
    </div>

    <Button
      variant="outlined"
      onClick={() => {
        setCompactProjects(false);
        setShowProjects(true);
        setShowPlans(false);
      }}
    >
      View Projects
    </Button>
  </div>
)}

        {/* Table container */}
{activeTab === "projects" && (
          <div className="flex-1 overflow-y-auto p-2">
          <div className="rounded-2xl shadow-lg border border-gray-200 bg-white overflow-y-auto h-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <CircularProgress />
              </div>
            ) : (
              <div>
                <table className="min-w-full text-md text-left border-collapse">
                  <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-black top-0 z-10">
                    <tr>
                      <th className="px-6 py-2">S. No.</th>
                      <th className="px-6 py-2">Name</th>
                      <th className="px-6 py-2">
                        <div className="flex items-center">
                          App Type
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, "app_type")}
                          >
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </th>
                      <th className="px-6 py-2">
                        <div className="flex items-center">
                          State
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, "state")}
                          >
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </th>
                      <th className="px-6 py-2">
                        <div className="flex items-center">
                          Organization
                          <IconButton
                            size="small"
                            onClick={(e) => handleFilterClick(e, "organization")}
                          >
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </th>
                      <th className="px-6 py-3">User Management</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {enabledProjects.length > 0 ? (
                      paginatedProjects.map((p, i) => (
                        <tr
                          key={p.id}
                          onClick={() =>
                            navigate(`/projects/${p.id}/members`, {
                              state: {
                                project: p,
                                selectedProjectId: p.id,
                                currentPage: page,
                              },
                            })
                          }
                          className={`cursor-pointer hover:bg-purple-50 transition duration-200 text-gray-700 ${
                            selectedProjectId === p.id
                              ? "bg-purple-50 border-l-4 border-purple-600"
                              : ""
                          }`}>                          
                          <td
                            className={`px-6 py-2 font-medium ${
                              selectedProjectId === p.id
                                ? "border-l-4 border-purple-600 bg-purple-50"
                                : ""
                            }`}
                          >
                            {(page - 1) * rowsPerPage + i + 1}</td>
                          <td className="px-6 py-2 font-medium">{p.name}</td>
                          <td className="px-6 py-2 font-medium"> {p.app_type_display === "Watershed Planning" ? "NRM Plans via Commons connect"
    : p.app_type_display || "N/A"} </td>
                          <td className="px-6 py-2 font-medium"> {p.state_name} </td>
                          <td className="px-6 py-2 font-medium"> {p.organization_name || "N/A"} </td>
                         <td className="px-6 py-2">
                        <div className="flex gap-2">
  <button
    className="px-3 py-1 text-xs border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 whitespace-nowrap"
    onClick={(e) => {
      e.stopPropagation();
      setSelectedProject(p);
      setOpenAddMemberModal(true);
    }}
  >
    Register New User
  </button>

  <button
    className="px-3 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 whitespace-nowrap"
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/projects/${p.id}/members`, {
        state: {
          project: p,
          selectedProjectId: p.id,
          currentPage: page,
        },
      });
    }}
  >
    Edit User Details
  </button>
</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-500">No projects found.</td>
                      </tr>
                    )}
                  </tbody>

                </table>
                <div className="flex justify-end items-center gap-2 p-4 border-t">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`px-3 py-1 rounded ${page === 1
                          ? "bg-gray-200 cursor-not-allowed"
                          : "bg-purple-500 text-white hover:bg-purple-600"}`}
                    >
                      Previous
                    </button>

                    <span className="px-3">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-3 py-1 rounded ${page === totalPages
                          ? "bg-gray-200 cursor-not-allowed"
                          : "bg-purple-500 text-white hover:bg-purple-600"}`}
                    >
                      Next
                    </button>
                  </div>
              </div>

            )}
          </div>
        </div>
        )}
      </div>

      {/* Plans Section */}
<div className="mt-3">

{activeTab === "plans" && (
    <>
 <div className="flex items-center gap-4 justify-between">
  <div className="flex items-center gap-4">
    <label className="font-medium text-gray-700">
      Select Project
    </label>

    <select
      value={selectedProjectForPlans}
      onChange={(e) => setSelectedProjectForPlans(e.target.value)}
      className="border border-gray-300 rounded-lg px-4 py-2 min-w-[300px]"
    >
      <option value="">Select Project</option>

      {projects
        .filter((project) => project.app_type === "watershed")
        .map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
    </select>
  </div>

<Button
  variant="contained"
  startIcon={<Plus size={18} />}
  disabled={!selectedProjectForPlans}
  sx={{
    backgroundColor: "#9333ea",
    "&:hover": {
      backgroundColor: "#7e22ce",
    },
    "&.Mui-disabled": {
      backgroundColor: "#d8b4fe",
      color: "#fff",
    },
  }}
  onClick={() => {
    const project = projects.find(
      (p) => String(p.id) === String(selectedProjectForPlans)
    );

    if (!project) return;

    navigate(`/projects/${project.id}/createProjectPlans`, {
      state: {
        projectName: project.name,
        projectId: project.id,
        stateName: project.state_soi_name,
        stateId: project.state_soi,
        districtId: project.district_soi,
        districtName: project.district_soi_name,
        blockId: project.block,
        blockName: project.block_name,
      },
    });
  }}
>
  Add Plan
</Button>
</div>

  {selectedProjectForPlans && (
  <div className="mt-6 rounded-2xl shadow-lg border border-gray-200 bg-white overflow-hidden">
    {loadingPlans ? (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    ) : plans.length > 0 ? (
      <table className="min-w-full text-md text-left border-collapse">
        <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-black">
          <tr>
            <th className="px-6 py-2">S. No.</th>
            <th className="px-6 py-2">Plan Name</th>
            <th className="px-6 py-2">Facilitator</th>
            <th className="px-6 py-2">State</th>
            <th className="px-6 py-2">District</th>
            <th className="px-6 py-2">Tehsil</th>
            <th className="px-6 py-2">Village</th>
            <th className="px-6 py-2">Gram Panchayat</th>
            <th className="px-6 py-2">Created By</th>
            <th className="px-6 py-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {plans.map((plan, index) => (
            <tr
              key={plan.id}
              className="hover:bg-purple-50 transition duration-200"
            >
              <td className="px-6 py-2">{index + 1}</td>

              <td className="px-6 py-2 font-medium">
                {plan.plan || "-"}
              </td>

              <td className="px-6 py-2">
                {plan.facilitator_name || "-"}
              </td>

              <td className="px-6 py-2">
                {getStateName(plan.state_soi)}
              </td>

              <td className="px-6 py-2">
                {getDistrictName(plan.state_soi, plan.district_soi  )}
              </td>

              <td className="px-6 py-2">
                {getBlockName(plan.district_soi, plan.tehsil_soi)}
              </td>

              <td className="px-6 py-2">
                {plan.village_name || "-"}
              </td>
                <td className="px-6 py-2">
                {plan.gram_panchayat || "-"}
              </td>

              <td className="px-6 py-2">
                {plan.created_by_name || "-"}
              </td>
             <td className="px-6 py-2 text-center">
              <button
                onClick={() =>
                  navigate(`/projects/${selectedProjectForPlans}/createProjectPlans`, {
                    state: {
                      projectName:
                        projects.find(
                          (p) =>
                            String(p.id) === String(selectedProjectForPlans)
                        )?.name,
                      projectId: selectedProjectForPlans,
                      planId: plan.id,
                      stateId: plan.state_soi,
                      districtId: plan.district_soi,
                      blockId: plan.tehsil_soi,
                    },
                  })
                }
                className="
                  inline-flex
                  items-center
                  gap-1
                  px-3
                  py-1.5
                  rounded-lg
                  bg-purple-50
                  text-purple-600
                  hover:bg-purple-100
                  transition
                "
              >
                <Edit2 size={16} />
                Edit
              </button>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="p-10 text-center">
        <p className="text-gray-500 mb-4">
          No plans found for this project
        </p>

        {/* <Button
          variant="contained"
          onClick={() => {
            const project = projects.find(
              (p) => String(p.id) === String(selectedProjectForPlans)
            );

            if (!project) return;

            navigate(`/projects/${project.id}/createProjectPlans`, {
              state: {
                projectName: project.name,
                projectId: project.id,
                stateName: project.state_soi_name,
                stateId: project.state_soi,
                districtId: project.district_soi,
                districtName: project.district_soi_name,
                blockId: project.block,
                blockName: project.block_name,
              },
            });
          }}
        >
          Create Plan
        </Button> */}
      </div>
    )}
  </div>
)}
 </>
)}
</div>

 <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <TextField
            size="small"
            placeholder={`Search ${filterType}...`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
            sx={{ mb: 1 }}
          />

          {/* Reset Option */}
          <MenuItem
            onClick={() => {
              if (filterType === "state") setSelectedState("");
              if (filterType === "status") setSelectedStatus("");
              if (filterType === "app_type") setSelectedAppType("");
              if (filterType === "organization") setSelectedOrganization("");
              handleFilterClose();
            }}
            sx={{ color: "blue" }}
          >
            All{" "}
            {filterType === "state"
              ? "States"
              : filterType === "status"
                ? "Status"
                : filterType === "app_type"
                  ? "App Types"
                  : "Organizations"}
          </MenuItem>

          {/* Dynamic Options */}
          {filterType === "state" &&
            states
              .filter((s) => s.toLowerCase().includes(searchText.toLowerCase()))
              .map((s) => (
                <MenuItem
                  key={s}
                  onClick={() => {
                    setSelectedState(s);
                    handleFilterClose();
                  }}
                >
                  {s}
                </MenuItem>
              ))}

          {filterType === "status" &&
            ["Active", "Inactive"]
              .filter((s) => s.toLowerCase().includes(searchText.toLowerCase()))
              .map((s) => (
                <MenuItem
                  key={s}
                  onClick={() => {
                    setSelectedStatus(s);
                    handleFilterClose();
                  }}
                >
                  {s}
                </MenuItem>
              ))}

          {filterType === "app_type" &&
            ["plantation", "watershed", "waterbody", "community_engagement"]
              .filter((s) => s.toLowerCase().includes(searchText.toLowerCase()))
              .map((s) => (
                <MenuItem
                  key={s}
                  onClick={() => {
                    setSelectedAppType(s);
                    handleFilterClose();
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                </MenuItem>
              ))}

          {filterType === "organization" &&
            organizations
              .filter((s) => s.toLowerCase().includes(searchText.toLowerCase()))
              .map((s) => (
                <MenuItem
                  key={s}
                  onClick={() => {
                    setSelectedOrganization(s);
                    handleFilterClose();
                  }}
                >
                  {s}
                </MenuItem>
              ))}
        </Box>
      </Popover>


<Dialog
  open={openAddMemberModal}
  onClose={() => setOpenAddMemberModal(false)}
  maxWidth="md"
  fullWidth
>
  <DialogContent>
    <ProjectMemberRegistration
      project={selectedProject}
      currentUser={currentUser}
      onClose={() => setOpenAddMemberModal(false)}
    />
  </DialogContent>
</Dialog>


    </Box>
  );
};

export default ProjectsList;