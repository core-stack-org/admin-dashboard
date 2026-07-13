import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import {
  ChevronLeft,
  Search,
  Calendar,
  User,
  Filter,
  FileText,
  MapPin,
  Clipboard,
  Layers,
  Database
} from "lucide-react";
import { toast } from "react-toastify";
import { getBlocks } from "./base_function";

const BASEURL = `${process.env.REACT_APP_BASEURL}`;

const getToken = () => sessionStorage.getItem("accessToken");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "56px",
    borderRadius: "0.75rem",
    borderWidth: "2px",
    borderColor: state.isFocused ? "#6366f1" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.2)" : "none",
    "&:hover": {
      borderColor: "#6366f1",
    },
    fontWeight: 500,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 1rem",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#64748b",
    fontWeight: 500,
  }),
  singleValue: (base) => ({
    ...base,
    fontWeight: 500,
    color: "#0f172a",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "#eef2ff"
      : state.isSelected
        ? "#6366f1"
        : "white",
    color: state.isSelected ? "white" : "#0f172a",
    fontWeight: 500,
  }),
  groupHeading: (base) => ({
    ...base,
    fontSize: "0.65rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#6366f1",
    backgroundColor: "#eef2ff",
    padding: "6px 12px",
    borderBottom: "1px solid #c7d2fe",
    marginBottom: "2px",
  }),
  group: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 4,
  }),
};

// Demand Type Options
const DEMAND_OPTIONS = [
  { value: "maintenance", label: "Maintenance Demand" },
  { value: "new_demand", label: "New Demand" },
  { value: "livelihood", label: "Livelihood Demand" },
  { value: "plantation", label: "Plantation Demand" }
];

