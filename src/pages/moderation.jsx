import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import {
  Trash2,
  ChevronLeft,
  ChevronDown,
  Search,
  Calendar,
  User,
  Filter,
  Map as MapIcon,
  Grid,
  Home,
  Droplet,
  Waves,
  Mail,
  Send,
  FileText,
  Eye,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Circle, Fill, Stroke, Icon } from "ol/style";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import { toast } from "react-toastify";
import { getBlocks } from "./base_function";

import {
  BASEURL,
  CARD_DISPLAY_FIELDS,
  ICONS,
  FORM_CATEGORY_MAP,
  FORM_CATEGORY_ORDER,
  FORM_DISPLAY_NAMES,
  structureRules,
  getFormTemplate,
  shouldHideBeneficiaryName,
  stripSystemFields,
} from "./moderation/constants";
import { getDynamicMarkerIcon } from "./moderation/helper";

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

const SelectionPage = ({
  isSuperAdmin,
  onLoadSubmissions,
  selectedOrg,
  setSelectedOrg,
  selectedProject,
  setSelectedProject,
  initialProject = "",
  initialPlan = "",
  initialForm = "",
}) => {
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [forms, setForms] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [selectedForm, setSelectedForm] = useState(initialForm);
  const [blocksMap, setBlocksMap] = useState({});

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

  // Non-superadmin: fetch all projects once on mount
  useEffect(() => {
    if (isSuperAdmin) return;
    setProjectsLoading(true);
    fetch(`${BASEURL}api/v1/projects`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const list = data.data || data.projects || data;
        setProjects(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.log(err))
      .finally(() => setProjectsLoading(false));
  }, [isSuperAdmin]);

  // Superadmin: fetch projects filtered by org whenever selectedOrg changes
  useEffect(() => {
    if (!isSuperAdmin) return;
    if (!selectedOrg) {
      setProjects([]);
      return;
    }

    // Guard against out-of-order responses: a slower, earlier request must
    // never overwrite the projects for the currently selected org.
    const controller = new AbortController();
    const requestedOrg = selectedOrg;

    // Clear stale projects so the previous org's list never shows while the
    // filtered request is in flight.
    setProjects([]);
    setProjectsLoading(true);

    fetch(`${BASEURL}api/v1/projects?organization=${requestedOrg}`, {
      headers: getHeaders(),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        const list = data.data || data.projects || data;
        const all = Array.isArray(list) ? list : [];

        // Never trust the backend to scope results — filter client-side so
        // we only ever show projects belonging to the selected org. We exclude
        // anything we cannot positively confirm, so an unfiltered backend
        // response can never leak other orgs' projects into the dropdown.
        const norm = (v) => String(v ?? "").trim().toLowerCase();
        const orgName = organizations.find(
          (o) => String(o.id) === String(requestedOrg),
        )?.name;

        const scoped = all.filter((p) => {
          const projectOrgId =
            p.organization ?? p.organization_id ?? p.org ?? p.org_id;
          if (projectOrgId != null && String(projectOrgId) !== "") {
            return String(projectOrgId) === String(requestedOrg);
          }
          if (orgName) {
            return (
              norm(p.organization_name ?? p.organization?.name) ===
              norm(orgName)
            );
          }
          return false;
        });

        setProjects(scoped);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.log(err);
      })
      .finally(() => {
        // Ignore the stale request's completion so loading state reflects
        // only the latest org selection.
        if (!controller.signal.aborted) setProjectsLoading(false);
      });

    return () => controller.abort();
  }, [isSuperAdmin, selectedOrg, organizations]);

  useEffect(() => {
    fetch(`${BASEURL}api/v1/forms`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const list = data.forms || data.data || data;
        setForms(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.log("Forms Fetch Error", err));
  }, []);

  useEffect(() => {
    if (!initialProject) return;

    setPlansLoading(true);
    fetch(`${BASEURL}api/v1/projects/${initialProject}/watershed/plans/`, {
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
  }, [initialProject]);

  useEffect(() => {
    if (!initialPlan || plans.length === 0) return;

    const exists = plans.some((p) => p.plan_id === Number(initialPlan));

    if (exists) {
      setSelectedPlan(initialPlan);
    }
  }, [plans, initialPlan]);

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
    }));

  const handleProjectChange = (e) => {
    const id = e.target.value;

    setSelectedProject(id);
    setSelectedPlan("");
    setPlans([]);

    if (!id) return;

    setPlansLoading(true);
    fetch(`${BASEURL}api/v1/projects/${id}/watershed/plans/`, {
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
  };

  const groupFormsByCategory = (forms) => {
    const groups = {};
    forms.forEach((form) => {
      const category = FORM_CATEGORY_MAP[form.name] || "Other";
      if (!groups[category]) groups[category] = [];
      const displayName = FORM_DISPLAY_NAMES[form.name] || form.name;
      groups[category].push({ value: form.name, label: displayName });
    });

    return FORM_CATEGORY_ORDER.filter((cat) => groups[cat])
      .map((cat) => ({ label: cat, options: groups[cat] }))
      .concat(
        groups["Other"] ? [{ label: "Other", options: groups["Other"] }] : [],
      );
  };

  const handleLoadSubmissions = () => {
    if (!selectedForm || !selectedPlan) return;

    const planName =
      plans.find((p) => p.plan_id === Number(selectedPlan))?.plan ||
      "Unknown Plan";

    onLoadSubmissions(selectedProject, selectedPlan, selectedForm, planName);
  };

  const getPlanCategory = (plan) => {
    if (plan.is_completed) return "Completed";
    return "In Progress";
  };

  const PLAN_CATEGORY_ORDER = ["Completed", "In Progress"];

  const groupPlansForDropdown = (plans) => {
    const groups = {};

    plans.forEach((plan) => {
      const category = getPlanCategory(plan);
      if (!groups[category]) groups[category] = [];
      groups[category].push({ value: plan.plan_id, label: plan.plan, plan });
    });

    return PLAN_CATEGORY_ORDER
      .filter((cat) => groups[cat])
      .map((cat) => ({ label: cat, options: groups[cat] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight mt-10">
            Moderation Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Select project, plan, and form to review Forms
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
                  org
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
                  setSelectedForm("");
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
              loadingMessage={() => "Loading projects…"}
              noOptionsMessage={() =>
                isSuperAdmin && !selectedOrg
                  ? "Select an organization first"
                  : "No projects found"
              }
              options={projects.map((p) => ({
                value: p.id || p.project_id,
                label: p.project_name || p.name,
                p
              }))}
              value={
                selectedProject
                  ? projects
                    .map((p) => ({
                      value: p.id || p.project_id,
                      label: p.project_name || p.name,
                      p
                    }))
                    .find((p) => p.value === selectedProject)
                  : null
              }
              onChange={(opt) =>
                handleProjectChange({ target: { value: opt?.value || "" } })
              }
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
              loadingMessage={() => "Loading plans…"}
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
                    <div className="font-semibold text-slate-800 text-sm leading-snug">
                      {plan.plan}
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

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
              Select Form
            </label>
            <Select
              styles={selectStyles}
              placeholder="-- Choose Form --"
              options={groupFormsByCategory(forms)}
              value={
                selectedForm
                  ? forms
                      .map((form) => ({
                        value: form.name,
                        label: FORM_DISPLAY_NAMES[form.name] || form.name,
                      }))
                      .find((f) => f.value === selectedForm)
                  : null
              }
              onChange={(opt) => setSelectedForm(opt?.value || "")}
              isClearable
            />
          </div>
          <button
            onClick={handleLoadSubmissions}
            disabled={!selectedPlan || !selectedForm}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Page 2: Form View with SurveyJS
const FormViewPage = ({
  isSuperAdmin,
  user,
  selectedForm,
  selectedPlan,
  selectedPlanName,
  selectedProject,
  onFormChange,
  onBack,
}) => {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [moderationFilter, setModerationFilter] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [surveyModel, setSurveyModel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dprExpanded, setDprExpanded] = useState(false);
  const [dprEmail, setDprEmail] = useState("");
  const [dprLoading, setDprLoading] = useState(false);
  const [dprNotification, setDprNotification] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [planDetailsLoading, setPlanDetailsLoading] = useState(false);
  const [planReviewLoading, setPlanReviewLoading] = useState(false);
  const [planReviewNotification, setPlanReviewNotification] = useState(null);
  const [dprWorkflowStatus, setDprWorkflowStatus] = useState(null);
  const [dprWorkflowStatusLoading, setDprWorkflowStatusLoading] =
    useState(false);
  const [dprWorkflowMissing, setDprWorkflowMissing] = useState(false);
  const [dprWorkflowLoading, setDprWorkflowLoading] = useState("");
  const [dprWorkflowNotification, setDprWorkflowNotification] = useState(null);
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const popupRef = useRef(null);
  const overlayRef = useRef(null);
  const groups = Array.isArray(user?.groups) ? user.groups : [];
  const isAdmin = groups.some((g) => g.name === "Administrator");
  const isModerator = groups.some((g) => g.name === "Moderator");
  const showActions = isAdmin || isModerator || isSuperAdmin;
  const [validationResults, setValidationResults] = useState({});
  const [validationLoading, setValidationLoading] = useState({});
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("idle"); 
  const [deleteError, setDeleteError] = useState("");
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [formTemplateLoading, setFormTemplateLoading] = useState(false);


  useEffect(() => {
    fetch(`${BASEURL}api/v1/forms`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const list = data.forms || data.data || data;
        setForms(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.log("Forms Fetch Error", err));
  }, []);

  const groupedFormOptions = FORM_CATEGORY_ORDER.filter((category) =>
    forms.some(
      (form) => (FORM_CATEGORY_MAP[form.name] || "Other") === category,
    ),
  ).map((category) => ({
    label: category,
    options: forms
      .filter((form) => (FORM_CATEGORY_MAP[form.name] || "Other") === category)
      .map((form) => ({
        value: form.name,
        label: FORM_DISPLAY_NAMES[form.name] || form.name,
      })),
  }));

  useEffect(() => {
    if (!selectedProject || !selectedPlan) return;
    setPlanDetailsLoading(true);
    fetch(`${BASEURL}api/v1/projects/${selectedProject}/watershed/plans/`, {
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const plans = data?.data || data?.plans || data || [];
        const match = plans.find(
          (p) => (p.id || p.plan_id) === Number(selectedPlan),
        );
        if (match) setPlanDetails(match);
      })
      .catch((err) => console.error("Plan details fetch error", err))
      .finally(() => setPlanDetailsLoading(false));
  }, [selectedProject, selectedPlan]);

  useEffect(() => {
    if (!selectedPlan) return;

    setDprWorkflowStatus(null);
    setDprWorkflowMissing(false);
    setDprWorkflowNotification(null);
    setDprWorkflowStatusLoading(true);

    fetch(`${BASEURL}api/v1/dpr_data/${selectedPlan}/report-status/`, {
      headers: getHeaders(),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setDprWorkflowMissing(true);
          return null;
        }
        if (!res.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to fetch DPR workflow status.",
          );
        }
        return data;
      })
      .then((data) => {
        if (data) {
          setDprWorkflowStatus(data);
        }
      })
      .catch((err) => {
        console.error("DPR workflow fetch error", err);
        setDprWorkflowNotification({
          type: "error",
          message: err.message || "Failed to fetch DPR workflow status.",
        });
      })
      .finally(() => setDprWorkflowStatusLoading(false));
  }, [selectedPlan]);

    const reloadSubmissions = (resetToPage1 = false) => {
    if (viewMode === "map") {
      fetchSubmissions(1, "map");
    } else {
      const targetPage = resetToPage1 ? 1 : page;
      if (resetToPage1) setPage(1);
      fetchSubmissions(targetPage, "card");
    }
  };

  // Extract coordinates from submission
  const getCoordinates = (submission) => {
    if (!submission?.GPS_point) return null;

    const gps = submission.GPS_point;

    // GeoJSON point
    const geoPoint = gps.point_mapappearance || gps.point_mapsappearance;

    if (
      geoPoint &&
      Array.isArray(geoPoint.coordinates) &&
      geoPoint.coordinates.length === 2
    ) {
      const [lon, lat] = geoPoint.coordinates;

      if (!isNaN(lon) && !isNaN(lat)) {
        return [lon, lat];
      }
    }

    // fallback (very rare, just in case)
    if (gps.longitude && gps.latitude) {
      return [parseFloat(gps.longitude), parseFloat(gps.latitude)];
    }

    return null;
  };

  const getStructureType = (submission) => {
    if (selectedForm === "Waterbody") {
      return submission.select_one_water_structure;
    }

    if (selectedForm === "Groundwater" || selectedForm === "Agri") {
      return submission.TYPE_OF_WORK_ID;
    }

    if (selectedForm === "Well") {
      return "Well";
    }

    if (selectedForm === "Agri Maintenance") {
      return submission.select_one_irrigation_structure;
    }

    if (selectedForm === "GroundWater Maintenance") {
      return submission.TYPE_OF_WORK;
    }

    if (
      selectedForm === "Surface Water Body Maintenance" ||
      selectedForm === "Surface Water Body Remotely Sensed Maintenance"
    ) {
      return submission.select_one_recharge_structure;
    }

    return null;
  };

  const fetchValidationResult = async (submission) => {
    const coords = getCoordinates(submission);
    if (!coords) {
      toast.error("Latitude and Longitude are missing.");
      return;
    }

    const [lon, lat] = coords;

    const uuid = getSubmissionUUID(submission);

    if (validationResults[uuid]) return;

    const structureType = getStructureType(submission);
    const structureRule = structureRules[structureType];

    if (!lat || !lon) {
      toast.error("Latitude and Longitude are required.");
      return;
    }

    if (!structureRule) {
      toast.error("Structure type is missing or invalid.");
      return;
    }

    setValidationLoading((prev) => ({
      ...prev,
      [uuid]: true,
    }));

    try {
      const res = await fetch(
        `${BASEURL}api/v1/validate_site/?lat=${lat}&lon=${lon}&structure_type=${structureRule}`,
        { headers: getHeaders() },
      );

      const data = await res.json();

      const params = data?.evaluation?.parameters || {};

      const extracted = {};

      Object.keys(params).forEach((key) => {
        extracted[key] = params[key].category;
      });

      const finalDecision = data?.evaluation?.final_decision;

      setValidationResults((prev) => ({
        ...prev,
        [uuid]: {
          parameters: extracted,
          finalDecision: finalDecision,
        },
      }));
    } catch (err) {
      console.error("Validation API error:", err);
    } finally {
      setValidationLoading((prev) => ({
        ...prev,
        [uuid]: false,
      }));
    }
  };

  // Get marker icon based on form type and moderation status
  const getMarkerIcon = (formType, isModerated) => {
    // Determine which icon to use based on form name
    let iconSrc = ICONS["Settlement"];

    if (formType == "Settlement") {
      iconSrc = ICONS["Settlement"];
    } else if (formType == "Well") {
      iconSrc = ICONS["Well"];
    } else if (formType == "Waterbody") {
      iconSrc = ICONS["Waterbody"];
    } else if (formType == "Surface Water Body Remotely Sensed Maintenance") {
      iconSrc = ICONS["Waterbody"];
    } else if (formType == "Surface Water Body Maintenance") {
      iconSrc = ICONS["Waterbody"];
    } else if (
      formType.includes("Groundwater") ||
      formType.includes("GroundWater Maintenance")
    ) {
      iconSrc = ICONS["Groundwater"];
    } else if (formType == "Livelihood") {
      iconSrc = ICONS["Livelihood"];
    } else if (
      formType.includes("Agri") ||
      formType.includes("Agri Maintenance")
    ) {
      iconSrc = ICONS["Agri"];
    } else if (formType == "Crop") {
      iconSrc = ICONS["Crop"];
    } else if (formType == "Agrohorticulture") {
      iconSrc = ICONS["Agrohorticulture"];
    }

    return iconSrc;
  };

  // Generic function to analyze form schema and identify field types
const analyzeFormSchema = (schema) => {
  const fieldTypes = {};

  const analyzeElement = (element, parentName = "") => {
    const elementName =
      element.name.startsWith(parentName + "-")
        ? element.name
        : parentName
          ? `${parentName}-${element.name}`
          : element.name;

    if (element.type === "checkbox") {
      fieldTypes[elementName] = "checkbox";
      fieldTypes[element.name] = "checkbox"; // also register bare name
    } else if (element.type === "radiogroup") {
      fieldTypes[elementName] = "radio";
      fieldTypes[element.name] = "radio";
    } else if (element.type === "multipletext") {
      fieldTypes[elementName] = "multipletext";
      fieldTypes[element.name] = "multipletext";
    } else if (element.type === "panel") {
      if (element.elements) {
        element.elements.forEach((child) => {
          if (child.name.includes("-")) {
            analyzeElement(child, "");
          } else {
            analyzeElement(child, element.name);
          }
        });
      }
    }

    if (element.items && Array.isArray(element.items)) {
      fieldTypes[elementName] = "multipletext";
      fieldTypes[element.name] = "multipletext";
    }
  };

  if (schema.pages) {
    schema.pages.forEach((page) => {
      if (page.elements) {
        page.elements.forEach((element) => analyzeElement(element));
      }
    });
  }

  return fieldTypes;
};

  const buildChoiceMap = (schema) => {
  const choiceMap = {};
  const processElement = (element) => {
    if (
      (element.type === "radiogroup" ||
        element.type === "checkbox" ||
        element.type === "dropdown") &&
      Array.isArray(element.choices)
    ) {
      const map = {};
      element.choices.forEach((choice) => {
        if (typeof choice === "object" && choice.value !== undefined) {
          map[String(choice.value).toLowerCase().trim()] = choice.value;
          const text =
            typeof choice.text === "object"
              ? choice.text?.default ?? Object.values(choice.text)[0]
              : choice.text;
          if (text) map[String(text).toLowerCase().trim()] = choice.value;
        } else if (typeof choice === "string") {
          map[choice.toLowerCase().trim()] = choice;
        }
      });
      choiceMap[element.name] = map;
    }
    if (element.elements) element.elements.forEach(processElement);
  };
  if (schema.pages)
    schema.pages.forEach((page) =>
      (page.elements || []).forEach(processElement)
    );
  return choiceMap;
};

const resolveCheckboxValues = (rawString, fieldChoices) => {
  if (!rawString || typeof rawString !== "string") return [];
  const trimmed = rawString.trim();
  if (!trimmed) return [];
  if (!fieldChoices)
    return trimmed.split(" ").filter((v) => v.trim().length > 0);

  // Strategy 1: space-split — if ALL tokens match known values
  const spaceSplit = trimmed.split(" ").filter((v) => v.trim().length > 0);
  const allMatch = spaceSplit.every(
    (t) => fieldChoices[t.toLowerCase().trim()] !== undefined
  );
  if (allMatch)
    return spaceSplit.map((t) => fieldChoices[t.toLowerCase().trim()]);

  // Strategy 2: capital-letter split for multi-word values
  const capitalSplit = trimmed
    .split(/(?=[A-Z])/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  return capitalSplit.map((t) => fieldChoices[t.toLowerCase().trim()] ?? t);
};

const resolveRadioValue = (rawValue, fieldChoices) => {
  if (!rawValue || typeof rawValue !== "string") return rawValue;
  if (!fieldChoices) return rawValue;
  const resolved = fieldChoices[rawValue.toLowerCase().trim()];
  return resolved !== undefined ? resolved : rawValue;
};
  // Transform API data to SurveyJS format
const transformApiToSurvey = (submission, formSchema) => {
  const fieldTypes = analyzeFormSchema(formSchema);
  const choiceMap = buildChoiceMap(formSchema);
  const transformedData = { ...submission };

  const processObject = (obj, parentKey = "") => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}-${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        // GPS_point special handling
        if (key === "GPS_point") {
          const coordsObj =
            value.point_mapsappearance || value.point_mapappearance;
          if (coordsObj?.coordinates) {
            const coords = coordsObj.coordinates;
            transformedData["GPS_point"] = {
              longitude: coords[0],
              latitude: coords[1],
            };
            return;
          }
          if (value.latitude !== undefined && value.longitude !== undefined) {
            transformedData["GPS_point"] = value;
            return;
          }
        }

        if (value.latitude !== undefined && value.longitude !== undefined) {
          transformedData[fullKey] = value;
          return;
        }

        // multipletext → keep as nested object, never flatten
        const isMultipleText =
          fieldTypes[key] === "multipletext" ||
          fieldTypes[fullKey] === "multipletext";

        if (isMultipleText) {
          transformedData[key] = value;
          return;
        }

        // Regular nested object (panel) → flatten with "-" separator
        processObject(value, key);
      } else {
        if (typeof value === "string" && value.trim().length > 0) {
          const fieldType = fieldTypes[fullKey] || fieldTypes[key];
          const fieldChoices = choiceMap[fullKey] || choiceMap[key];

          if (fieldType === "checkbox") {
            transformedData[fullKey] = resolveCheckboxValues(value, fieldChoices);
          } else if (fieldType === "radio") {
            transformedData[fullKey] = resolveRadioValue(value, fieldChoices);
          } else {
            // text/number input — use as-is
            transformedData[fullKey] = value;
          }
        } else {
          // null, undefined, number, boolean — pass through directly
          transformedData[fullKey] = value;
        }
      }
    });
  };

  processObject(submission);

  // Legacy key mappings
  const legacyKeyMap = {
    "Livestock-is_demand_livestock": "select_one_demand_promoting_livestock",
    "Livestock-demands_promoting_livestock": "select_one_promoting_livestock",
    "Livestock-select_one_promoting_livestock_other":
      "select_one_promoting_livestock_other",
    "kitchen_gardens-area_kg": "area_didi_badi",
    "kitchen_gardens-assets_kg": "indi_assets",
    "fisheries-is_demand_fisheries": "select_one_demand_promoting_fisheries",
    "fisheries-demands_promoting_fisheries": "select_one_promoting_fisheries",
    "fisheries-demands_promoting_fisheries_other":
      "select_one_promoting_fisheries_other",
  };

  Object.entries(legacyKeyMap).forEach(([newKey, oldKey]) => {
    const oldValue = submission[oldKey];
    const currentValue = transformedData[newKey];
    const isCurrentEmpty =
      currentValue === null || currentValue === undefined || currentValue === "";
    const isOldValueReal =
      oldValue !== null && oldValue !== undefined && oldValue !== "";
    if (isCurrentEmpty && isOldValueReal) {
      transformedData[newKey] = oldValue;
    }
  });

  return transformedData;
};

  // Transform SurveyJS data back to API format
  const transformSurveyToApi = (surveyData, originalSubmission, formSchema) => {
    const fieldTypes = analyzeFormSchema(formSchema);
    const saveData = { ...surveyData };
    const nestedData = {};

    Object.keys(saveData).forEach((key) => {
      if (key.includes("-")) {
        const [parent, child] = key.split("-");
        if (!nestedData[parent]) {
          nestedData[parent] = {};
        }

        const fieldType = fieldTypes[key];
        const value = saveData[key];

        if (Array.isArray(value) && fieldType === "checkbox") {
          nestedData[parent][child] = value.join(" ");
        } else {
          nestedData[parent][child] = value;
        }
        delete saveData[key];
      }
    });

    if (
      saveData.GPS_point &&
      saveData.GPS_point.latitude &&
      saveData.GPS_point.longitude
    ) {
      const originalGPS = originalSubmission.GPS_point;

      if (originalGPS) {
        const coordsKey = originalGPS.point_mapsappearance
          ? "point_mapsappearance"
          : "point_mapappearance";

        nestedData.GPS_point = {
          ...originalGPS,
          [coordsKey]: {
            type: "Point",
            coordinates: [
              parseFloat(saveData.GPS_point.longitude),
              parseFloat(saveData.GPS_point.latitude),
            ],
          },
        };
      } else {
        nestedData.GPS_point = saveData.GPS_point;
      }
      delete saveData.GPS_point;
    }

    Object.keys(nestedData).forEach((parent) => {
      saveData[parent] = nestedData[parent];
    });

    return saveData;
  };

  // Helper function to get nested field value from submission
  const getFieldValue = (submission, fieldKey) => {
    const isValidValue = (val) => {
      if (val === null || val === undefined || val === "") return false;
      if (typeof val === "object" && !Array.isArray(val)) return false;
      if (typeof val === "string" && /^\d+\.\d{10,}$/.test(val)) return false;
      return true;
    };

    // 1. Direct key
    const directValue = submission[fieldKey];
    if (isValidValue(directValue)) return directValue;

    if (fieldKey.includes("-")) {
      const [parent, child] = fieldKey.split("-");
      if (submission[parent]) {
        const nestedValue = submission[parent][child];
        if (isValidValue(nestedValue)) return nestedValue;
      }
    }

    const legacyFallback = {
      "Livestock-is_demand_livestock": "select_one_demand_promoting_livestock",
      "Livestock-demands_promoting_livestock": "select_one_promoting_livestock",
      "Livestock-select_one_promoting_livestock_other":
        "select_one_promoting_livestock_other",
      "kitchen_gardens-area_kg": "area_didi_badi",
      "kitchen_gardens-assets_kg": "indi_assets",
      "fisheries-is_demand_fisheries": "select_one_demand_promoting_fisheries",
      "fisheries-demands_promoting_fisheries": "select_one_promoting_fisheries",
      "fisheries-demands_promoting_fisheries_other":
        "select_one_promoting_fisheries_other",
    };

    const legacyKey = legacyFallback[fieldKey];
    if (legacyKey && isValidValue(submission[legacyKey])) {
      return submission[legacyKey];
    }

    // 4. Nested paths
    const nestedPaths = [
      `data.${fieldKey}`,
      `data_settlement.${fieldKey}`,
      `data_well.${fieldKey}`,
      `data_waterbody.${fieldKey}`,
    ];

    for (const path of nestedPaths) {
      const keys = path.split(".");
      let value = submission;
      let found = true;
      for (const key of keys) {
        if (value && typeof value === "object" && value[key] !== undefined) {
          value = value[key];
        } else {
          found = false;
          break;
        }
      }
      if (found && isValidValue(value)) return value;
    }

    return "-";
  };

  // Helper to get UUID from submission
  const getSubmissionUUID = (submission) => {
    if (submission.__id) {
      return submission.__id;
    }
    if (submission.meta?.instanceID) {
      return submission.meta.instanceID;
    }
    if (submission.uuid) {
      return submission.uuid;
    }
    return null;
  };

  const formatToIST = (utcDate) => {
    if (!utcDate) return "-";
    const date = new Date(utcDate);
    const options = {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-IN", options).replace(",", "") + " IST";
  };

  const fetchSubmissions = async (pg = 1, mode = "card") => {
    if (!selectedForm || !selectedPlan) return;

    const url =
      mode === "map"
        ? `${BASEURL}api/v1/submissions/${selectedForm}/${selectedPlan}/`
        : `${BASEURL}api/v1/submissions/${selectedForm}/${selectedPlan}/?page=${pg}`;

    try {
      const res = await fetch(url, {
        headers: getHeaders(),
      });

      const data = await res.json();

      const submissionsWithFlags = (data.data || []).map((item) => {
        if (Array.isArray(item)) {
          const submission = { ...item[0], _moderated: item[1] };
          if (!submission.__id && item[2]) {
            submission.__id = item[2];
          }
          return submission;
        }
        return item;
      });

      setSubmissions(submissionsWithFlags);

      // pagination is only for card
      if (mode === "card") {
        setPage(data.page || pg);
        setTotalPages(data.total_pages || 1);
      } else {
        setPage(1);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Submission Fetch Error", err);
    }
  };

  useEffect(() => {
    if (viewMode === "map") {
      fetchSubmissions(1, "map");
    } else {
      fetchSubmissions(page, "card");
    }
  }, [viewMode, selectedForm, selectedPlan, page]);

  useEffect(() => {
    setSearchTerm("");
    setModerationFilter("all");
    setSelectedSubmission(null);
    setSurveyModel(null);
    setPage(1);
  }, [selectedForm]);

  // Filter submissions - MOVED BEFORE useEffect hooks that use it
  const filteredSubmissions = submissions.filter((sub) => {
    // Apply search filter
    const searchString = JSON.stringify(sub).toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    // Apply moderation filter
    let matchesModeration = true;
    if (moderationFilter === "moderated") {
      matchesModeration = sub._moderated === true;
    } else if (moderationFilter === "not-moderated") {
      matchesModeration = sub._moderated === false;
    }

    return matchesSearch && matchesModeration;
  });

  // Initialize map
  useEffect(() => {
    if (viewMode !== "map" || !mapElement.current || mapRef.current) return;

    const baseLayer = new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      }),
      zIndex: 0,
    });

    const view = new View({
      projection: "EPSG:4326",
      center: [80, 23.5],
      zoom: 12,
    });

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 1,
    });

    const map = new Map({
      target: mapElement.current,
      view,
      layers: [baseLayer, vectorLayer],
    });

    // Create popup overlay
    const overlay = new Overlay({
      element: popupRef.current,
      positioning: "bottom-center",
      stopEvent: true,
      offset: [0, -15],
    });
    map.addOverlay(overlay);

    mapRef.current = map;
    vectorLayerRef.current = vectorLayer;
    overlayRef.current = overlay;

    // Click handler for markers
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature,
      );
      if (feature) {
        const submission = feature.get("submission");
        const coordinates = feature.getGeometry().getCoordinates();

        // Show popup
        overlayRef.current.setPosition(coordinates);

        // You can customize what's shown in the popup
        const displayFields = CARD_DISPLAY_FIELDS[selectedForm] || [];
        let popupContent =
          '<div class="bg-white rounded-lg shadow-xl p-4 min-w-[280px] max-w-[350px]">';
        popupContent += `<div class="font-bold text-lg mb-3 text-indigo-600 border-b border-slate-200 pb-2">Submission Details</div>`;

        displayFields.slice(0, 3).forEach((field) => {
          const value = getFieldValue(submission, field.key);
          popupContent += `<div class="mb-2"><span class="text-xs text-slate-500 font-semibold">${field.label}:</span><br/><span class="text-sm text-slate-900">${value}</span></div>`;
        });

        popupContent += `<div class="mt-4 pt-3 border-t border-slate-200 flex gap-2">`;
        popupContent += `<button class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all" onclick="window.viewSubmissionFromMap('${getSubmissionUUID(submission)}')">View</button>`;

        // Add Edit and Delete buttons if user has permissions
        if (showActions) {
          popupContent += `<button class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all" onclick="window.editSubmissionFromMap('${getSubmissionUUID(submission)}')">Edit</button>`;

          if (isAdmin || isSuperAdmin) {
            popupContent += `<button class="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all" onclick="window.deleteSubmissionFromMap('${getSubmissionUUID(submission)}')">Delete</button>`;
          }
        }

        popupContent += `</div>`;
        popupContent += "</div>";

        popupRef.current.innerHTML = popupContent;
        popupRef.current.style.display = "block";
      } else {
        popupRef.current.style.display = "none";
      }
    });

    // Close popup on map move
    map.on("movestart", () => {
      popupRef.current.style.display = "none";
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
        mapRef.current = null;
      }
    };
  }, [viewMode]);

  // Update markers when submissions change
  useEffect(() => {
    if (viewMode !== "map" || !vectorLayerRef.current) return;

    const vectorSource = vectorLayerRef.current.getSource();
    vectorSource.clear();

    const features = [];
    const validCoords = [];

    filteredSubmissions.forEach((submission) => {
      const coords = getCoordinates(submission);
      if (
        coords &&
        coords.length === 2 &&
        !isNaN(coords[0]) &&
        !isNaN(coords[1])
      ) {
        const feature = new Feature({
          geometry: new Point(coords),
          submission: submission,
        });

        const isModerated = submission._moderated === true;
        // const iconSrc = getMarkerIcon(selectedForm, isModerated);
        const iconSrc = getDynamicMarkerIcon(selectedForm, submission);

        // icon ko alag se add karo (same as before)
        feature.setStyle([
          new Style({
            image: new Circle({
              radius: 22,
              fill: new Fill({ color: "rgba(255,255,255,0)" }),
              stroke: new Stroke({
                color: isModerated ? "#22c55e" : "#facc15",
                width: 3,
              }),
            }),
          }),
          new Style({
            image: new Icon({
              src: `${iconSrc}#${submission.__id || Date.now()}`,
              scale: 0.5,
              anchor: [0.5, 0.5],
              anchorXUnits: "fraction",
              anchorYUnits: "fraction",
            }),
          }),
        ]);

        features.push(feature);
        validCoords.push(coords);
      }
    });

    vectorSource.addFeatures(features);

    // Fit map to show all markers
    if (validCoords.length > 0 && mapRef.current) {
      const extent = vectorSource.getExtent();
      mapRef.current.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 16,
        duration: 1000,
      });
    }
  }, [filteredSubmissions, viewMode, selectedForm]);

  // Global function to view submission from map popup
  useEffect(() => {
    window.viewSubmissionFromMap = (uuid) => {
      const submission = submissions.find((s) => getSubmissionUUID(s) === uuid);
      if (submission) handleViewSubmission(submission); // async, fine to call without await
    };

    window.editSubmissionFromMap = (uuid) => {
      const submission = submissions.find((s) => getSubmissionUUID(s) === uuid);
      if (submission) handleEditSubmission(submission);
    };

    window.deleteSubmissionFromMap = (uuid) => {
      const submission = submissions.find((s) => getSubmissionUUID(s) === uuid);
      if (submission) {
        handleDelete(submission);
      }
    };

    return () => {
      delete window.viewSubmissionFromMap;
      delete window.editSubmissionFromMap;
      delete window.deleteSubmissionFromMap;
    };
  }, [submissions]);

