import React, { useEffect, useState } from "react";
import { Trash2, ChevronLeft, Search, Calendar, User, Filter } from "lucide-react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";

import {
  BASEURL,
  FORM_TEMPLATES,
  CARD_DISPLAY_FIELDS,
} from "./moderation/constants";

const SelectionPage = ({
  onLoadSubmissions,
  initialProject = "",
  initialPlan = "",
  initialForm = "",
}) => {
  const [projects, setProjects] = useState([]);
  const [plans, setPlans] = useState([]);
  const [forms, setForms] = useState([]);

  const [selectedProject, setSelectedProject] =
    useState(initialProject);
  const [selectedPlan, setSelectedPlan] =
    useState(initialPlan);
  const [selectedForm, setSelectedForm] =
    useState(initialForm);

  const token = sessionStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetch(`${BASEURL}api/v1/projects`, { headers })
      .then((res) => res.json())
      .then((data) =>
        setProjects(data.data || data.projects || data)
      )
      .catch((err) =>
        console.log("Project Fetch Error", err)
      );
  }, []);

  useEffect(() => {
    fetch(`${BASEURL}api/v1/forms`, { headers })
      .then((res) => res.json())
      .then((data) => setForms(data.forms || []))
      .catch((err) =>
        console.log("Forms Fetch Error", err)
      );
  }, []);

  useEffect(() => {
    if (!initialProject) return;

    fetch(
      `${BASEURL}api/v1/projects/${initialProject}/watershed/plans/`,
      { headers }
    )
      .then((res) => res.json())
      .then((data) => {
        const rawPlans =
          data?.data || data?.plans || data || [];
        setPlans(formatPlansForDropdown(rawPlans));
      })
      .catch((err) => {
        console.error("Plan Fetch Error", err);
        setPlans([]);
      });
  }, [initialProject]);

  const formatPlansForDropdown = (rawPlans = []) =>
    rawPlans.map((p) => ({
      plan_id: p.id || p.plan_id,
      plan: p.plan,
      facilitator_name: p.facilitator_name || "",
      year: p.created_at
        ? new Date(p.created_at).getFullYear()
        : "",
    }));

  const handleProjectChange = (e) => {
    const id = e.target.value;

    setSelectedProject(id);
    setSelectedPlan("");
    setPlans([]);

    if (!id) return;

    fetch(
      `${BASEURL}api/v1/projects/${id}/watershed/plans/`,
      { headers }
    )
      .then((res) => res.json())
      .then((data) => {
        const rawPlans =
          data?.data || data?.plans || data || [];
        setPlans(formatPlansForDropdown(rawPlans));
      })
      .catch((err) => {
        console.error("Plan Fetch Error", err);
        setPlans([]);
      });
  };

  const handleLoadSubmissions = () => {
    if (!selectedForm || !selectedPlan) return;

    const planName =
      plans.find(
        (p) => p.plan_id === Number(selectedPlan)
      )?.plan || "Unknown Plan";

    onLoadSubmissions(
      selectedProject,
      selectedPlan,
      selectedForm,
      planName
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">
            Moderation Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Select project, plan, and form to review Forms
          </p>
        </div>
  
        <div className="bg-white shadow-2xl rounded-3xl p-10 border border-slate-200">
          <div className="mb-7">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
              Select Project
            </label>
            <select
              className="w-full border-2 border-slate-300 p-4 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-medium"
              onChange={handleProjectChange}
              value={selectedProject}
            >
              <option value="">-- Choose Project --</option>
              {projects?.map((p, i) => (
                <option key={i} value={p.id || p.project_id}>
                  {p.project_name || p.name}
                </option>
              ))}
            </select>
          </div>
  
          <div className="mb-7">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
              Select Plan
            </label>
            <select
              className="w-full border-2 border-slate-300 p-4 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-medium"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <option value="">-- Choose Plan --</option>
              {plans?.map((plan) => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.plan}
                  {(plan.year || plan.facilitator_name) && (
                    <>
                      {plan.year && ` (${plan.year})`}
                      {plan.facilitator_name && ` – ${plan.facilitator_name}`}
                    </>
                  )}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Form
            </label>
  
            <select
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              <option value="">-- Choose Form --</option>
  
              {forms?.map((form) => (
                <option key={form.form_id} value={form.name}>
                  {form.display}
                </option>
              ))}
            </select>
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
const FormViewPage = ({ selectedForm, selectedPlan, selectedPlanName, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [moderationFilter, setModerationFilter] = useState("all"); // "all", "moderated", "not-moderated"
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [surveyModel, setSurveyModel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Check user permissions
  const sessionUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  const user = sessionUser.user || {};
  const groups = Array.isArray(user.groups) ? user.groups : [];
  const isAdmin = groups.some(g => g.name === "Administrator");
  const isModerator = groups.some(g => g.name === "Moderator");
  const isSuperAdmin = user.is_superadmin;
  const showActions = isAdmin || isModerator || isSuperAdmin;

  // Generic function to analyze form schema and identify field types
  const analyzeFormSchema = (schema) => {
    const fieldTypes = {};
    
    const analyzeElement = (element, parentName = '') => {
      const elementName = element.name.startsWith(parentName + '-') 
        ? element.name 
        : (parentName ? `${parentName}-${element.name}` : element.name);
      
      if (element.type === 'checkbox') {
        fieldTypes[elementName] = 'checkbox';
      } else if (element.type === 'radiogroup') {
        fieldTypes[elementName] = 'radio';
      } else if (element.type === 'multipletext') {
        fieldTypes[elementName] = 'multipletext';
      } else if (element.type === 'panel') {
        if (element.elements) {
          element.elements.forEach(child => {
            if (child.name.includes('-')) {
              analyzeElement(child, '');
            } else {
              analyzeElement(child, element.name);
            }
          });
        }
      }
      
      if (element.items && Array.isArray(element.items)) {
        fieldTypes[elementName] = 'multipletext';
        element.items.forEach(item => {
          fieldTypes[`${elementName}.${item.name}`] = 'multipletext_item';
        });
      }
    };
    
    if (schema.pages) {
      schema.pages.forEach(page => {
        if (page.elements) {
          page.elements.forEach(element => analyzeElement(element));
        }
      });
    }
    
    return fieldTypes;
  };

  // Transform API data to SurveyJS format
  const transformApiToSurvey = (submission, formSchema) => {
    const fieldTypes = analyzeFormSchema(formSchema);
    const transformedData = { ...submission };
    
    const processObject = (obj, parentKey = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const fullKey = parentKey ? `${parentKey}-${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (key === 'GPS_point') {
            const coordsObj = value.point_mapsappearance || value.point_mapappearance;
            if (coordsObj?.coordinates) {
              const coords = coordsObj.coordinates;
              transformedData['GPS_point'] = {
                longitude: coords[0],
                latitude: coords[1]
              };
              return;
            }
          }
          else if (value.latitude !== undefined && value.longitude !== undefined) {
            transformedData[fullKey] = value;
          }
          else {
            processObject(value, key);
          }
        } else {
          if (typeof value === 'string' && value.trim().length > 0) {
            const fieldType = fieldTypes[fullKey] || fieldTypes[key];
            
            if (fieldType === 'checkbox' && value.includes(' ')) {
              transformedData[fullKey] = value.split(' ').filter(v => v.trim().length > 0);
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
    return transformedData;
  };

  // Transform SurveyJS data back to API format
  const transformSurveyToApi = (surveyData, originalSubmission, formSchema) => {
    const fieldTypes = analyzeFormSchema(formSchema);
    const saveData = { ...surveyData };
    const nestedData = {};
    
    Object.keys(saveData).forEach(key => {
      if (key.includes('-')) {
        const [parent, child] = key.split('-');
        if (!nestedData[parent]) {
          nestedData[parent] = {};
        }
        
        const fieldType = fieldTypes[key];
        const value = saveData[key];
        
        if (Array.isArray(value) && fieldType === 'checkbox') {
          nestedData[parent][child] = value.join(' ');
        } else {
          nestedData[parent][child] = value;
        }
        delete saveData[key];
      }
    });
    
    if (saveData.GPS_point && saveData.GPS_point.latitude && saveData.GPS_point.longitude) {
      const originalGPS = originalSubmission.GPS_point;
      
      if (originalGPS) {
        const coordsKey = originalGPS.point_mapsappearance ? 'point_mapsappearance' : 'point_mapappearance';
        
        nestedData.GPS_point = {
          ...originalGPS,
          [coordsKey]: {
            type: "Point",
            coordinates: [
              parseFloat(saveData.GPS_point.longitude),
              parseFloat(saveData.GPS_point.latitude)
            ]
          }
        };
      } else {
        nestedData.GPS_point = saveData.GPS_point;
      }
      delete saveData.GPS_point;
    }
    
    Object.keys(nestedData).forEach(parent => {
      saveData[parent] = nestedData[parent];
    });
    
    return saveData;
  };

  // Helper function to get nested field value from submission
  const getFieldValue = (submission, fieldKey) => {
    if (submission[fieldKey] !== undefined && submission[fieldKey] !== null) {
      return submission[fieldKey];
    }
    
    if (fieldKey.includes('-')) {
      const [parent, child] = fieldKey.split('-');
      if (submission[parent] && submission[parent][child] !== undefined) {
        return submission[parent][child];
      }
    }
    
    const nestedPaths = [
      `data.${fieldKey}`,
      `data_settlement.${fieldKey}`,
      `data_well.${fieldKey}`,
      `data_waterbody.${fieldKey}`,
      `GPS_point.point_mapsappearance.coordinates`,
    ];
    
    for (const path of nestedPaths) {
      const keys = path.split('.');
      let value = submission;
      let found = true;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && value[key] !== undefined) {
          value = value[key];
        } else {
          found = false;
          break;
        }
      }
      
      if (found && value !== null) {
        if (Array.isArray(value) && fieldKey === 'coordinates') {
          return value.join(', ');
        }
        return value;
      }
    }
    
    return '-';
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
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-IN', options).replace(',', '') + ' IST';
  };

  const fetchSubmissions = async (pg = 1) => {
    if (!selectedForm || !selectedPlan) return;
    const token = sessionStorage.getItem("accessToken");
    
    try {
      const res = await fetch(
        `${BASEURL}api/v1/submissions/${selectedForm}/${selectedPlan}/?page=${pg}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      
      // Extract submissions from the new format: data is array of [submission, moderationFlag]
      const submissionsWithFlags = (data.data || []).map(item => {
        if (Array.isArray(item) && item.length === 2) {
          return {
            ...item[0],
            _moderated: item[1]
          };
        }
        return item;
      });
      
      const sortedData = submissionsWithFlags.sort((a, b) => {
        const dateA = new Date(a.submission_time || a.__system?.submissionDate || 0);
        const dateB = new Date(b.submission_time || b.__system?.submissionDate || 0);
        return dateB - dateA;
      });
      
      setSubmissions(sortedData);
      setPage(data.page || pg);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.log("Submission Fetch Error", err);
    }
  };

  useEffect(() => {
    fetchSubmissions(1);
  }, []);

  const handleViewSubmission = (submission) => {
    const formTemplate = FORM_TEMPLATES[selectedForm];
    
    if (!formTemplate) {
      alert(`No template found for form: ${selectedForm}`);
      return;
    }
    
    setSelectedSubmission(submission);
    setIsEditing(false);
    
    const model = new Model(formTemplate);
    model.mode = "display";
    
    const transformedData = transformApiToSurvey(submission, formTemplate);
    model.data = transformedData;
    setSurveyModel(model);
  };

  const handleEditSubmission = (submission) => {
    const formTemplate = FORM_TEMPLATES[selectedForm];
    
    if (!formTemplate) {
      alert(`No template found for form: ${selectedForm}`);
      return;
    }
    
    setSelectedSubmission(submission);
    setIsEditing(true);
    
    const model = new Model(formTemplate);
    
    const transformedData = transformApiToSurvey(submission, formTemplate);
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
        }
      );
      const result = await response.json();
      if (result.success) {
        alert("Saved successfully!");
        setSelectedSubmission(null);
        setSurveyModel(null);
        fetchSubmissions(page);
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Server error");
    }
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
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Deleted!");
        setSubmissions((prev) => prev.filter((item) => getSubmissionUUID(item) !== uuid));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Server error");
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 mt-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 mt-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Back to Selection
          </button>
  
          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-xl border-2 border-indigo-200 shadow-md">
              <div className="text-xs text-indigo-600 font-bold uppercase mb-1">
                Plan
              </div>
              <div className="text-sm font-black text-slate-900">
                {selectedPlanName}
              </div>
            </div>
  
            <div className="bg-white px-6 py-3 rounded-xl border-2 border-blue-200 shadow-md">
              <div className="text-xs text-blue-600 font-bold uppercase mb-1">
                Form
              </div>
              <div className="text-sm font-black text-slate-900">
                {selectedForm}
              </div>
            </div>
          </div>
  
          <div className="flex gap-3">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-80 border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Moderation Filter */}
            <div className="relative">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <select
                value={moderationFilter}
                onChange={(e) => setModerationFilter(e.target.value)}
                className="pl-12 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-medium appearance-none bg-white"
              >
                <option value="all">All Submissions</option>
                <option value="moderated">Moderated</option>
                <option value="not-moderated">Not Moderated</option>
              </select>
            </div>
          </div>
        </div>
      </div>
  
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
  
      {/* Submissions List */}
      <div className="max-w-7xl mx-auto">
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
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const displayFields = CARD_DISPLAY_FIELDS[selectedForm] || [];
              const uuid = getSubmissionUUID(submission);
              const isModerated = submission._moderated === true;
  
              return (
                <div
                  key={uuid}
                  className={`rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-all ${
                    isModerated 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-amber-50 border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Moderation Status Badge */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          isModerated 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-amber-200 text-amber-800'
                        }`}>
                          {isModerated ? '✓ Moderated' : '⚠ Not Moderated'}
                        </span>
                      </div>

                      {/* Submission Time */}
                      <div className="mb-4 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={16} className="text-indigo-600" />
                          <span className="font-semibold">Submitted:</span>
                          <span className="text-slate-900 font-bold">
                            {formatToIST(
                              submission.__system?.submissionDate ||
                                submission.submission_time,
                            )}
                          </span>
                        </div>
                      </div>
  
                      {/* Dynamic fields based on form type */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {displayFields.map((field) => (
                          <div key={field.key}>
                            <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                              {field.label}
                            </div>
                            <div className="text-sm font-bold text-slate-900 truncate">
                              {getFieldValue(submission, field.key)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
  
                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 ml-6">
                      <button
                        onClick={() => handleViewSubmission(submission)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                      >
                        View
                      </button>
  
                      {showActions && (
                        <>
                          <button
                            onClick={() => handleEditSubmission(submission)}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                          >
                            Edit
                          </button>
  
                          {(isAdmin || isSuperAdmin) && (
                            <button
                              onClick={() => handleDelete(submission)}
                              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
  
        {/* Pagination */}
        {submissions.length > 0 && totalPages > 1 && (
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
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedPlanName, setSelectedPlanName] = useState("");

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
      onLoadSubmissions={handleLoadSubmissions}
      initialProject={selectedProject}
      initialPlan={selectedPlan}
      initialForm={selectedForm}
    />
  ) : (
    <FormViewPage
      selectedForm={selectedForm}
      selectedPlan={selectedPlan}
      selectedPlanName={selectedPlanName}
      onBack={handleBack}
    />
  );
};

export default Moderation;