// Selection Page Component
const SelectionPage = ({
  isSuperAdmin,
  onLoadDemandDashboard,
  selectedOrg,
  setSelectedOrg,
  selectedProject,
  setSelectedProject,
  selectedPlan,
  setSelectedPlan,
}) => {
  const [organizations, setOrganizations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [blocksMap, setBlocksMap] = useState({});
  const [filterReviewed, setFilterReviewed] = useState(false);
  const [filterApproved, setFilterApproved] = useState(false);

  // Auto-clear selectedPlan if it no longer matches the filters
  useEffect(() => {
    if (!selectedPlan) return;
    const currentPlan = plans.find((p) => (p.id || p.plan_id) === Number(selectedPlan));
    if (currentPlan) {
      if (filterReviewed && !currentPlan.is_dpr_reviewed) {
        setSelectedPlan("");
      } else if (filterApproved && !currentPlan.is_dpr_approved) {
        setSelectedPlan("");
      }
    }
  }, [filterReviewed, filterApproved, plans, selectedPlan, setSelectedPlan]);

  const CustomMenuList = (props) => {
    return (
      <div className="flex flex-col">
        {/* Filters Header inside Menu List */}
        <div 
          className="flex items-center gap-2 p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1 px-1">
            Filter:
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFilterReviewed(!filterReviewed);
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all border ${
              filterReviewed
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Reviewed
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFilterApproved(!filterApproved);
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all border ${
              filterApproved
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Approved
          </button>
        </div>
        <components.MenuList {...props} />
      </div>
    );
  };

  useEffect(() => {
    if (!isSuperAdmin) return;

    fetch(`${BASEURL}api/v1/organizations/`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const list = data.data || data.results || data;
        setOrganizations(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Org fetch error", err));
  }, [isSuperAdmin]);

  // Non-superadmin: fetch projects
  useEffect(() => {
    if (isSuperAdmin) return;
    setProjectsLoading(true);
    fetch(`${BASEURL}api/v1/projects`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const list = data.data || data.projects || data;
        setProjects(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Projects fetch error", err))
      .finally(() => setProjectsLoading(false));
  }, [isSuperAdmin]);

  // Superadmin: fetch projects when selectedOrg changes
  useEffect(() => {
    if (!isSuperAdmin || !selectedOrg) {
      setProjects([]);
      return;
    }

    setProjectsLoading(true);
    fetch(`${BASEURL}api/v1/projects?organization=${selectedOrg}`, {
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const list = data.data || data.projects || data;
        const all = Array.isArray(list) ? list : [];

        // filter client-side for safety
        const scoped = all.filter((p) => {
          const projectOrgId = p.organization ?? p.organization_id ?? p.org ?? p.org_id;
          return String(projectOrgId) === String(selectedOrg);
        });

        setProjects(scoped);
      })
      .catch((err) => console.error(err))
      .finally(() => setProjectsLoading(false));
  }, [isSuperAdmin, selectedOrg]);

  // Fetch plans whenever selectedProject changes
  useEffect(() => {
    if (!selectedProject) {
      setPlans([]);
      return;
    }

    setPlansLoading(true);
    fetch(`${BASEURL}api/v1/projects/${selectedProject}/watershed/plans/`, {
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const rawPlans = data?.data || data?.plans || data;
        setPlans(
          formatPlansForDropdown(Array.isArray(rawPlans) ? rawPlans : []),
        );
      })
      .catch((err) => {
        console.error("Plan Fetch Error", err);
        setPlans([]);
      })
      .finally(() => setPlansLoading(false));
  }, [selectedProject]);

  const formatPlansForDropdown = (rawPlans = []) =>
    rawPlans.map((p) => ({
      plan_id: p.id || p.plan_id,
      plan: p.plan,
      facilitator_name: p.facilitator_name || "",
      year: p.updated_at ? new Date(p.updated_at).getFullYear() : "",
      village: p.village || p.village_name || "",
      updated_at: p.updated_at || "",
      tehsil_soi: p.tehsil_soi,
      district_soi: p.district_soi,
      is_completed: p.is_completed ?? false,
      is_dpr_reviewed: p.is_dpr_reviewed ?? false,
      is_dpr_approved: p.is_dpr_approved ?? false,
      gram_panchayat: p.gram_panchayat || p.gp_name || "",
    }));

  useEffect(() => {
    if (!plans || plans.length === 0) return;

    const uniqueDistricts = [
      ...new Set(plans.map((p) => p.district_soi).filter(Boolean)),
    ];

    const fetchAllBlocks = async () => {
      for (const districtCode of uniqueDistricts) {
        try {
          const blocks = await getBlocks(districtCode);
          const blockObj = {};
          blocks.forEach((block) => {
            blockObj[block.id] = block.block_name;
          });
          setBlocksMap((prev) => ({
            ...prev,
            ...blockObj,
          }));
        } catch (err) {
          console.error(`Failed to fetch blocks for district ${districtCode}`, err);
        }
      }
    };

    fetchAllBlocks();
  }, [plans]);

  const groupPlansForDropdown = (plansList) => {
    const groups = { "Completed": [], "In Progress": [] };

    const filteredPlans = plansList.filter((plan) => {
      if (filterReviewed && !plan.is_dpr_reviewed) return false;
      if (filterApproved && !plan.is_dpr_approved) return false;
      return true;
    });

    filteredPlans.forEach((plan) => {
      const category = plan.is_completed ? "Completed" : "In Progress";
      groups[category].push({ value: plan.plan_id, label: plan.plan, plan });
    });

    return Object.keys(groups)
      .filter((cat) => groups[cat].length > 0)
      .map((cat) => ({ label: cat, options: groups[cat] }));
  };

  const handleSubmit = () => {
    if (!selectedProject || !selectedPlan) return;
    const planObj = plans.find((p) => p.plan_id === Number(selectedPlan));
    onLoadDemandDashboard(selectedProject, selectedPlan, planObj);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6 mt-5">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight mt-10">
            Demand Status Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Select project, plan, and demand type to review details
          </p>
        </div>

        <div className="bg-white shadow-2xl rounded-3xl p-10 border border-slate-200">
          {isSuperAdmin && (
            <div className="mb-7">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                Select Organization
              </label>
              <Select
                styles={selectStyles}
                placeholder="-- Choose Organization --"
                options={organizations.map((org) => ({
                  value: org.id,
                  label: org.name,
                  org,
                }))}
                value={
                  selectedOrg
                    ? organizations
                      .map((org) => ({ value: org.id, label: org.name, org }))
                      .find((o) => o.value === selectedOrg)
                    : null
                }
                onChange={(opt) => {
                  setSelectedOrg(opt?.value || "");
                  setSelectedProject("");
                  setSelectedPlan("");
                  setPlans([]);
                }}
                formatOptionLabel={({ org, label }, { context }) => {
                  if (context === "value") {
                    return (
                      <span className="font-semibold text-slate-800">
                        {label}
                      </span>
                    );
                  }

                  return (
                    <div className="py-0.5">
                      <div className="font-semibold text-slate-800 text-sm leading-snug">
                        {org.name}
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          Total Plans: {org.total_plan ?? 0}
                        </span>

                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          Completed: {org.completed_plan ?? 0}
                        </span>
                      </div>
                    </div>
                  );
                }}
                isClearable
              />
            </div>
          )}

          <div className="mb-7">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
              Select Project
            </label>
            <Select
              styles={selectStyles}
              placeholder="-- Choose Project --"
              isLoading={projectsLoading}
              options={projects.map((p) => ({
                value: p.id || p.project_id,
                label: p.project_name || p.name,
                p,
              }))}
              value={
                selectedProject
                  ? projects
                    .map((p) => ({
                      value: p.id || p.project_id,
                      label: p.project_name || p.name,
                      p,
                    }))
                    .find((p) => p.value === selectedProject)
                  : null
              }
              onChange={(opt) => {
                setSelectedProject(opt?.value || "");
                setSelectedPlan("");
                setPlans([]);
              }}
              formatOptionLabel={({ p, label }, { context }) => {
                if (context === "value") {
                  return (
                    <span className="font-semibold text-slate-800">
                      {label}
                    </span>
                  );
                }

                return (
                  <div className="py-0.5">
                    <div className="font-semibold text-slate-800 text-sm leading-snug">
                      {p.name}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        Total Plans: {p.total_plan ?? 0}
                      </span>

                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        Completed: {p.completed_plan ?? 0}
                      </span>
                    </div>
                  </div>
                );
              }}
              isClearable
            />
          </div>

          <div className="mb-7">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
              Select Plan
            </label>
            <Select
              styles={{
                ...selectStyles,
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "#eef2ff"
                    : state.isSelected
                      ? "#6366f1"
                      : "white",
                  color: state.isSelected ? "white" : "#0f172a",
                  padding: "10px 12px",
                }),
              }}
              placeholder="-- Choose Plan --"
              isLoading={plansLoading}
              noOptionsMessage={() =>
                selectedProject ? "No plans found" : "Select a project first"
              }
              options={groupPlansForDropdown(plans)}
              value={
                selectedPlan
                  ? plans
                    .map((plan) => ({
                      value: plan.plan_id,
                      label: plan.plan,
                      plan,
                    }))
                    .find((p) => p.value === Number(selectedPlan))
                  : null
              }
              onChange={(opt) => setSelectedPlan(opt?.value || "")}
              components={{ MenuList: CustomMenuList }}
              formatOptionLabel={({ plan, label }, { context }) => {
                if (context === "value") {
                  return (
                    <span className="font-semibold text-slate-800">
                      {label}
                    </span>
                  );
                }
                const date = plan.updated_at
                  ? new Date(plan.updated_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : null;
                return (
                  <div className="py-0.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-800 text-sm leading-snug">
                        {plan.plan}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {plan.is_dpr_reviewed && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                            Reviewed
                          </span>
                        )}
                        {plan.is_dpr_approved && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                            Approved
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      {plan.facilitator_name && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {plan.facilitator_name}
                        </span>
                      )}
                      {plan.village && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {plan.village}
                        </span>
                      )}
                      {date && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {date}
                        </span>
                      )}
                      {plan.tehsil_soi && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                          {blocksMap[plan.tehsil_soi] || `Tehsil (${plan.tehsil_soi})`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
              isClearable
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedPlan}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper components for tabular representation
const renderBeneficiary = (record) => {
  if (!record.beneficiary_name && !record.beneficiary_father_name) {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <div className="min-w-0">
      <div className="font-bold text-slate-800 text-sm">
        {record.beneficiary_name === "0" ? "N/A" : record.beneficiary_name || "N/A"}
      </div>
      {record.beneficiary_father_name && (
        <div className="text-[11px] text-slate-500 font-medium">
          S/O: {record.beneficiary_father_name}
        </div>
      )}
      {record.gender && (
        <span className="inline-block text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 mt-1 rounded">
          Gender: {record.gender}
        </span>
      )}
    </div>
  );
};

const DemandTable = ({
  title,
  icon: Icon,
  records,
  categoryType,
  handleStatusChange,
  getStatusConfig,
}) => {
  if (!records) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden mb-8 transition-all hover:shadow-lg">
      {/* Table Header Section */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="text-indigo-600" size={20} />}
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
        </div>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          {records.length} Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-5 w-16">ID</th>
              {categoryType === "maintenance" && (
                <>
                  <th className="py-3 px-4">Structure Type</th>
                  <th className="py-3 px-4">Repair Activities</th>
                </>
              )}
              {categoryType === "new_demand" && (
                <>
                  <th className="py-3 px-4">Work Title / Category</th>
                  <th className="py-3 px-4">Beneficiary</th>
                  <th className="py-3 px-4">Settlement</th>
                </>
              )}
              {categoryType === "plantation" && (
                <>
                  <th className="py-3 px-4">Livelihood Work</th>
                  <th className="py-3 px-4">Acres</th>
                  <th className="py-3 px-4">Beneficiary</th>
                </>
              )}
              {categoryType === "livelihood" && (
                <>
                  <th className="py-3 px-4">Livelihood Work</th>
                  <th className="py-3 px-4">Beneficiary</th>
                  <th className="py-3 px-4">Settlement</th>
                </>
              )}
              <th className="py-3 px-4">GPS Coordinates</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th className="py-3 px-4 w-40">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={categoryType === "maintenance" ? 6 : 7}
                  className="py-10 text-center text-slate-400 font-medium bg-slate-50/30"
                >
                  No records found in this category.
                </td>
              </tr>
            ) : (
              records.map((record, index) => {
                const status = record.status || "PENDING";
                const { badgeClass, dotClass } = getStatusConfig(status);

                const getRecordTitle = () => {
                  if (categoryType === "maintenance") {
                    return record.structure_type || "Maintenance Demand";
                  } else if (categoryType === "new_demand") {
                    return record.work_demand || record.work_category || "New Demand";
                  } else {
                    return record.work_demand || "Livelihood/Plantation Demand";
                  }
                };

                return (
                  <tr
                    key={record.id || index}
                    className="hover:bg-slate-50/80 transition-colors duration-150 group"
                  >
                    {/* ID */}
                    <td className="py-4 px-5 font-semibold text-slate-500 text-xs">
                      #{record.id}
                    </td>

                    {/* Maintenance Columns */}
                    {categoryType === "maintenance" && (
                      <>
                        <td className="py-4 px-4 font-bold text-slate-800">
                          {getRecordTitle()}
                          <span className="block text-[10px] text-indigo-500 font-bold uppercase mt-0.5">
                            {record.resource_type || "maintenance"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {record.repair_activities ? (
                            <span className="text-xs text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-100 block max-w-xs break-words">
                              {record.repair_activities}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </>
                    )}

                    {/* New Demand Columns */}
                    {categoryType === "new_demand" && (
                      <>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-800">{getRecordTitle()}</div>
                          {record.work_category && (
                            <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1">
                              {record.work_category}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {renderBeneficiary(record)}
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-600">
                          {record.beneficiary_settlement || <span className="text-slate-400">—</span>}
                        </td>
                      </>
                    )}

                    {/* Plantation Columns */}
                    {categoryType === "plantation" && (
                      <>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-800">{record.livelihood_work || getRecordTitle()}</div>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">
                          {record.total_acres !== undefined && record.total_acres !== null ? (
                            `${record.total_acres} acres`
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {renderBeneficiary(record)}
                        </td>
                      </>
                    )}

                    {/* Livelihood Columns */}
                    {categoryType === "livelihood" && (
                      <>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-800">{record.livelihood_work || getRecordTitle()}</div>
                        </td>
                        <td className="py-4 px-4">
                          {renderBeneficiary(record)}
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-600">
                          {record.beneficiary_settlement || <span className="text-slate-400">—</span>}
                        </td>
                      </>
                    )}

                    {/* GPS Coordinates */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {record.latitude || record.longitude ? (
                        <div>
                          <div>Lat: {parseFloat(record.latitude).toFixed(6)}</div>
                          <div>Lon: {parseFloat(record.longitude).toFixed(6)}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                        {status.toUpperCase()}
                      </span>
                    </td>

                    {/* Status updater dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(record, e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:border-indigo-400 focus:outline-none transition-all cursor-pointer shadow-sm"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REVERTED">REVERTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Dashboard View Component
const DemandDashboard = ({
  isSuperAdmin,
  selectedProject,
  selectedPlan,
  planDetails,
  onBack,
}) => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDemands = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setDemands([]); // Clear demands first to prevent stale views
    
    const maintenanceUrl = `${BASEURL}api/v1/dpr_data/${selectedPlan}/maintenance/`;
    const newDemandUrl = `${BASEURL}api/v1/dpr_data/${selectedPlan}/nrm-works/`;
    const livelihoodUrl = `${BASEURL}api/v1/dpr_data/${selectedPlan}/livelihood/`;

    try {
      const [mRes, nRes, lRes] = await Promise.all([
        fetch(maintenanceUrl, { headers: getHeaders() }),
        fetch(newDemandUrl, { headers: getHeaders() }),
        fetch(livelihoodUrl, { headers: getHeaders() })
      ]);

      if (!mRes.ok || !nRes.ok || !lRes.ok) {
        throw new Error("Failed to fetch one or more demand types");
      }

      const [mData, nData, lData] = await Promise.all([
        mRes.json(),
        nRes.json(),
        lRes.json()
      ]);

      const mList = (mData.results || mData.data || []).map(item => ({
        ...item,
        categoryType: 'maintenance',
        resource_type: item.resource_type || 'maintenance'
      }));

      const nList = (nData.results || nData.data || []).map(item => ({
        ...item,
        categoryType: 'new_demand',
        resource_type: item.resource_type || 'nrm-works'
      }));

      const lList = (lData.results || lData.data || []).map(item => {
        const work = String(item.livelihood_work || "").toLowerCase().trim();
        const isPlantation = work.startsWith("plantation");
        return {
          ...item,
          categoryType: isPlantation ? 'plantation' : 'livelihood',
          resource_type: item.resource_type || 'livelihood'
        };
      });

      setDemands([...mList, ...nList, ...lList]);
    } catch (err) {
      console.error("Demand Status Fetch Error", err);
      toast.error("Failed to load demand records");
      setDemands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, [selectedPlan]);

  const handleStatusChange = async (record, newStatus) => {
    const originalStatus = record.status || "PENDING";

    // Optimistic UI update
    setDemands((prevDemands) =>
      prevDemands.map((d) =>
        (String(d.id) === String(record.id) && d.resource_type === record.resource_type)
          ? { ...d, status: newStatus }
          : d
      )
    );

    try {
      const res = await fetch(`${BASEURL}api/v1/dpr_data/${selectedPlan}/demand-status/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          resource_type: record.resource_type,
          resource_id: String(record.id),
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status on server");
      }

      toast.success(`Status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update status. Reverting change.");
      // Revert change in UI
      setDemands((prevDemands) =>
        prevDemands.map((d) =>
          (String(d.id) === String(record.id) && d.resource_type === record.resource_type)
            ? { ...d, status: originalStatus }
            : d
        )
      );
    }
  };

  const getStatusConfig = (status = "PENDING") => {
    const normalized = status.toUpperCase();
    switch (normalized) {
      case "SUBMITTED":
        return {
          borderClass: "bg-blue-400",
          badgeClass: "bg-blue-50 text-blue-700 ring-blue-200",
          dotClass: "bg-blue-500",
        };
      case "APPROVED":
        return {
          borderClass: "bg-emerald-400",
          badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
          dotClass: "bg-emerald-500",
        };
      case "REVERTED":
        return {
          borderClass: "bg-amber-400",
          badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
          dotClass: "bg-amber-500",
        };
      case "REJECTED":
        return {
          borderClass: "bg-rose-400",
          badgeClass: "bg-rose-50 text-rose-700 ring-rose-200",
          dotClass: "bg-rose-500",
        };
      case "PENDING":
      default:
        return {
          borderClass: "bg-slate-300",
          badgeClass: "bg-slate-100 text-slate-700 ring-slate-200",
          dotClass: "bg-slate-400",
        };
    }
  };

  const filteredDemands = demands.filter((d) => {
    const searchStr = JSON.stringify(d).toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const mRecords = filteredDemands.filter(d => d.categoryType === 'maintenance');
  const nRecords = filteredDemands.filter(d => d.categoryType === 'new_demand');
  const pRecords = filteredDemands.filter(d => d.categoryType === 'plantation');
  const lRecords = filteredDemands.filter(d => d.categoryType === 'livelihood');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 mt-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top strip — gradient context bar */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-6 py-4 flex items-center gap-4 flex-wrap">
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white font-semibold text-sm bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition-all shrink-0"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="w-px h-6 bg-white/30 shrink-0" />

            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-white font-extrabold text-lg tracking-tight">
                All Demand Dashboard
              </span>
            </div>

            {/* Demand Counts */}
            <div className="ml-auto flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-white/20 px-3 py-1.5 rounded-lg">
                Total Records: {filteredDemands.length}
              </span>
            </div>
          </div>

          {/* Plan details ribbon */}
          <div className="px-8 py-3 bg-indigo-50/70 backdrop-blur-sm border-b border-indigo-100/80 flex items-center gap-10 flex-wrap">
            {[
              {
                label: "Plan ID",
                value: `#${planDetails?.plan_id || selectedPlan}`,
              },
              {
                label: "Plan Name",
                value: planDetails?.plan || "—",
              },
              {
                label: "Facilitator",
                value: planDetails?.facilitator_name || "—",
              },
              {
                label: "Village",
                value: planDetails?.village || "—",
              },
              {
                label: "Gram Panchayat",
                value: planDetails?.gram_panchayat || "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
                  {label}
                </span>
                <span className="text-sm font-bold text-slate-800 truncate max-w-[220px]">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Controls bar */}
          <div className="px-8 py-4 flex items-center gap-4 bg-white/60 backdrop-blur-md">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Search demand records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200/80 rounded-xl bg-white/60 backdrop-blur-sm placeholder-slate-400 focus:bg-white/90 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all text-sm shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-bold">Fetching demand records...</p>
          </div>
        ) : filteredDemands.length === 0 && demands.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xl max-w-2xl mx-auto mt-10">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Demand Records Found</h3>
            <p className="text-slate-500">
              There are no records matching your selection or search query in this plan.
            </p>
          </div>
        ) : (
          <div className="space-y-8 pb-12">
            <DemandTable
              title="Maintenance Demands"
              icon={Clipboard}
              records={mRecords}
              categoryType="maintenance"
              handleStatusChange={handleStatusChange}
              getStatusConfig={getStatusConfig}
            />

            <DemandTable
              title="New Demands"
              icon={Layers}
              records={nRecords}
              categoryType="new_demand"
              handleStatusChange={handleStatusChange}
              getStatusConfig={getStatusConfig}
            />

            <div className="border-t border-slate-200/80 pt-6">
              <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight px-2">
                Livelihood Demands
              </h2>
              
              <div className="space-y-6">
                <DemandTable
                  title="Plantation Demands"
                  icon={MapPin}
                  records={pRecords}
                  categoryType="plantation"
                  handleStatusChange={handleStatusChange}
                  getStatusConfig={getStatusConfig}
                />

                <DemandTable
                  title="Livelihood Demands (Others / Rest)"
                  icon={User}
                  records={lRecords}
                  categoryType="livelihood"
                  handleStatusChange={handleStatusChange}
                  getStatusConfig={getStatusConfig}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DemandStatus = () => {
  const [currentPage, setCurrentPage] = useState("selection");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [planDetails, setPlanDetails] = useState(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    try {
      const sessionUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "{}"
      );
      return !!sessionUser?.user?.is_superadmin;
    } catch {
      return false;
    }
  });

  const handleLoadDemandDashboard = (project, plan, planObj) => {
    setSelectedProject(project);
    setSelectedPlan(plan);
    setPlanDetails(planObj);
    setCurrentPage("dashboard");
  };

  const handleBack = () => {
    setCurrentPage("selection");
  };

  return currentPage === "selection" ? (
    <SelectionPage
      isSuperAdmin={isSuperAdmin}
      onLoadDemandDashboard={handleLoadDemandDashboard}
      selectedOrg={selectedOrg}
      setSelectedOrg={setSelectedOrg}
      selectedProject={selectedProject}
      setSelectedProject={setSelectedProject}
      selectedPlan={selectedPlan}
      setSelectedPlan={setSelectedPlan}
    />
  ) : (
    <DemandDashboard
      isSuperAdmin={isSuperAdmin}
      selectedProject={selectedProject}
      selectedPlan={selectedPlan}
      planDetails={planDetails}
      onBack={handleBack}
    />
  );
};

export default DemandStatus;
