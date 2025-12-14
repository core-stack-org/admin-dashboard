import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";

// Page 1: Selection Form
const SelectionPage = ({ onLoadSubmissions, initialProject = "", initialPlan = "", initialForm = "" }) => {
  const BASEURL = "https://geoserver.core-stack.org/";
  
  const [projects, setProjects] = useState([]);
  const [plans, setPlans] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedProject, setSelectedProject] = useState(initialProject);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [selectedForm, setSelectedForm] = useState(initialForm);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetch(`${BASEURL}api/v1/projects`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProjects(data.data || data.projects || data))
      .catch(err => console.log("Project Fetch Error", err));
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetch(`${BASEURL}api/v1/forms`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setForms(data.forms || []))
      .catch(err => console.log("Forms Fetch Error", err));
  }, []);

  useEffect(() => {
    if (initialProject) {
      const token = sessionStorage.getItem("accessToken");
      fetch(`${BASEURL}api/v1/projects/${initialProject}/watershed/plans/`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const formatted = (data.data || data.plans || data).map(p => ({
            plan_id: p.id || p.plan_id,
            plan: p.plan
          }));
          setPlans(formatted);
        })
        .catch(err => console.log("Plan Fetch Error", err));
    }
  }, [initialProject]);

  const handleProjectChange = (e) => {
    const id = e.target.value;
    setSelectedProject(id);
    setSelectedPlan("");

    const token = sessionStorage.getItem("accessToken");
    fetch(`${BASEURL}api/v1/projects/${id}/watershed/plans/`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const formatted = (data.data || data.plans || data).map(p => ({
          plan_id: p.id || p.plan_id,
          plan: p.plan
        }));
        setPlans(formatted);
      })
      .catch(err => console.log("Plan Fetch Error", err));
  };

  const handleLoadSubmissions = () => {
    if (selectedForm && selectedPlan) {
      const planName = plans.find(p => p.plan_id === Number(selectedPlan))?.plan || "Unknown Plan";
      onLoadSubmissions(selectedProject, selectedPlan, selectedForm, planName);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Moderation Dashboard</h1>
          <p className="text-gray-600">Select project, plan, and form to view submissions</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          {/* Project Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Project
            </label>
            <select
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
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

          {/* Plan Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Plan
            </label>
            <select
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <option value="">-- Choose Plan --</option>
              {plans?.map((plan) => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.plan}
                </option>
              ))}
            </select>
          </div>

          {/* Form Selection */}
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
              {forms?.map((form, i) => (
                <option key={i} value={form.name}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>

          {/* Load Button */}
          <button
            onClick={handleLoadSubmissions}
            disabled={!selectedPlan || !selectedForm}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
          >
            Load Submissions
          </button>
        </div>
      </div>
    </div>
  );
};

// Page 2: Card View
const CardViewPage = ({ selectedForm, selectedPlan, selectedPlanName, onBack }) => {
  const BASEURL = "https://geoserver.core-stack.org/"; // Replace with your actual base URL

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

  const formatColumnName = (key) => {
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/_/g, " ");
  };

  const formatValue = (key, value) => {
    if (isTimestampField(key)) {
      return formatToIST(value);
    }
    
    const lastPart = key.split('.').pop();
    if ((lastPart === 'coordinates' || lastPart.includes('coordinate')) && Array.isArray(value)) {
      return value.join(', ');
    }
    
    return value ?? "-";
  };

  const isMetadataField = (key) => {
    const metadataPatterns = [
      '__id',
      '__system',
      'meta',
      'deviceid',
      'start',
      'end',
      'today',
      'user_latlon',
      'formVersion',
      'reviewState',
      'submitterId',
      'submitterName',
      'attachmentsPresent',
      'attachmentsExpected',
      'edits',
      'status',
      'deviceId',
      'deletedAt',
      'updatedAt',
    ];
    
    const lastPart = key.split('.').pop();
    return metadataPatterns.some(pattern => 
      key.includes(pattern) || lastPart === pattern
    );
  };
  
  const [showMetadata, setShowMetadata] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [editingRowUuid, setEditingRowUuid] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});
  const [editedSubmissions, setEditedSubmissions] = useState(new Set());

  const sessionUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
  const user = sessionUser.user || {};
  const groups = Array.isArray(user.groups) ? user.groups : [];
  const isAdmin = groups.some(g => g.name === "Administrator");
  const isModerator = groups.some(g => g.name === "Moderator");
  const showActions = isAdmin || isModerator;

  // const formColumnMap = {
  //   Well: ["submission_time","well_id","plan_id","beneficiary_settlement", "block_name", "owner", "Beneficiary_name","need_maintenance", "coordinates", "select_one_change_water_quality", ""],
  //   Settlement: ["submission_time","Settlements_id","plan_id","settlement_name", "block_name", "settlement_status","coordinates", "number_households", "settlement_electricity", "distance_settlement_block"],
  //   Waterbody: ["submission_time", "waterbody_id","plan_id","beneficiary_settlement", "beneficiary_contact", "owner","Beneficiary_name","block_name", "coordinates", "households_benefited"],
  //   Groundwater: ["submission_time", "recharge_structure_id","plan_id","beneficiary_settlement", "work_type",  "block_name", "coordinates",],
  //   Agri: ["submission_time", "beneficiary_settlement", "work_type", "block_name", "status_re"],
  //   Livelihood: ["submission_time", "beneficiary_settlement", "beneficiary_contact", "livestock_development", "block_name"],
  //   Crop: ["submission_time", "beneficiary_settlement", "cropping_patterns_zaid", "cropping_patterns_kharif", "cropping_patterns_rabi"],
  //   "Agri Maintenance" :["submissionDate","Beneficiary_Name","beneficiary_settlement", "Beneficiary_Contact_Number", "ben_father"],
  //   "GroundWater Maintenance":["submissionDate","Beneficiary_Name","beneficiary_settlement", "Beneficiary_Contact_Number", "ben_father"],
  //   "Surface Water Body Maintenance":["submissionDate","Beneficiary_Name","beneficiary_settlement", "Beneficiary_Contact_Number", "ben_father"],
  //   "Surface Water Body Recharge Structure Maintenance":["submissionDate","Beneficiary_Name","beneficiary_settlement", "Beneficiary_Contact_Number", "ben_father"],
  // };

  const fieldDisplayNames = {
    // Common fields
    submission_time: "Submission Time",
    submissionDate: "Submission Date",
    plan_name: "Plan Name",
    plan_id: "Plan ID",
    block_name: "Block Name",
    coordinates: "Coordinates",
    
    // Settlement fields
    Settlements_name: "Settlement Name",
    settlement_name: "Settlement Name",
    Settlements_id: "Settlement ID",
    number_households: "Total Households",
    settlement_electricity: "Electricity Available",
    road_connected: "Road Connected",
    count_general: "General Caste Count",
    count_sc: "SC Count",
    count_st: "ST Count",
    count_obc: "OBC Count",
    distance_settlement: "Distance to Main Road (km)",
    distance_settlement_block: "Distance to Block (km)",
    BPL_households: "BPL Households",
    
    // Well fields
    well_id: "Well ID",
    Beneficiary_name: "Beneficiary Name",
    beneficiary_settlement: "Beneficiary Settlement",
    ben_father: "Father's/Guardian Name",
    select_one_owns: "Ownership",
    households_benefited: "Households Benefited",
    select_multiple_caste_use: "Castes Using",
    select_one_well_type: "Well Type",
    is_maintenance_required: "Maintenance Required",
    Is_water_from_well_used: "Well Water Used",
    select_one_well_used: "Well Usage Type",
    
    // Waterbody fields
    waterbodies_id: "Waterbody ID",
    select_one_water_structure: "Water Structure Type",
    select_one_manages: "Managed By",
    select_one_maintenance: "Maintenance Status",
    age_water_structure: "Structure Age",
    select_multiple_uses_structure: "Structure Uses",
    Beneficiary_contact_number: "Beneficiary Contact",
    
    // Groundwater & Agri fields
    work_id: "Work ID",
    TYPE_OF_WORK_ID: "Type of Work",
    TYPE_OF_WORK: "Work Type",
    Beneficiary_Name: "Beneficiary Name",
    Beneficiary_Contact_Number: "Beneficiary Contact",
    demand_type: "Demand Type",
    demand_type_irrigation: "Demand Type",
    khasra: "Khasra Number",
    gender: "Gender",
    select_gender: "Gender",
    
    // Agri/Irrigation specific
    select_one_cropping_pattern: "Cropping Pattern",
    select_multiple_cropping_kharif: "Kharif Crops",
    select_multiple_cropping_Rabi: "Rabi Crops",
    select_multiple_cropping_Zaid: "Zaid Crops",
    
    // Crop fields
    crop_Grid_id: "Crop Grid ID",
    select_one_classified: "Land Classification",
    select_one_practice: "Cropping Practice",
    select_multiple_widgets: "Irrigation Source",
    select_one_productivity: "Productivity Status",
    soil_degraded: "Soil Degraded",
    total_area_cultivation_kharif: "Kharif Area (acres)",
    total_area_cultivation_Rabi: "Rabi Area (acres)",
    total_area_cultivation_Zaid: "Zaid Area (acres)",
    
    // Livelihood fields
    ben_plantation: "Beneficiary (Plantation)",
    crop_name: "Crop/Plant Name",
    crop_area: "Crop Area",
    ben_livestock: "Beneficiary (Livestock)",
    ben_fisheries: "Beneficiary (Fisheries)",
    is_demand_fisheries: "Fisheries Demand",
    is_demand_livestock: "Livestock Demand",
    
    // Maintenance forms
    corresponding_work_id: "Original Work ID",
    select_one_irrigation_structure: "Irrigation Structure",
    select_one_recharge_structure: "Recharge Structure",
    select_one_check_dam: "Check Dam Issue",
    select_one_farm_pond: "Farm Pond Issue",
    select_one_community_pond: "Community Pond Issue",
    select_one_percolation_tank: "Percolation Tank Issue",
    select_one_well: "Well Issue",
    select_one_canal: "Canal Issue",
    select_one_farm_bund: "Farm Bund Issue",
    
    // Other common fields
    user_latlon: "User Location",
    deviceid: "Device ID",
    text_record: "Text Notes",
    image_widget: "Image",
  };
  
  const formColumnMap = {
    Settlement: [
      "submissionDate",
      "settlement_name",      // Changed: lowercase to match DB field
      "settlement_id",        // Changed: lowercase to match DB field  
      "block_name",
      "plan_name",
      "number_households",
      "settlement_electricity",
      "road_connected",
      "count_st",
      "coordinates"
    ],
    
    Well: [
      "submissionDate",
      "well_id",
      "Beneficiary_name",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "select_one_owns",
      "coordinates",
      "select_one_well_type",
      "is_maintenance_required"
    ],
    
    Waterbody: [
      "submissionDate",
      "waterbodies_id",
      "Beneficiary_name",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "select_one_water_structure",
      "select_one_owns",
      "coordinates",
      "select_one_maintenance"
    ],
    
    Groundwater: [
      "submissionDate",
      "work_id",
      "TYPE_OF_WORK_ID",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "demand_type",
      "coordinates",
      "Beneficiary_Name",
      "coordinates"
    ],
    
    Agri: [
      "submissionDate",
      "work_id",
      "TYPE_OF_WORK_ID",
      "Beneficiary_Name",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "demand_type_irrigation",
      "coordinates",
      "select_one_cropping_pattern"
    ],
    
    Livelihood: [
      "submissionDate",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "ben_plantation",
      "crop_name",
      "crop_area",
      "is_demand_fisheries",
      "is_demand_livestock",
      "coordinates"
    ],
    
    Crop: [
      "submissionDate",
      "crop_Grid_id",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "select_one_classified",
      "select_one_practice",
      "select_multiple_cropping_kharif",
      "total_area_cultivation_kharif",
      "coordinates"
    ],
    
    "Agri Maintenance": [
      "submissionDate",
      "work_id",
      "Beneficiary_Name",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "corresponding_work_id",
      "select_one_irrigation_structure",
      "demand_type",
      "coordinates"
    ],
    
    "GroundWater Maintenance": [
      "submissionDate",
      "work_id",
      "Beneficiary_Name",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "TYPE_OF_WORK",
      "coordinates",
      "demand_type",
      "select_one_check_dam"
    ],
    
    "Surface Water Body Maintenance": [
      "submissionDate",
      "work_id",
      "Beneficiary_Name",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "coordinates",
      "select_one_recharge_structure",
      "demand_type",
      "coordinates"
    ],
    
    "Surface Water Body Recharge Structure Maintenance": [
      "submissionDate",
      "work_id",
      "Beneficiary_Name",
      "beneficiary_settlement",
      "block_name",
      "plan_id",
      "TYPE_OF_WORK",
      "corresponding_work_id",
      "select_one_community_pond",
      "coordinates"
    ],
  };

  const flattenObject = (obj, prefix = "") => {
    return Object.keys(obj || {}).reduce((acc, key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(acc, flattenObject(value, newKey));
      } else {
        acc[newKey] = value;
      }
      return acc;
    }, {});
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
      
      const sortedData = (data.data || []).sort((a, b) => {
        const flatA = flattenObject(a);
        const flatB = flattenObject(b);
        
        const timeKeyA = Object.keys(flatA).find(k => isTimestampField(k));
        const timeKeyB = Object.keys(flatB).find(k => isTimestampField(k));
        
        const dateA = new Date(flatA[timeKeyA] || 0);
        const dateB = new Date(flatB[timeKeyB] || 0);
        
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

  const getVisibleColumns = (flat) => {
    const allColumns = Object.keys(flat).filter(c => c !== "uuid");
    
    if (formColumnMap[selectedForm]) {
      const configuredColumns = formColumnMap[selectedForm];
      const result = [];
      
      for (const configField of configuredColumns) {
        let matchingColumn = null;
        
        // Priority 1: Exact full path match
        matchingColumn = allColumns.find(col => col === configField);
        
        if (!matchingColumn) {
          // Priority 2: Find all columns where last part matches
          const candidates = allColumns.filter(col => {
            const lastPart = col.split('.').pop();
            return lastPart === configField;
          });
          
          if (candidates.length === 1) {
            matchingColumn = candidates[0];
          } else if (candidates.length > 1) {
            // CHANGED: Prefer root-level fields (shortest path) because they get updated
            // Root-level fields are the database fields that get updated on edit
            matchingColumn = candidates.reduce((shortest, current) => 
              current.split('.').length < shortest.split('.').length ? current : shortest
            );
          }
        }
        
        if (matchingColumn) {
          result.push(matchingColumn);
        }
      }
      
      return result;
    }
    
    return allColumns.slice(0, 5);
  };

  const filteredRows = submissions.filter(row => {
    const flat = flattenObject(row);
    return Object.values(flat).join(" ").toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleExpand = (uuid) => {
    setExpandedCards(prev => ({ ...prev, [uuid]: !prev[uuid] }));
  };

  const isTimestampField = (key) => {
    const lastPart = key.split('.').pop();
    return lastPart === 'submission_time' || lastPart === 'submissionDate';
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this submission?")) return;
    try {
      const response = await fetch(
        `${BASEURL}api/v1/submissions/${selectedForm}/${row.uuid}/delete/`,
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
        setSubmissions((prev) => prev.filter((item) => item.uuid !== row.uuid));
      }
    } catch {
      alert("Server error");
    }
  };

  const unflattenObject = (flat) => {
    const result = {};
    
    for (const key in flat) {
      const keys = key.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = flat[key];
    }
    
    return result;
  };

  const handleSave = async (row) => {
    try {
      const unflattenedData = unflattenObject(editedRowData);
      
      const response = await fetch(
        `${BASEURL}api/v1/submissions/${selectedForm}/${row.uuid}/modify/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(unflattenedData),
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Saved successfully!");
        setEditedSubmissions(prev => new Set([...prev, row.uuid]));
        
        // Close editing mode BEFORE fetching
        setEditingRowUuid(null);
        setExpandedCards(prev => ({ ...prev, [row.uuid]: false }));
        
        // Fetch new data
        await fetchSubmissions(page);
        
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center gap-4 mb-4 mt-14">
          {/* Left: Go to Plan Button */}
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold shadow-md"
          >
            ← Go to Plan
          </button>

          {/* Center: Plan Name */}
          <div className="flex-1 text-center">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg shadow-lg">
              <div className="text-sm font-medium opacity-90">Current Plan</div>
              <div className="text-xl font-bold">{selectedPlanName || "Plan"}</div>
            </div>
          </div>

          {/* Right: Search */}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 border-2 border-gray-200 px-4 py-3 rounded-lg focus:border-blue-500 focus:outline-none shadow-md"
          />
        </div>
      </div>

      {/* Rows/Cards Container */}
      <div className="max-w-7xl mx-auto space-y-4">
  {filteredRows.length === 0 ? (
    <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-12 text-center">
      <div className="text-gray-400 mb-4">
        <svg
          className="w-24 h-24 mx-auto"
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
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Submissions Found
      </h3>
      <p className="text-gray-500">
        {searchTerm
          ? "No submissions match your search criteria. Try adjusting your search."
          : "There are no submissions available for this form."}
      </p>
    </div>
  ) : (
    filteredRows.map((row) => {
      const flat = flattenObject(row);
      const visibleColumns = getVisibleColumns(flat);
      const isExpanded = expandedCards[row.uuid] || editingRowUuid === row.uuid;
      const isEditing = editingRowUuid === row.uuid;
      const isEditedCard = editedSubmissions.has(row.uuid);

      if (selectedForm === "Settlement" && flat["settlement_id"] === "99d20b7a5b") {
        console.log("=== RENDERING ROW ===");
        console.log("UUID:", row.uuid);
        console.log("isExpanded:", isExpanded);
        console.log("settlement_name (root):", flat["settlement_name"]);
        console.log("Settlements_name (nested):", flat["data_settlement.Settlements_name"]);
        console.log("settlement_id:", flat["settlement_id"]);
        console.log("Settlements_id (nested):", flat["data_settlement.Settlements_id"]);
        console.log("visibleColumns:", visibleColumns);
        visibleColumns.forEach(key => {
          console.log(`  Column: ${key} = "${flat[key]}"`);
        });
      }

      return (
        <div 
          key={row.uuid} 
          className={`rounded-lg shadow-md border-2 overflow-hidden transition-all ${
            isEditedCard 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-200 bg-white'
          }`}
        >
      
      
      {!isExpanded && (
  <div className="flex items-center justify-between hover:bg-gray-50">
    <div 
      onClick={() => toggleExpand(row.uuid)}
      className="flex-1 p-4 cursor-pointer"
    >
      {/* Submission Time Header */}
      {/* <div className="mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">Submitted:</span>
          <span className="text-gray-800">{formatToIST(row.submission_time)}</span>
        </div>
      </div> */}
      
      {/* Existing columns */}
      <div className="grid grid-cols-5 gap-4">
  {visibleColumns.map((key) => {
    const lastPart = key.split('.').pop();
    const isCoordinate = lastPart === 'coordinates' || lastPart.includes('coordinate');
    const value = formatValue(key, flat[key]);
    
    // Debug for settlement with ID 99d20b7a5b
    if (selectedForm === "Settlement" && flat["settlement_id"] === "99d20b7a5b") {
      console.log(`COLLAPSED RENDER: key=${key}, flat[key]="${flat[key]}", value="${value}"`);
    }
    
    return (
      <div key={key} className="overflow-hidden">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
          {formatColumnName(key)}
        </div>
        <div className={`text-gray-800 font-medium ${isCoordinate ? 'break-all' : 'truncate'}`}>
          {value}
        </div>
      </div>
    );
  })}
</div>
    </div>
    
    {showActions && (
      <div className="flex gap-2 mr-4">
        {(isAdmin || isModerator) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingRowUuid(row.uuid);
              setEditedRowData({ ...flat });
              setExpandedCards(prev => ({ ...prev, [row.uuid]: true }));
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Pencil size={16} /> Edit
          </button>
        )}
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Trash2 size={16} /> Delete
          </button>
        )}
      </div>
    )}
    
    {isEditedCard && (
      <span className="mr-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
        ✓ Edited
      </span>
    )}
  </div>
)}
          {isExpanded && (
  <div className={`p-6 ${isEditedCard ? 'bg-green-50' : 'bg-gray-50'}`}>
    {/* Submission Time in Expanded View */}
    <div className="mb-4 pb-4 border-b-2 border-gray-300">
      <div className="flex items-center gap-2 text-base text-gray-700">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-bold">Submitted:</span>
        <span className="text-gray-900 font-semibold">{formatToIST(row.submission_time)}</span>
      </div>
    </div>
    
    {/* Regular Fields */}
    <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
      {Object.keys(flat)
        .filter(k => k !== "uuid" && !isMetadataField(k))
        .map((key) => (
          <div key={key} className="mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              {formatColumnName(key)}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formatValue(key, editedRowData[key])}
                onChange={(e) =>
                  setEditedRowData((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
                disabled={isTimestampField(key)}
              />
            ) : (
              <div className="text-gray-800 font-medium bg-white p-2 rounded border border-gray-200 break-all">
                {formatValue(key, flat[key])}
              </div>
            )}
          </div>
        ))}
    </div>

    {/* Metadata Section */}
    {Object.keys(flat).some(k => isMetadataField(k)) && !isEditing && (
      <div className="mt-6 pt-4 border-t-2 border-gray-300">
        <button
          onClick={() => setShowMetadata(prev => ({ ...prev, [row.uuid]: !prev[row.uuid] }))}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Other Information</span>
          {showMetadata[row.uuid] ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        
        {showMetadata[row.uuid] && (
          <div className="mt-4 grid grid-cols-3 gap-4 bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
            {Object.keys(flat)
              .filter(k => isMetadataField(k))
              .map((key) => (
                <div key={key} className="mb-3">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
                    {formatColumnName(key)}
                  </div>
                  <div className="text-gray-700 text-sm font-mono bg-white p-2 rounded border border-gray-300 break-all">
                    {formatValue(key, flat[key])}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    )}

    {showActions && (
      <div className="mt-6 pt-4 border-t border-gray-300 flex gap-3">
        {isEditing ? (
          <>
            <button
              onClick={() => handleSave(row)}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Check size={18} /> Save
            </button>
            <button
              onClick={() => {
                setEditingRowUuid(null);
                setExpandedCards(prev => ({ ...prev, [row.uuid]: false }));
              }}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <X size={18} /> Cancel
            </button>
            {isAdmin && (
              <button
                onClick={() => handleDelete(row)}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 transition ml-auto"
              >
                <Trash2 size={18} /> Delete
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => toggleExpand(row.uuid)}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 flex items-center gap-2 transition"
          >
            <ChevronUp size={18} /> Collapse
          </button>
        )}
      </div>
    )}
  </div>
)}
        </div>
      );
    })
  )}
</div>
      {/* Pagination */}
      {submissions.length > 0 && (
        <div className="max-w-7xl mx-auto flex justify-center gap-2 mt-8 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => fetchSubmissions(page - 1)}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 font-semibold"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchSubmissions(i + 1)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                page === i + 1
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-white border-2 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => fetchSubmissions(page + 1)}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 font-semibold"
          >
            Next
          </button>
        </div>
      )}
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
    setCurrentPage("cards");
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
    <CardViewPage
      selectedForm={selectedForm}
      selectedPlan={selectedPlan}
      selectedPlanName={selectedPlanName}
      onBack={handleBack}
    />
  );
};

export default Moderation;