const handleViewSubmission = async (submission) => {
  setFormTemplateLoading(true);
  const formTemplate = await getFormTemplate(selectedForm);
  setFormTemplateLoading(false);
  if (!formTemplate) {
    alert(`No template found for form: ${selectedForm}`);
    return;
  }

  const cleanTemplate = stripSystemFields(formTemplate);
  const transformedData = transformApiToSurvey(submission, formTemplate);

  setSelectedSubmission(submission);
  setIsEditing(false);

  const model = new Model(cleanTemplate);
  model.mode = "display";
  model.data = transformedData;
  setSurveyModel(model);
};


const handleEditSubmission = async (submission) => {
  setFormTemplateLoading(true);
  const formTemplate = await getFormTemplate(selectedForm);
  setFormTemplateLoading(false);
  if (!formTemplate) {
    alert(`No template found for form: ${selectedForm}`);
    return;
  }

  const cleanTemplate = stripSystemFields(formTemplate);
  const transformedData = transformApiToSurvey(submission, formTemplate);

  setSelectedSubmission(submission);
  setIsEditing(true);

  const model = new Model(cleanTemplate);
  model.showCompletedPage = false;
  model.data = transformedData;

  model.onComplete.add((sender) => {
    const saveData = transformSurveyToApi(
      sender.data,
      submission,
      formTemplate,
    );
    const uuid = getSubmissionUUID(submission);
    handleSaveSubmission(uuid, saveData);
  });

  setSurveyModel(model);
};

