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

import {
  BASEURL,
  FORM_TEMPLATES,
  CARD_DISPLAY_FIELDS,
  ICONS,
  FORM_CATEGORY_MAP,
  FORM_CATEGORY_ORDER,
  FORM_DISPLAY_NAMES,
  structureRules
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
  const [plans, setPlans] = useState([]);
  const [forms, setForms] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [selectedForm, setSelectedForm] = useState(initialForm);

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
    fetch(`${BASEURL}api/v1/projects`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const list = data.data || data.projects || data;
        setProjects(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.log(err));
  }, [isSuperAdmin]);

  // Superadmin: fetch projects filtered by org whenever selectedOrg changes
  useEffect(() => {
    if (!isSuperAdmin) return;
    if (!selectedOrg) {
      setProjects([]);
      return;
    }
    fetch(`${BASEURL}api/v1/projects?organization=${selectedOrg}`, {
      headers: getHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const list = data.data || data.projects || data;
        setProjects(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.log(err));
  }, [isSuperAdmin, selectedOrg]);

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
      });
  }, [initialProject]);

  useEffect(() => {
    if (!initialPlan || plans.length === 0) return;

    const exists = plans.some((p) => p.plan_id === Number(initialPlan));

    if (exists) {
      setSelectedPlan(initialPlan);
    }
  }, [plans, initialPlan]);

  const formatPlansForDropdown = (rawPlans = []) =>
    rawPlans.map((p) => ({
      plan_id: p.id || p.plan_id,
      plan: p.plan,
      facilitator_name: p.facilitator_name || "",
      year: p.created_at ? new Date(p.created_at).getFullYear() : "",
      village: p.village || p.village_name || "",
      created_at: p.created_at || "",
    }));

  const handleProjectChange = (e) => {
    const id = e.target.value;

    setSelectedProject(id);
    setSelectedPlan("");
    setPlans([]);

    if (!id) return;

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
      });
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
                }))}
                value={
                  selectedOrg
                    ? organizations
                        .map((org) => ({ value: org.id, label: org.name }))
                        .find((o) => o.value === selectedOrg)
                    : null
                }
                onChange={(opt) => {
                  setSelectedOrg(opt?.value || "");
                  setSelectedProject("");
                  setPlans([]);
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
              options={projects.map((p) => ({
                value: p.id || p.project_id,
                label: p.project_name || p.name,
              }))}
              value={
                selectedProject
                  ? projects
                      .map((p) => ({
                        value: p.id || p.project_id,
                        label: p.project_name || p.name,
                      }))
                      .find((p) => p.value === selectedProject)
                  : null
              }
              onChange={(opt) =>
                handleProjectChange({ target: { value: opt?.value || "" } })
              }
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
              options={plans.map((plan) => ({
                value: plan.plan_id,
                label: plan.plan,
                plan,
              }))}
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
                const date = plan.created_at
                  ? new Date(plan.created_at).toLocaleDateString("en-IN", {
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
  onBack,
}) => {
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

  useEffect(() => {
    if (!selectedProject || !selectedPlan) return;
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
      .catch((err) => console.error("Plan details fetch error", err));
  }, [selectedProject, selectedPlan]);

  const reloadSubmissions = () => {
    if (viewMode === "map") {
      fetchSubmissions(1, "map");
    } else {
      fetchSubmissions(page, "card");
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

    if (selectedForm === "Agri Maintenance"){
      return submission.select_one_irrigation_structure;
    }

    if (selectedForm === "GroundWater Maintenance"){
      return submission.TYPE_OF_WORK;
    }

    if (selectedForm === "Surface Water Body Maintenance" || selectedForm === "Surface Water Body Remotely Sensed Maintenance"){
      return submission.select_one_recharge_structure;
    }

    return null;
  };

  const fetchValidationResult = async (submission) => {

    const coords = getCoordinates(submission);
    if (!coords) return;

    const [lon, lat] = coords;

    const uuid = getSubmissionUUID(submission);

    if (validationResults[uuid]) return;

    const structureType = getStructureType(submission);
    const structureRule = structureRules[structureType];

    if (!structureRule) return;

    setValidationLoading(prev => ({
      ...prev,
      [uuid]: true
    }));

    try {

      const res = await fetch(
        `${BASEURL}api/v1/validate_site/?lat=${lat}&lon=${lon}&structure_type=${structureRule}`,
        { headers: getHeaders() }
      );

      const data = await res.json();

      const params = data?.evaluation?.parameters || {};

      const extracted = {};

      Object.keys(params).forEach((key) => {
        extracted[key] = params[key].category;
      });

      const finalDecision = data?.evaluation?.final_decision;

      setValidationResults(prev => ({
        ...prev,
        [uuid]: {
          parameters: extracted,
          finalDecision: finalDecision
        }
      }));

    } catch (err) {
      console.error("Validation API error:", err);
    }

    finally {
      setValidationLoading(prev => ({
        ...prev,
        [uuid]: false
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
      const elementName = element.name.startsWith(parentName + "-")
        ? element.name
        : parentName
          ? `${parentName}-${element.name}`
          : element.name;

      if (element.type === "checkbox") {
        fieldTypes[elementName] = "checkbox";
      } else if (element.type === "radiogroup") {
        fieldTypes[elementName] = "radio";
      } else if (element.type === "multipletext") {
        fieldTypes[elementName] = "multipletext";
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
        element.items.forEach((item) => {
          fieldTypes[`${elementName}.${item.name}`] = "multipletext_item";
        });
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

  // Transform API data to SurveyJS format
  const transformApiToSurvey = (submission, formSchema) => {
    const fieldTypes = analyzeFormSchema(formSchema);
    const transformedData = { ...submission };

    const processObject = (obj, parentKey = "") => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const fullKey = parentKey ? `${parentKey}-${key}` : key;

        if (value && typeof value === "object" && !Array.isArray(value)) {
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
          } else if (
            value.latitude !== undefined &&
            value.longitude !== undefined
          ) {
            transformedData[fullKey] = value;
          } else {
            processObject(value, key);
          }
        } else {
          if (typeof value === "string" && value.trim().length > 0) {
            const fieldType = fieldTypes[fullKey] || fieldTypes[key];

            if (fieldType === "checkbox" && value.includes(" ")) {
              transformedData[fullKey] = value
                .split(" ")
                .filter((v) => v.trim().length > 0);
            } else {
              transformedData[fullKey] = value;
            }
          } else if (value === null || value === undefined) {
            transformedData[fullKey] = value;
          } else {
            transformedData[fullKey] = value;
          }
        }
      });
    };

    processObject(submission);
    
    const legacyKeyMap = {
      // LIVESTOCK
      "select_one_demand_promoting_livestock" : "Livestock-is_demand_livestock",
      "select_one_promoting_livestock"  : "Livestock-demands_promoting_livestock",
      "select_one_promoting_livestock_other"  : "Livestock-select_one_promoting_livestock_other",

      // KITCHEN GARDENS
      "area_didi_badi"   : "kitchen_gardens-area_kg",
      "indi_assets"  : "kitchen_gardens-assets_kg",

      // FISHERIES
      "select_one_demand_promoting_fisheries" : "fisheries-is_demand_fisheries",
      "select_one_promoting_fisheries" : "fisheries-demands_promoting_fisheries",
      "select_one_promoting_fisheries_other" : "fisheries-demands_promoting_fisheries_other",
    };

    Object.entries(legacyKeyMap).forEach(([oldKey, newKey]) => {
      const oldValue = submission[oldKey];
      const currentValue = transformedData[newKey];
      const isCurrentEmpty = currentValue === null || currentValue === undefined || currentValue === "";
      const isOldValueReal = oldValue !== null && oldValue !== undefined && oldValue !== "";
      if (isCurrentEmpty && isOldValueReal) {
        transformedData[newKey] = oldValue;
      }
    });

    const legacyBeneficiaryName = submission["beneficiary_name"];
    if (
      legacyBeneficiaryName !== null &&
      legacyBeneficiaryName !== undefined &&
      legacyBeneficiaryName !== ""
    ) {
      const livestockDemand = submission["select_one_demand_promoting_livestock"];
      const fishDemand      = submission["select_one_demand_promoting_fisheries"];
      const kitchenDemand   = submission["indi_assets"]; 

      if (livestockDemand === "Yes" && !transformedData["Livestock-ben_livestock"]) {
        transformedData["Livestock-ben_livestock"] = legacyBeneficiaryName;
      }
      if (fishDemand === "Yes" && !transformedData["fisheries-ben_fisheries"]) {
        transformedData["fisheries-ben_fisheries"] = legacyBeneficiaryName;
      }
      if (kitchenDemand === "Yes" && !transformedData["kitchen_gardens-ben_kitchen_gardens"]) {
        transformedData["kitchen_gardens-ben_kitchen_gardens"] = legacyBeneficiaryName;
      }
    }
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
      "Livestock-is_demand_livestock" : "select_one_demand_promoting_livestock",
      "Livestock-demands_promoting_livestock" : "select_one_promoting_livestock",
      "Livestock-select_one_promoting_livestock_other" : "select_one_promoting_livestock_other",
      "kitchen_gardens-area_kg"  : "area_didi_badi",
      "kitchen_gardens-assets_kg"  : "indi_assets",
      "fisheries-is_demand_fisheries"  : "select_one_demand_promoting_fisheries",
      "fisheries-demands_promoting_fisheries"  : "select_one_promoting_fisheries",
      "fisheries-demands_promoting_fisheries_other" : "select_one_promoting_fisheries_other",
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

      const submissionsWithFlags = (data.data || []).map((item) =>
        Array.isArray(item) ? { ...item[0], _moderated: item[1] } : item,
      );

      const sortedData = submissionsWithFlags.sort((a, b) => {
        const dateA = new Date(
          a.submission_time || a.__system?.submissionDate || 0,
        );
        const dateB = new Date(
          b.submission_time || b.__system?.submissionDate || 0,
        );
        return dateB - dateA;
      });

      setSubmissions(sortedData);

      // pagination sirf card ke liye
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
  }, [viewMode]);

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
      if (submission) {
        handleViewSubmission(submission);
      }
    };

    window.editSubmissionFromMap = (uuid) => {
      const submission = submissions.find((s) => getSubmissionUUID(s) === uuid);
      if (submission) {
        handleEditSubmission(submission);
      }
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

  const handleViewSubmission = (submission) => {
  const formTemplate = FORM_TEMPLATES[selectedForm];
  if (!formTemplate) { alert(`No template found for form: ${selectedForm}`); return; }

  const transformedData = transformApiToSurvey(submission, formTemplate);
  
  // Pass transformedData so it knows which fields have values
  const smartTemplate = smartVisibleIf(formTemplate, transformedData, "view");

  setSelectedSubmission(submission);
  setIsEditing(false);

  const model = new Model(smartTemplate);
  model.mode = "display";
  model.data = transformedData;
  setSurveyModel(model);
};

const handleEditSubmission = (submission) => {
  const formTemplate = FORM_TEMPLATES[selectedForm];
  if (!formTemplate) { alert(`No template found for form: ${selectedForm}`); return; }

  const transformedData = transformApiToSurvey(submission, formTemplate);

  // Pass transformedData so it knows which fields have values
  const smartTemplate = smartVisibleIf(formTemplate, transformedData, "edit");

  setSelectedSubmission(submission);
  setIsEditing(true);

  const model = new Model(smartTemplate);
  model.data = transformedData;

  model.onComplete.add((sender) => {
    const saveData = transformSurveyToApi(sender.data, submission, formTemplate);
    const uuid = getSubmissionUUID(submission);
    handleSaveSubmission(uuid, saveData);
  });

  setSurveyModel(model);
};

  const handleSaveSubmission = async (uuid, data) => {
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
      if (result.success) {
        alert("Saved successfully!");
        setSelectedSubmission(null);
        setSurveyModel(null);
        reloadSubmissions();
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Server error");
    }
  };

  const handleValidateSubmission = async (submission) => {
    const uuid = getSubmissionUUID(submission);

    if (!uuid) return;

    await fetchValidationResult(submission);
  };

  const handleDelete = async (submission) => {
    if (!window.confirm("Delete this submission?")) return;

    const uuid = getSubmissionUUID(submission);
    if (!uuid) {
      alert("Could not find submission UUID");
      return;
    }

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
      if (data.success) {
        alert("Deleted!");
        reloadSubmissions();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Server error");
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

  const smartVisibleIf = (schema, submissionData, mode) => {

    const hasValue = (elementName, data) => {
      if (!data) return false;
      const direct = data[elementName];
      if (direct !== undefined && direct !== null && direct !== "") return true;
      if (Array.isArray(direct) && direct.length > 0) return true;
      if (elementName.includes("-")) {
        const [parent, child] = elementName.split("-");
        const nested = data[parent]?.[child];
        if (nested !== undefined && nested !== null && nested !== "") return true;
      }
      return false;
    };

    const processElements = (elements, data) =>
      elements.map((el) => {
        const processed = { ...el };

        if (processed.visibleIf && hasValue(processed.name, data)) {
          delete processed.visibleIf;
          if (mode === "edit") {
            delete processed.isRequired;
          }
        }

        if (processed.elements) {
          processed.elements = processElements(processed.elements, data);
        }

        return processed;
      });

    return {
      ...schema,
      pages: schema.pages.map((page) => ({
        ...page,
        elements: processElements(page.elements || [], submissionData),
      })),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 mt-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top strip — gradient context bar */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-6 py-4 flex items-center gap-4">
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
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider shrink-0">
                Form
              </span>
              <span className="text-white font-bold text-sm truncate">
                {selectedForm}
              </span>
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

          {/* Third row — Generate DPR */}
          <div className="px-8 py-3 border-t border-slate-100/80 bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-4">
              {/* Toggle button */}
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

              {/* Expanded panel */}
              {dprExpanded && (
                <div className="flex-1 flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                  {/* Plan info pill */}
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

                  {/* Email input */}
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

                  {/* Send button */}
                  <button
                    onClick={handleGenerateDPR}
                    disabled={!dprEmail || dprLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all shrink-0"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
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
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <Survey model={surveyModel} />
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
                          {displayFields.map((field) => (
                            <div key={field.key} className="min-w-0">
                              <div className="text-xs text-slate-400 font-medium mb-0.5 truncate">
                                {field.label}
                              </div>
                              <div className="text-sm font-semibold text-slate-800 truncate">
                                {getFieldValue(submission, field.key)}
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
                                validationResults[uuid].finalDecision === "Recommended"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {validationResults[uuid].finalDecision}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(validationResults[uuid].parameters).map(([param, category]) => (
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
                                {param} → {category.replace("_"," ")}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 inline-block mt-3 mb-4">
                            Note:- The datasets against which we are checking can be incorrect too, so the request is to go with what the community says in terms of the suitability of the location.
                          </span>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            Click <a 
                              href="https://docs.google.com/spreadsheets/d/1EUkK0ZGXHnQlQdAK88HH-Mar-rOncHzHPbfOetaLbKE/edit?gid=125362813#gid=125362813"
                              className="text-blue-600"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              here
                            </a> to read the rules
                          </p>
                        </div>
                      )}
                      {/* Bottom action bar */}
                      <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                        <button
                          onClick={() => handleViewSubmission(submission)}
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

                            {["Waterbody","Groundwater","Agri","Agri Maintenance", "GroundWater Maintenance","Surface Water Body Maintenance", "Surface Water Body Remotely Sensed Maintenance", "Well"].includes(selectedForm) && (
                              <button
                                onClick={() => handleValidateSubmission(submission)}
                                disabled={validationLoading[uuid]}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-all disabled:opacity-60"
                              >
                                {validationLoading[uuid] ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                                    Validating...
                                  </>
                                ) : (
                                  <>
                                    Validate
                                  </>
                                )}
                              </button>
                            )}

                            {(isAdmin || isSuperAdmin) && (
                              <button
                                onClick={() => handleDelete(submission)}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            )}
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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
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
      onBack={handleBack}
    />
  );
};

export default Moderation;
