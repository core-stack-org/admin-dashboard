import React, { useEffect, useState, useRef } from "react";
import { Trash2, ChevronLeft, Search, Calendar, User, Filter, Map as MapIcon, Grid, Home, Droplet, Waves } from "lucide-react";
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
  ICONS
} from "./moderation/constants";
import { getDynamicMarkerIcon } from "./moderation/helper";

const token = sessionStorage.getItem("accessToken");

const sessionUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
const user = sessionUser.user || {};
const isSuperAdmin = user.is_superadmin;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};


const SelectionPage = ({
  onLoadSubmissions,
  initialProject = "",
  initialPlan = "",
  initialForm = "",
}) => {
  const [projects, setProjects] = useState([]);
  const [plans, setPlans] = useState([]);
  const [forms, setForms] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");

  const [selectedProject, setSelectedProject] =
    useState(initialProject);
  const [selectedPlan, setSelectedPlan] =
    useState(initialPlan);
  const [selectedForm, setSelectedForm] =
    useState(initialForm);

  // const token = sessionStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (!isSuperAdmin) return;

    fetch(`${BASEURL}api/v1/organizations/`, { headers })
      .then(res => res.json())
      .then(data => setOrganizations(data || []))
      .catch(err => console.error("Org fetch error", err));
  }, [isSuperAdmin]);


  useEffect(() => {
  // NON superadmin → same as before
    if (!isSuperAdmin) {
      fetch(`${BASEURL}api/v1/projects`, { headers })
        .then(res => res.json())
        .then(data => setProjects(data.data || data.projects || data))
        .catch(err => console.log(err));
      return;
    }

    // Superadmin but org not selected
    if (!selectedOrg) {
      setProjects([]);
      return;
    }

    // Superadmin + org selected
    fetch(`${BASEURL}api/v1/projects?organization=${selectedOrg}`, { headers })
      .then(res => res.json())
      .then(data => setProjects(data.data || data.projects || data))
      .catch(err => console.log(err));

  }, [isSuperAdmin, selectedOrg]);


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
              <select
                className="w-full border-2 border-slate-300 p-4 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-medium"
                value={selectedOrg}
                onChange={(e) => {
                  setSelectedOrg(e.target.value);
                  setSelectedProject("");
                  setPlans([]);
                }}
              >
                <option value="">-- Choose Organization --</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
              Select Form
            </label>
  
            <select
              className="w-full border-2 border-slate-300 p-4 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-medium"
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
  const [moderationFilter, setModerationFilter] = useState("all");
  const [viewMode, setViewMode] = useState("card"); // "card" or "map"
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [surveyModel, setSurveyModel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const popupRef = useRef(null);
  const overlayRef = useRef(null);

  // Check user permissions
  // const sessionUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  // const user = sessionUser.user || {};
  const groups = Array.isArray(user.groups) ? user.groups : [];
  const isAdmin = groups.some(g => g.name === "Administrator");
  const isModerator = groups.some(g => g.name === "Moderator");
  // const isSuperAdmin = user.is_superadmin;
  const showActions = isAdmin || isModerator || isSuperAdmin;
  const didFetchRef = useRef(false);

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
  
    // GeoJSON point (preferred & correct)
    const geoPoint =
      gps.point_mapappearance ||
      gps.point_mapsappearance;
  
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
      return [
        parseFloat(gps.longitude),
        parseFloat(gps.latitude),
      ];
    }
  
    return null;
  };
  

  
  // Get marker icon based on form type and moderation status
  const getMarkerIcon = (formType, isModerated) => {
    // Determine which icon to use based on form name
    let iconSrc = ICONS['Settlement']; 
    
    if (formType == "Settlement") {
      iconSrc = ICONS['Settlement'];
    } else if (formType == "Well") {
      iconSrc = ICONS['Well'];
    } else if (formType == "Waterbody"){
      iconSrc = ICONS['Waterbody'];
    } else if (formType == "Surface Water Body Remotely Sensed Maintenance"){
      iconSrc = ICONS['Waterbody'];
    } else if (formType == "Surface Water Body Maintenance"){
      iconSrc = ICONS['Waterbody'];
    } else if (formType.includes('Groundwater') || formType.includes('GroundWater Maintenance')) {
      iconSrc = ICONS['Groundwater'];
    } else if (formType == "Livelihood") {
      iconSrc = ICONS['Livelihood'];
    } else if (formType.includes('Agri') || formType.includes('Agri Maintenance')) {
      iconSrc = ICONS['Agri'];
    } else if (formType == "Crop"){
      iconSrc = ICONS['Crop']
    } else if (formType=="Agrohorticulture"){
      iconSrc = ICONS['Agrohorticulture']
    }
    
    return iconSrc;
  };


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
    // Helper to check if a value is valid for display
    const isValidValue = (val) => {
      if (val === null || val === undefined || val === '') return false;
      // Reject objects that aren't arrays (they're likely nested structures)
      if (typeof val === 'object' && !Array.isArray(val)) return false;
      // Reject very long numeric strings (likely coordinates or IDs that shouldn't be displayed)
      if (typeof val === 'string' && /^\d+\.\d{10,}$/.test(val)) return false;
      return true;
    };

    // Check direct access first
    const directValue = submission[fieldKey];
    if (isValidValue(directValue)) {
      return directValue;
    }
    
    // Handle nested objects with hyphen notation
    if (fieldKey.includes('-')) {
      const [parent, child] = fieldKey.split('-');
      if (submission[parent]) {
        const nestedValue = submission[parent][child];
        if (isValidValue(nestedValue)) {
          return nestedValue;
        }
      }
    }
    
    // Try nested paths only for known data structures
    const nestedPaths = [
      `data.${fieldKey}`,
      `data_settlement.${fieldKey}`,
      `data_well.${fieldKey}`,
      `data_waterbody.${fieldKey}`,
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
      
      if (found && isValidValue(value)) {
        // Handle coordinates specially
        if (Array.isArray(value) && path.includes('coordinates')) {
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

  const fetchSubmissions = async (pg = 1, mode = "card") => {
    if (!selectedForm || !selectedPlan) return;
  
    const token = sessionStorage.getItem("accessToken");
  
    const url =
      mode === "map"
        ? `${BASEURL}api/v1/submissions/${selectedForm}/${selectedPlan}/`
        : `${BASEURL}api/v1/submissions/${selectedForm}/${selectedPlan}/?page=${pg}`;
  
    try {
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      const submissionsWithFlags = (data.data || []).map(item =>
        Array.isArray(item)
          ? { ...item[0], _moderated: item[1] }
          : item
      );
  
      const sortedData = submissionsWithFlags.sort((a, b) => {
        const dateA = new Date(a.submission_time || a.__system?.submissionDate || 0);
        const dateB = new Date(b.submission_time || b.__system?.submissionDate || 0);
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
      console.log("Submission Fetch Error", err);
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
      stopEvent: false,
      offset: [0, -10],
    });
    map.addOverlay(overlay);

    mapRef.current = map;
    vectorLayerRef.current = vectorLayer;
    overlayRef.current = overlay;

    // Click handler for markers
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      if (feature) {
        const submission = feature.get("submission");
        const coordinates = feature.getGeometry().getCoordinates();
        
        // Show popup
        overlayRef.current.setPosition(coordinates);
        
        // You can customize what's shown in the popup
        const displayFields = CARD_DISPLAY_FIELDS[selectedForm] || [];
        let popupContent = '<div class="bg-white rounded-lg shadow-xl p-4 min-w-[280px] max-w-[350px]">';
        popupContent += `<div class="font-bold text-lg mb-3 text-indigo-600 border-b border-slate-200 pb-2">Submission Details</div>`;
        
        displayFields.slice(0, 3).forEach(field => {
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
        popupContent += '</div>';
        
        popupRef.current.innerHTML = popupContent;
        popupRef.current.style.display = 'block';
      } else {
        popupRef.current.style.display = 'none';
      }
    });

    // Close popup on map move
    map.on("movestart", () => {
      popupRef.current.style.display = 'none';
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

    filteredSubmissions.forEach(submission => {
      const coords = getCoordinates(submission);
      if (coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
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
              fill: new Fill({ color: 'rgba(255,255,255,0)' }),
              stroke: new Stroke({
                color: isModerated ? '#22c55e' : '#facc15',
                width: 3,
              }),
            }),
          }),
          new Style({
            image: new Icon({
              src: `${iconSrc}#${submission.__id || Date.now()}`,
              scale: 0.5,
              anchor: [0.5, 0.5],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
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
      const submission = submissions.find(s => getSubmissionUUID(s) === uuid);
      if (submission) {
        handleViewSubmission(submission);
      }
    };
    
    window.editSubmissionFromMap = (uuid) => {
      const submission = submissions.find(s => getSubmissionUUID(s) === uuid);
      if (submission) {
        handleEditSubmission(submission);
      }
    };
    
    window.deleteSubmissionFromMap = (uuid) => {
      const submission = submissions.find(s => getSubmissionUUID(s) === uuid);
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
        reloadSubmissions();
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
        reloadSubmissions();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Server error");
    }
  };

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
  
          <div className="flex gap-4 items-center">
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
  
          <div className="flex gap-3 items-center">
            {/* View Mode Toggle */}
            <div className="flex bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-md">
              <button
                onClick={() => setViewMode("card")}
                className={`px-4 py-3 font-bold transition-all flex items-center gap-2 ${
                  viewMode === "card"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Grid size={18} />
                Card
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-3 font-bold transition-all flex items-center gap-2 ${
                  viewMode === "map"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <MapIcon size={18} />
                Map
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-48 border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-medium text-sm"
              />
            </div>

            {/* Moderation Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={moderationFilter}
                onChange={(e) => setModerationFilter(e.target.value)}
                className="pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all font-medium appearance-none bg-white text-sm"
              >
                <option value="all">All</option>
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
                    Not Moderated: {filteredSubmissions.filter(s => !s._moderated).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-400 border-2 border-green-600"></div>
                  <span className="text-sm font-bold text-slate-700">
                    Moderated: {filteredSubmissions.filter(s => s._moderated).length}
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
              <div ref={popupRef} style={{ display: 'none' }} />

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