const handleSaveSubmission = async (uuid, data) => {
  setSaveStatus("saving");
  setSaveError("");
  try {
    const response = await fetch(
      `${BASEURL}api/v1/submissions/${selectedForm}/${uuid}/modify/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(data),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      setSaveStatus("error");
      setSaveError(result?.message || result?.error || "Save failed. Please try again.");
      return;
    }

    setSaveStatus("success");
    reloadSubmissions(true);

    // Auto close after 1.5s on success
    setTimeout(() => {
      setSelectedSubmission(null);
      setSurveyModel(null);
      setSaveStatus("idle");
    }, 1500);

  } catch (error) {
    console.error("Save error:", error);
    setSaveStatus("error");
    setSaveError("Network error. Please try again.");
  }
};

  const handleValidateSubmission = async (submission) => {
    const uuid = getSubmissionUUID(submission);

    if (!uuid) return;

    await fetchValidationResult(submission);
  };

  const handleDelete = (submission) => {
    setSubmissionToDelete(submission);
    setDeleteStatus("confirm");
  };

  const confirmDelete = async () => {
    if (!submissionToDelete) return;

    const uuid = getSubmissionUUID(submissionToDelete);
    if (!uuid) {
      setDeleteStatus("error");
      setDeleteError("Could not find submission UUID.");
      return;
    }

    setDeleteStatus("deleting");

    try {
      const response = await fetch(
        `${BASEURL}api/v1/submissions/${selectedForm}/${uuid}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setDeleteStatus("error");
        setDeleteError(data?.message || data?.error || "Delete failed. Please try again.");
        return;
      }

      setDeleteStatus("success");
      reloadSubmissions(true);

      // Auto close after 1.5s
      setTimeout(() => {
        setSubmissionToDelete(null);
        setDeleteStatus("idle");
      }, 1500);

    } catch (error) {
      console.error("Delete error:", error);
      setDeleteStatus("error");
      setDeleteError("Network error. Please try again.");
    }
};

  const handleGenerateDPR = async () => {
    if (!dprEmail || !selectedPlan) return;
    setDprLoading(true);
    setDprNotification(null);
    try {
      const response = await fetch(`${BASEURL}api/v1/generate_dpr/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          plan_id: Number(selectedPlan),
          email_id: dprEmail,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setDprNotification({
          type: "success",
          message: data.message || "DPR generation request sent successfully!",
        });
        setDprEmail("");
        setDprExpanded(false);
      } else {
        setDprNotification({
          type: "error",
          message: data.message || data.error || "Failed to send DPR request.",
        });
      }
    } catch (err) {
      console.error("DPR error:", err);
      setDprNotification({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setDprLoading(false);
      setTimeout(() => setDprNotification(null), 5000);
    }
  };

  const handleDprWorkflowUpdate = async (field, value, loadingKey = field) => {
    if (!selectedPlan) return;

    setDprWorkflowLoading(loadingKey);
    setDprWorkflowNotification(null);

    try {
      const response = await fetch(
        `${BASEURL}api/v1/dpr_data/${selectedPlan}/report-status/`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({ [field]: value }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to update DPR workflow status.",
        );
      }

      setDprWorkflowStatus(data);
      setDprWorkflowMissing(false);
      setDprWorkflowNotification({
        type: "success",
        message: "DPR workflow status updated successfully.",
      });
    } catch (error) {
      console.error("DPR workflow update error:", error);
      setDprWorkflowNotification({
        type: "error",
        message: error.message || "Failed to update DPR workflow status.",
      });
    } finally {
      setDprWorkflowLoading("");
      setTimeout(() => setDprWorkflowNotification(null), 4000);
    }
  };

  const handlePlanStatusToggle = async (field, value, label) => {
    if (!selectedProject || !selectedPlan) return;

    setPlanReviewLoading(true);
    setPlanReviewNotification(null);

    try {
      const response = await fetch(
        `${BASEURL}api/v1/projects/${selectedProject}/watershed/plans/${selectedPlan}/`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({ [field]: value }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || `Failed to update ${label} status.`,
        );
      }

      setPlanDetails((prev) => ({
        ...prev,
        ...(data?.data || data),
        [field]: value,
      }));
      setPlanReviewNotification({
        type: "success",
        message: `${label} status updated.`,
      });
    } catch (error) {
      console.error("Plan review update error:", error);
      setPlanReviewNotification({
        type: "error",
        message: error.message || `Failed to update ${label} status.`,
      });
    } finally {
      setPlanReviewLoading(false);
      setTimeout(() => setPlanReviewNotification(null), 4000);
    }
  };


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

            {/* Form */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider shrink-0">
                Form
              </span>
              <div className="min-w-[260px] max-w-[420px] flex-1">
                <Select
                  styles={{
                    ...selectStyles,
                    control: (base, state) => ({
                      ...selectStyles.control(base, state),
                      minHeight: "42px",
                      backgroundColor: "rgba(255,255,255,0.95)",
                      borderColor: state.isFocused ? "#c7d2fe" : "#bfdbfe",
                      boxShadow: state.isFocused
                        ? "0 0 0 3px rgba(255,255,255,0.15)"
                        : "none",
                    }),
                    menu: (base) => ({
                      ...selectStyles.menu(base),
                      zIndex: 80,
                    }),
                  }}
                  options={groupedFormOptions}
                  value={groupedFormOptions
                    .flatMap((group) => group.options)
                    .find((option) => option.value === selectedForm)}
                  onChange={(opt) => onFormChange(opt?.value || "")}
                  isSearchable
                  placeholder="Switch form..."
                />
              </div>
            </div>

            {/* Submission counts pushed to the right */}
            <div className="ml-auto flex items-center gap-4 shrink-0">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                {filteredSubmissions.filter((s) => !s._moderated).length}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                {filteredSubmissions.filter((s) => s._moderated).length}{" "}
                Moderated
              </span>
            </div>
          </div>

          {/* Plan details ribbon */}
          <div className="px-8 py-3 bg-indigo-50/70 backdrop-blur-sm border-b border-indigo-100/80 flex items-center gap-10 flex-wrap">
            {[
              {
                label: "Plan ID",
                value: `#${planDetails?.id || planDetails?.plan_id || selectedPlan}`,
              },
              {
                label: "Plan Name",
                value: planDetails?.plan || selectedPlanName || "—",
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
                value:
                  planDetails?.gram_panchayat || planDetails?.gp_name || "—",
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

          {/* Bottom strip — controls bar */}
          <div className="px-8 py-4 flex items-center gap-4 bg-white/60 backdrop-blur-md">
            {/* Card / Map toggle */}
            <div className="flex bg-white/70 backdrop-blur-sm border border-slate-200/80 rounded-xl p-1 shrink-0 shadow-sm">
              <button
                onClick={() => setViewMode("card")}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                  viewMode === "card"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/80"
                }`}
              >
                <Grid size={15} />
                Card
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                  viewMode === "map"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/80"
                }`}
              >
                <MapIcon size={15} />
                Map
              </button>
            </div>

            <div className="w-px h-6 bg-slate-200/80 shrink-0" />

            {/* Search — expands to fill remaining space */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200/80 rounded-xl bg-white/60 backdrop-blur-sm placeholder-slate-400 focus:bg-white/90 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all text-sm shadow-sm"
              />
            </div>

            {/* Moderation filter — pinned to right */}
            <div className="relative shrink-0">
              <Filter
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <select
                value={moderationFilter}
                onChange={(e) => setModerationFilter(e.target.value)}
                className="pl-10 pr-10 py-2.5 border border-slate-200/80 rounded-xl bg-white/60 backdrop-blur-sm focus:bg-white/90 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all text-sm font-medium text-slate-700 appearance-none shadow-sm cursor-pointer"
              >
                <option value="all">All Submissions</option>
                <option value="moderated">Moderated</option>
                <option value="not-moderated">Pending</option>
              </select>
            </div>
          </div>

          {/* Third row — DPR details */}
          <div className="px-8 py-3 border-t border-slate-100/80 bg-white/40 backdrop-blur-md">
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
                    DPR Details
                  </p>
                </div>
                <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                  <FileText size={18} />
                </div>
              </div>

              <div className="mt-5">
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDprExpanded(!dprExpanded)}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all shrink-0 shadow-sm border ${
                        dprExpanded
                          ? "bg-violet-600 text-white border-violet-600 shadow-md"
                          : "bg-white/70 backdrop-blur-sm border-slate-200/80 text-slate-700 hover:border-violet-400 hover:text-violet-600"
                      }`}
                    >
                      <FileText size={15} />
                      Generate DPR
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${dprExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl px-4 py-2 text-sm shrink-0 shadow-sm">
                      <span className="text-slate-400 font-medium">Plan</span>
                      <span className="w-px h-4 bg-slate-200" />
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">
                        {selectedPlanName}
                      </span>
                      <span className="w-px h-4 bg-slate-200" />
                      <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                        #{selectedPlan}
                      </span>
                    </div>
                  </div>

                  {dprExpanded && (
                    <div className="mt-4 flex flex-col gap-3 animate-in fade-in slide-in-from-left-2 duration-200 sm:flex-row sm:items-center">
                      <div className="relative flex-1">
                        <Mail
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="email"
                          placeholder="Enter email address to receive the DPR..."
                          value={dprEmail}
                          onChange={(e) => setDprEmail(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleGenerateDPR()
                          }
                          className="pl-10 pr-4 py-2.5 w-full border border-slate-200/80 rounded-xl bg-white/60 backdrop-blur-sm placeholder-slate-400 focus:bg-white/90 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all text-sm shadow-sm"
                        />
                      </div>

                      <button
                        onClick={handleGenerateDPR}
                        disabled={!dprEmail || dprLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all shrink-0"
                      >
                        {dprLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            Send Request
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {planDetailsLoading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-white/70 backdrop-blur-[1px]">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                        <span className="text-sm font-medium text-slate-600">
                          Updating…
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                          Review status
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              Is DPR Completed?
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handlePlanStatusToggle(
                                "is_completed",
                                !planDetails?.is_completed,
                                "Plan completed",
                              )
                            }
                            disabled={planReviewLoading}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${
                              planDetails?.is_completed
                                ? "bg-blue-700"
                                : "bg-slate-300"
                            } ${
                              planReviewLoading
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                            aria-pressed={Boolean(planDetails?.is_completed)}
                            aria-label="Is Plan Completed?"
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                planDetails?.is_completed
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              Is DPR Reviewed?
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handlePlanStatusToggle(
                                "is_dpr_reviewed",
                                !planDetails?.is_dpr_reviewed,
                                "Plan reviewed",
                              )
                            }
                            disabled={planReviewLoading}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${
                              planDetails?.is_dpr_reviewed
                                ? "bg-blue-700"
                                : "bg-slate-300"
                            } ${
                              planReviewLoading
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                            aria-pressed={Boolean(planDetails?.is_dpr_reviewed)}
                            aria-label="Is DPR Reviewed?"
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                planDetails?.is_dpr_reviewed
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {planReviewNotification && (
                      <div
                        className={`mx-5 mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                          planReviewNotification.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-red-200 bg-red-50 text-red-800"
                        }`}
                      >
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{planReviewNotification.message}</span>
                      </div>
                    )}
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {dprWorkflowStatusLoading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-white/70 backdrop-blur-[1px]">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                        <span className="text-sm font-medium text-slate-600">
                          Updating…
                        </span>
                      </div>
                    )}
                    <div className="border-b border-slate-200 px-5 py-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                        DPR workflow
                      </h4>
                    </div>

                    <div className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              DPR Submitted
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              dprWorkflowStatus?.status !== "SUBMITTED" &&
                              handleDprWorkflowUpdate(
                                "status",
                                "SUBMITTED",
                                "status-submitted",
                              )
                            }
                            disabled={
                              dprWorkflowMissing ||
                              dprWorkflowLoading === "status-submitted"
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${
                              dprWorkflowStatus?.status === "SUBMITTED"
                                ? "bg-blue-700"
                                : "bg-slate-300"
                            } ${
                              dprWorkflowMissing ||
                              dprWorkflowLoading === "status-submitted"
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                            aria-pressed={
                              dprWorkflowStatus?.status === "SUBMITTED"
                            }
                            aria-label="DPR submitted"
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                dprWorkflowStatus?.status === "SUBMITTED"
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3">
                          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Demands Submitted
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                  {dprWorkflowStatus?.submitted_breakdown
                                    ?.demands_submitted ?? 0}{" "}
                                  records
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900">
                                DPR Approved
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                dprWorkflowStatus?.status !== "APPROVED" &&
                                handleDprWorkflowUpdate(
                                  "status",
                                  "APPROVED",
                                  "status-approved",
                                )
                              }
                              disabled={
                                dprWorkflowMissing ||
                                dprWorkflowLoading === "status-approved"
                              }
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${
                                dprWorkflowStatus?.status === "APPROVED"
                                  ? "bg-emerald-700"
                                  : "bg-slate-300"
                              } ${
                                dprWorkflowMissing ||
                                dprWorkflowLoading === "status-approved"
                                  ? "cursor-not-allowed opacity-60"
                                  : "cursor-pointer"
                              }`}
                              aria-pressed={
                                dprWorkflowStatus?.status === "APPROVED"
                              }
                              aria-label="DPR approved"
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                  dprWorkflowStatus?.status === "APPROVED"
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900">
                                DPR Rejected
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                dprWorkflowStatus?.status !== "REJECTED" &&
                                handleDprWorkflowUpdate(
                                  "status",
                                  "REJECTED",
                                  "status-rejected",
                                )
                              }
                              disabled={
                                dprWorkflowMissing ||
                                dprWorkflowLoading === "status-rejected"
                              }
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${
                                dprWorkflowStatus?.status === "REJECTED"
                                  ? "bg-red-700"
                                  : "bg-slate-300"
                              } ${
                                dprWorkflowMissing ||
                                dprWorkflowLoading === "status-rejected"
                                  ? "cursor-not-allowed opacity-60"
                                  : "cursor-pointer"
                              }`}
                              aria-pressed={
                                dprWorkflowStatus?.status === "REJECTED"
                              }
                              aria-label="DPR rejected"
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                  dprWorkflowStatus?.status === "REJECTED"
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {dprWorkflowMissing && (
                  <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    DPR report has not been generated for this plan yet.
                  </div>
                )}

                {dprWorkflowNotification && (
                  <div
                    className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                      dprWorkflowNotification.type === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{dprWorkflowNotification.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating toast notification */}
      {dprNotification && (
        <div
          className={`fixed top-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md max-w-sm transition-all animate-in fade-in slide-in-from-top-3 duration-300 ${
            dprNotification.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
              : "bg-red-50/90 border-red-200 text-red-900"
          }`}
        >
          <div
            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              dprNotification.type === "success"
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          >
            {dprNotification.type === "success" ? (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">
              {dprNotification.type === "success"
                ? "Request Sent!"
                : "Request Failed"}
            </p>
            <p className="text-sm mt-0.5 opacity-80">
              {dprNotification.message}
            </p>
          </div>
          <button
            onClick={() => setDprNotification(null)}
            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Modal for viewing/editing submission */}
      {selectedSubmission && surveyModel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  {isEditing ? "Edit Submission" : "View Submission"}
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  Submitted:{" "}
                  {formatToIST(
                    selectedSubmission.__system?.submissionDate ||
                      selectedSubmission.submission_time,
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setSurveyModel(null);
                  setSaveStatus("idle");
                  setSaveError("");
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Survey content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <Survey model={surveyModel} />
            </div>

            {/* Status overlay — covers form during save/success/error */}
            {saveStatus !== "idle" && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                {saveStatus === "saving" && (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-bold text-slate-700">Saving changes...</p>
                    <p className="text-sm text-slate-500 mt-1">Please wait</p>
                  </div>
                )}

                {saveStatus === "success" && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-slate-700">Saved successfully!</p>
                  </div>
                )}

                {saveStatus === "error" && (
                  <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-slate-700">Save failed</p>
                    <p className="text-sm text-red-600 mt-1 mb-5">{saveError}</p>
                    <button
                      onClick={() => {
                        setSaveStatus("idle");
                        setSaveError("");
                      }}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all"
                    >
                      Go back
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Delete confirmation / status modal */}
      {submissionToDelete && deleteStatus !== "idle" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-red-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-xl font-black">Delete Submission</h2>
              {/* Only show close on confirm/error, not while deleting */}
              {deleteStatus !== "deleting" && deleteStatus !== "success" && (
                <button
                  onClick={() => {
                    setSubmissionToDelete(null);
                    setDeleteStatus("idle");
                    setDeleteError("");
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="p-8 text-center">

              {/* Confirm state */}
              {deleteStatus === "confirm" && (
                <>
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-rose-600" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 mb-2">
                    Are you sure?
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    This submission will be permanently deleted and cannot be recovered.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setSubmissionToDelete(null);
                        setDeleteStatus("idle");
                        setDeleteError("");
                      }}
                      className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-semibold text-sm hover:bg-rose-700 transition-all"
                    >
                      Yes, delete it
                    </button>
                  </div>
                </>
              )}

              {/* Deleting state */}
              {deleteStatus === "deleting" && (
                <>
                  <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-700">Deleting...</p>
                  <p className="text-sm text-slate-500 mt-1">Please wait</p>
                </>
              )}

              {/* Success state */}
              {deleteStatus === "success" && (
                <>
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-slate-700">Deleted successfully!</p>
                </>
              )}

              {/* Error state */}
              {deleteStatus === "error" && (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-slate-700">Delete failed</p>
                  <p className="text-sm text-red-600 mt-1 mb-5">{deleteError}</p>
                  <button
                    onClick={() => {
                      setDeleteStatus("confirm");
                      setDeleteError("");
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all"
                  >
                    Try again
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Map View or Card View */}
      <div className="max-w-7xl mx-auto">
        {viewMode === "map" ? (
          /* Map View */
          <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden">
            {/* Map Stats Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b-2 border-slate-200 flex items-center justify-between">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-600"></div>
                  <span className="text-sm font-bold text-slate-700">
                    {filteredSubmissions.filter((s) => !s._moderated).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-400 border-2 border-green-600"></div>
                  <span className="text-sm font-bold text-slate-700">
                    {filteredSubmissions.filter((s) => s._moderated).length}{" "}
                    Moderated
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-indigo-600">
                    Total: {filteredSubmissions.length} submissions
                  </span>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative">
              <div
                ref={mapElement}
                className="w-full h-[calc(100vh-280px)] min-h-[600px]"
              />
              {/* Popup container */}
              <div
                ref={popupRef}
                className="absolute z-[1000] pointer-events-auto"
                style={{ display: "none" }}
              />

              {/* No submissions popup - small centered popup */}
              {filteredSubmissions.length === 0 && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 p-6 min-w-[320px]">
                    <div className="text-center">
                      <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <MapIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-black text-slate-700 mb-2">
                        No Submissions Found
                      </h3>
                      <p className="text-sm text-slate-500">
                        {searchTerm || moderationFilter !== "all"
                          ? "No submissions match your filters."
                          : "No submissions available."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Card View */
          <>
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
                    Submissions
                  </p>
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {filteredSubmissions.length} total
                </div>
              </div>
            </div>
            {filteredSubmissions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-16 text-center">
                <div className="text-slate-300 mb-6">
                  <svg
                    className="w-32 h-32 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-slate-700 mb-3">
                  No Submissions Found
                </h3>
                <p className="text-slate-500 text-lg">
                  {searchTerm || moderationFilter !== "all"
                    ? "No submissions match your filters."
                    : "No submissions available."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((submission) => {
                  const displayFields = CARD_DISPLAY_FIELDS[selectedForm] || [];
                  const uuid = getSubmissionUUID(submission);
                  const isModerated = submission._moderated === true;

                  return (
                    <div
                      key={uuid}
                      className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      {/* Left accent stripe */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          isModerated ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />

                      <div className="pl-6 pr-5 pt-4 pb-0">
                        {/* Top row: status badge + date */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${
                              isModerated
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-amber-50 text-amber-700 ring-amber-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isModerated ? "bg-emerald-500" : "bg-amber-400"
                              }`}
                            />
                            {isModerated ? "Moderated" : ""}
                          </span>

                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Calendar size={12} />
                            {formatToIST(
                              submission.__system?.submissionDate ||
                                submission.submission_time,
                            )}
                          </div>
                        </div>

                        {/* Dynamic data fields */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 mb-4">
                          {/* {displayFields.map((field) => (
                            <div key={field.key} className="min-w-0">
                              <div className="text-xs text-slate-400 font-medium mb-0.5 truncate">
                                {field.label}
                              </div>
                              <div className="text-sm font-semibold text-slate-800 truncate">
                                {getFieldValue(submission, field.key)}
                              </div>
                            </div>
                          ))} */}

                          {displayFields
                            .map((field) => ({
                              field,
                              value: getFieldValue(submission, field.key),
                            }))
                            .filter(({ field, value }) => {
                              // Hide Beneficiary_Name based on form-specific rules
                              if (
                                field.key === "Beneficiary_Name" ||
                                field.key === "beneficiary_name" ||
                                field.key === "Beneficiary_name" ||
                                field.label?.toLowerCase().includes("beneficiary's name") ||
                                field.label?.toLowerCase().includes("beneficiary name")
                              ) {
                                if (shouldHideBeneficiaryName(selectedForm, submission)) return false;
                              }

                              // Hide empty fields
                              return value !== "-" && value !== null && value !== undefined && value !== "";
                            })
                            .map(({ field, value }) => (
                              <div key={field.key} className="min-w-0">
                                <div className="text-xs text-slate-400 font-medium mb-0.5 truncate">
                                  {field.label}
                                </div>
                                <div className="text-sm font-semibold text-slate-800 truncate">
                                  {value}
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>

                      {validationResults[uuid] && (
                        <div className="pl-6 pr-5 pt-3 border-t">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold text-slate-400">
                              Site Validation
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-md font-bold ${
                                validationResults[uuid].finalDecision ===
                                "Recommended"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {validationResults[uuid].finalDecision}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(
                              validationResults[uuid].parameters,
                            ).map(([param, category]) => (
                              <span
                                key={param}
                                className={`px-2 py-1 text-xs rounded-md font-semibold ${
                                  category === "accepted"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : category === "partially_accepted"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
                                }`}
                              >
                                {param} → {category.replace("_", " ")}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 inline-block mt-3 mb-4">
                            Note:- The datasets against which we are checking
                            can be incorrect too, so the request is to go with
                            what the community says in terms of the suitability
                            of the location.
                          </span>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            Click{" "}
                            <a
                              href="https://docs.google.com/spreadsheets/d/1EUkK0ZGXHnQlQdAK88HH-Mar-rOncHzHPbfOetaLbKE/edit?gid=125362813#gid=125362813"
                              className="text-blue-600"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              here
                            </a>{" "}
                            to read the rules
                          </p>
                        </div>
                      )}
                      {/* Bottom action bar */}
                      <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          disabled={formTemplateLoading}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                        >
                          <Eye size={13} />
                          View
                        </button>

                        {showActions && (
                          <>
                            <button
                              onClick={() => handleEditSubmission(submission)}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition-all"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>

                            {[
                              "Waterbody",
                              "Groundwater",
                              "Agri",
                              "Agri Maintenance",
                              "GroundWater Maintenance",
                              "Surface Water Body Maintenance",
                              "Surface Water Body Remotely Sensed Maintenance",
                              "Well",
                            ].includes(selectedForm) && (
                              <button
                                onClick={() =>
                                  handleValidateSubmission(submission)
                                }
                                disabled={validationLoading[uuid]}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-all disabled:opacity-60"
                              >
                                {validationLoading[uuid] ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                                    Validating...
                                  </>
                                ) : (
                                  <>Validate</>
                                )}
                              </button>
                            )}

                              <button
                                onClick={() => handleDelete(submission)}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Pagination - only show in card view */}
        {viewMode === "card" && submissions.length > 0 && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => fetchSubmissions(page - 1)}
              className="px-5 py-2.5 bg-white border-2 border-slate-300 rounded-xl disabled:opacity-50 hover:bg-slate-50 font-bold transition-all shadow-md"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => fetchSubmissions(i + 1)}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-md ${
                  page === i + 1
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                    : "bg-white border-2 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => fetchSubmissions(page + 1)}
              className="px-5 py-2.5 bg-white border-2 border-slate-300 rounded-xl disabled:opacity-50 hover:bg-slate-50 font-bold transition-all shadow-md"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const Moderation = () => {
  const [currentPage, setCurrentPage] = useState("selection");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedPlanName, setSelectedPlanName] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    try {
      const sessionUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "{}",
      );
      return !!sessionUser?.user?.is_superadmin;
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const syncRole = () => {
      const sessionUser = JSON.parse(
        sessionStorage.getItem("currentUser") || "{}",
      );
      const user = sessionUser.user || {};
      setCurrentUser(user);
      setIsSuperAdmin(!!user.is_superadmin);
      setUserId(user.id);
    };

    syncRole();
    window.addEventListener("storage", syncRole);
    return () => window.removeEventListener("storage", syncRole);
  }, []);

  useEffect(() => {
    setSelectedOrg("");
    setSelectedProject("");
    setSelectedPlan("");
    setSelectedForm("");
    setSelectedPlanName("");
    setCurrentPage("selection");
  }, [userId]);

  const handleLoadSubmissions = (project, plan, form, planName) => {
    setSelectedProject(project);
    setSelectedPlan(plan);
    setSelectedForm(form);
    setSelectedPlanName(planName);
    setCurrentPage("forms");
  };

  const handleBack = () => {
    setCurrentPage("selection");
  };

  const handleFormChange = (form) => {
    setSelectedForm(form);
  };

  return currentPage === "selection" ? (
    <SelectionPage
      isSuperAdmin={isSuperAdmin}
      onLoadSubmissions={handleLoadSubmissions}
      selectedOrg={selectedOrg}
      setSelectedOrg={setSelectedOrg}
      selectedProject={selectedProject}
      setSelectedProject={setSelectedProject}
      initialProject={selectedProject}
      initialPlan={selectedPlan}
      initialForm={selectedForm}
      initialOrg={selectedOrg}
    />
  ) : (
    <FormViewPage
      isSuperAdmin={isSuperAdmin}
      user={currentUser}
      selectedForm={selectedForm}
      selectedPlan={selectedPlan}
      selectedPlanName={selectedPlanName}
      selectedProject={selectedProject}
      onFormChange={handleFormChange}
      onBack={handleBack}
    />
  );
};

export default Moderation;
