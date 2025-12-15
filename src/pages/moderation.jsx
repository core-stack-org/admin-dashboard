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
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(sessionStorage.getItem("currentUser"));
  });
  const isSuperAdmin = currentUser.user.is_superadmin;
  
  const showActions = isAdmin || isModerator || isSuperAdmin;
  
  const formFieldConfig = {
    Settlement: [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "Settlements_name", displayName: "Settlement Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "Settlements_id", displayName: "Settlement ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "number_households", displayName: "Total Number of Households", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "settlement_electricity", displayName: "Electricity Available", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "road_connected", displayName: "Road Connected to Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "count_obc", displayName: "Number of OBC Households", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "count_st", displayName: "Number of ST Households", showInCollapsed: true, showInExpanded: true, editable: true },

      // Expanded view only fields
      { field: "count_sc", displayName: "Number of SC Households", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "count_general", displayName: "Number of General Caste Households", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "BPL_households", displayName: "BPL Households", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "distance_settlement", displayName: "Distance to Main Road (km)", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "distance_settlement_block", displayName: "Distance to Block (km)", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "big_farmers", displayName: "Big Farmers", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "small_farmers", displayName: "Small Farmers", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "medium_farmers", displayName: "Medium Farmers", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "landless_farmers", displayName: "Landless Farmers", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "marginal_farmers", displayName: "Marginal Farmers", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Bail", displayName: "OX (Bail)", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Goats", displayName: "Goats", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Sheep", displayName: "Sheep", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Cattle", displayName: "Cattle", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Piggery", displayName: "Piggery", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Poultry", displayName: "Poultry", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "NREGA_work_days", displayName: "Narega Work Days", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "NREGA_have_job_card", displayName: "Households Have Narega Job Card", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Households_BPL_cards", displayName: "Households Have BPL Card", showInCollapsed: false, showInExpanded: true, editable: true },
    ],
    
    Well: [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "well_id", displayName: "Well ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "Beneficiary_name", displayName: "Beneficiary Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_one_owns", displayName: "Ownership", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "households_benefited", displayName: "Households Benefited", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_one_well_type", displayName: "Well Type", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "is_maintenance_required", displayName: "Maintenance Required", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: true, showInExpanded: true, editable: false },

      
      // Expanded view only
      { field: "ben_father", displayName: "Father's/Guardian Name", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Beneficiary_contact_number", displayName: "Beneficiary Contact", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_multiple_caste_use", displayName: "Castes Using", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Is_water_from_well_used", displayName: "Well Water Used", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_well_used", displayName: "Well Usage Type", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "repairs_type", displayName: "what Repair Requires", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_change_observed", displayName: "Is there any changes in water Observed", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_change_water_quality", displayName: "Is there any changes in water Quality", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_pollutants_groundwater", displayName: "Is there any Pollutants in Groundwater", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_water_structure_near_you", displayName: "Is there any Water Structure Near you", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_Functional_Non_functional", displayName: "Is the Well Functional", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_year", displayName: "Till Which Month Water Available", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_scheme", displayName: "Under Which Scheme it is Built", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_multiple_caste_use", displayName: "Which Caste Use this ", showInCollapsed: false, showInExpanded: true, editable: true },


    ],
     
    Waterbody: [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "waterbodies_id", displayName: "Waterbody ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "Beneficiary_name", displayName: "Beneficiary Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_one_water_structure", displayName: "Water Structure Type", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_one_owns", displayName: "Ownership", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "households_benefited", displayName: "Households Benefited", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_one_maintenance", displayName: "Maintenance Status", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: true, showInExpanded: true, editable: false },

      
      // Expanded view only
      { field: "ben_father", displayName: "Father's/Guardian Name", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Beneficiary_contact_number", displayName: "Beneficiary Contact", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_manages", displayName: "Managed By", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "age_water_structure", displayName: "Waterbody Age", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_multiple_uses_structure", displayName: "Structure Uses", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "text_one_manages", displayName: "Who manages", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_bunding", displayName: "What Type of Repair", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "select_one_scheme", displayName: "Through Which Scheme it Repair", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "select_one_manages", displayName: "Who Manages ", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_check_dam", displayName: "Repair of Checkdam ", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_farm_bund", displayName: "Repair of Farmbund ", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_farm_bund", displayName: "Repair of Farmbund ", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_soakage_pits", displayName: "Repair of Soakage Pits ", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_recharge_pits", displayName: "Repair of Recharge Pits ", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_rock_fill_dam", displayName: "Repair of RockFillDam", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_stone_bunding", displayName: "Repair of Stone Bunding", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_community_pond", displayName: "Repair of Commmunity  Pond", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "select_multiple_caste_use", displayName: "Which Cast Use", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_diversion_drains", displayName: "Repair of Diversion Drains", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_large_water_body", displayName: "Repair of Large Water Body", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_model5_structure", displayName: "Repair of Model5 Structure", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_percolation_tank", displayName: "Repair of Percolation Tank", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "Repair_of_30_40_model_structure", displayName: "Repair of 30*40 Model Structure", showInCollapsed: false, showInExpanded: true, editable: false },

    ],
    
    Groundwater: [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "work_id", displayName: "Work ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "plan_name", displayName: "Plan Name", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "demand_type", displayName: "Demand Type", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "Beneficiary_Name", displayName: "Beneficiary Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "select_gender", displayName: "Gender", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "Beneficiary_Contact_Number", displayName: "Beneficiary Contact", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "ben_father", displayName: "Father's/Guardian Name", showInCollapsed: true, showInExpanded: true, editable: true },
      
      // Expanded view only
      { field: "khasra", displayName: "Khasra Number", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Depth_17", displayName: "Bunding Depth", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Width_17", displayName: "Bunding width", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Height_17", displayName: "Bunding Height", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Width_1", displayName: "Check_dam Width", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Height_1", displayName: "Check_dam Height", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Length_1", displayName: "Check_dam Length", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Depth_6", displayName: "SokagePits Depth ", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Width_6", displayName: "SokagePpits Width", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Depth_5", displayName: "RechargePits Depth", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Width_5", displayName: "RechargePits Width", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "Length_5", displayName: "RechargePits Length", showInCollapsed: false, showInExpanded: true, editable: true },


    ],
    
    Agri: [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "work_id", displayName: "Work ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "TYPE_OF_WORK_ID", displayName: "Type of Work", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "Beneficiary_Name", displayName: "Beneficiary Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "plan_name", displayName: "Plan Name", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "demand_type_irrigation", displayName: "Demand Type", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "khasra", displayName: "Khasra Number", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_one_cropping_pattern", displayName: "Cropping Pattern", showInCollapsed: true, showInExpanded: true, editable: true },
      
      // Expanded view only
      { field: "Beneficiary_Contact_Number", displayName: "Beneficiary Contact", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "ben_father", displayName: "Father's/Guardian Name", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "gender", displayName: "Gender", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_multiple_cropping_kharif", displayName: "Kharif Crops", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_multiple_cropping_Rabi", displayName: "Rabi Crops", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_multiple_cropping_Zaid", displayName: "Zaid Crops", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: false, showInExpanded: true, editable: false },
    ],
    
    Livelihood: [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "ben_livestock", displayName: "Benificiary name", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "ben_plantation", displayName: "Beneficiary (Plantation)", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "crop_name", displayName: "Crop/Plant Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "crop_area", displayName: "Crop Area", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "is_demand_fisheries", displayName: "Fisheries Demand", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "is_demand_livestock", displayName: "Livestock Demand", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: true, showInExpanded: true, editable: false },
      
      // Expanded view only
      { field: "ben_livestock", displayName: "Beneficiary (Livestock)", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "ben_fisheries", displayName: "Beneficiary (Fisheries)", showInCollapsed: false, showInExpanded: true, editable: true },
    ],
    
    Crop: [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "crop_Grid_id", displayName: "Crop Grid ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "plan_name", displayName: "Plan Name", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "select_one_classified", displayName: "Land Classification", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_one_practice", displayName: "Cropping Practice", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_multiple_cropping_kharif", displayName: "Kharif Crops", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "total_area_cultivation_kharif", displayName: "Kharif Area (acres)", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_one_productivity", displayName: "Productivity Status", showInCollapsed: true, showInExpanded: true, editable: true },
      
      // Expanded view only
      { field: "total_area_cultivation_Rabi", displayName: "Rabi Area (acres)", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "total_area_cultivation_Zaid", displayName: "Zaid Area (acres)", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_multiple_cropping_Rabi", displayName: "Rabi Crops", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_multiple_cropping_Zaid", displayName: "Zaid Crops", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "soil_degraded", displayName: "Soil Degraded", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_multiple_widgets", displayName: "Irrigation Source", showInCollapsed: false, showInExpanded: true, editable: true },
    ],
    
    "Agri Maintenance": [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "work_id", displayName: "Work ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "Beneficiary_Name", displayName: "Beneficiary Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "plan_name", displayName: "Plan Name", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "corresponding_work_id", displayName: "Original Work ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "select_one_irrigation_structure", displayName: "Irrigation Structure", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "demand_type", displayName: "Demand Type", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: true, showInExpanded: true, editable: false },
      
      // Expanded view only
      { field: "Beneficiary_Contact_Number", displayName: "Beneficiary Contact", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "ben_father", displayName: "Father's/Guardian Name", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_well", displayName: "Well Issue", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_canal", displayName: "Canal Issue", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_farm_pond", displayName: "Farm Pond Issue", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_community_pond", displayName: "Community Pond Issue", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_farm_bund", displayName: "Farm Bund Issue", showInCollapsed: false, showInExpanded: true, editable: true },
    ],
    
    "GroundWater Maintenance": [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "work_id", displayName: "Work ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "Beneficiary_Name", displayName: "Beneficiary Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "plan_name", displayName: "Plan Name", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "TYPE_OF_WORK", displayName: "Work Type", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "demand_type", displayName: "Demand Type", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "select_one_check_dam", displayName: "Check Dam Issue", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: true, showInExpanded: true, editable: false },
      
      // Expanded view only
      { field: "Beneficiary_Contact_Number", displayName: "Beneficiary Contact", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "ben_father", displayName: "Father's/Guardian Name", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_gender", displayName: "Gender", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "corresponding_work_id", displayName: "Original Work ID", showInCollapsed: false, showInExpanded: true, editable: false },
      { field: "select_one_farm_pond", displayName: "Farm Pond Issue", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_rock_fill_dam", displayName: "Rock Fill Dam Issue", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_community_pond", displayName: "Community Pond Issue", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_one_percolation_tank", displayName: "Percolation Tank Issue", showInCollapsed: false, showInExpanded: true, editable: true },
    ],
    
    "Surface Water Body Maintenance": [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "work_id", displayName: "Work ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "Beneficiary_Name", displayName: "Beneficiary Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "plan_name", displayName: "Plan Name", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "select_one_recharge_structure", displayName: "Recharge Structure", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "demand_type", displayName: "Demand Type", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "corresponding_work_id", displayName: "Original Work ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: true, showInExpanded: true, editable: false },
      
      // Expanded view only
      { field: "Beneficiary_Contact_Number", displayName: "Beneficiary Contact", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "ben_father", displayName: "Father's/Guardian Name", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "select_gender", displayName: "Gender", showInCollapsed: false, showInExpanded: true, editable: true },
    ],
    
    "Surface Water Body Recharge Structure Maintenance": [
      { field: "submissionDate", displayName: "Submission Date", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "work_id", displayName: "Work ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "Beneficiary_Name", displayName: "Beneficiary Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "beneficiary_settlement", displayName: "Beneficiary Settlement", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "block_name", displayName: "Block Name", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "plan_name", displayName: "Plan Name", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "TYPE_OF_WORK", displayName: "Work Type", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "corresponding_work_id", displayName: "Original Work ID", showInCollapsed: true, showInExpanded: true, editable: false },
      { field: "select_one_community_pond", displayName: "Community Pond Issue", showInCollapsed: true, showInExpanded: true, editable: true },
      { field: "demand_type", displayName: "Demand Type", showInCollapsed: true, showInExpanded: true, editable: true },
      
      // Expanded view only
      { field: "Beneficiary_Contact_Number", displayName: "Beneficiary Contact", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "ben_father", displayName: "Father's/Guardian Name", showInCollapsed: false, showInExpanded: true, editable: true },
      { field: "coordinates", displayName: "Coordinates", showInCollapsed: false, showInExpanded: true, editable: false },
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

  // Get visible columns for collapsed view
const getVisibleColumnsForCollapsed = (flat) => {
  if (!formFieldConfig[selectedForm]) return [];
  
  return formFieldConfig[selectedForm]
    .filter(config => config.showInCollapsed)
    .map(config => {
      // Try exact match first
      if (flat.hasOwnProperty(config.field)) {
        return config.field;
      }
      
      // Try finding by last part of key
      const matchingKey = Object.keys(flat).find(key => {
        const lastPart = key.split('.').pop();
        return lastPart === config.field;
      });
      
      return matchingKey;
    })
    .filter(Boolean); // Remove nulls
};

// Get visible fields for expanded view
const getVisibleFieldsForExpanded = (flat) => {
  if (!formFieldConfig[selectedForm]) return [];
  
  const configFields = formFieldConfig[selectedForm]
    .filter(config => config.showInExpanded)
    .map(config => {
      // Try exact match first
      if (flat.hasOwnProperty(config.field)) {
        return { key: config.field, config };
      }
      
      // Try finding by last part of key
      const matchingKey = Object.keys(flat).find(key => {
        const lastPart = key.split('.').pop();
        return lastPart === config.field;
      });
      
      return matchingKey ? { key: matchingKey, config } : null;
    })
    .filter(Boolean);
  
  return configFields;
};

// Check if a field is editable
const isFieldEditable = (key) => {
  if (!formFieldConfig[selectedForm]) return true;
  
  const lastPart = key.split('.').pop();
  const fieldConfig = formFieldConfig[selectedForm].find(
    config => config.field === lastPart || config.field === key
  );
  
  return fieldConfig ? fieldConfig.editable : true;
};

// Get display name for a field
const getDisplayName = (key) => {
  if (!formFieldConfig[selectedForm]) return formatColumnName(key);
  
  const lastPart = key.split('.').pop();
  const fieldConfig = formFieldConfig[selectedForm].find(
    config => config.field === lastPart || config.field === key
  );
  
  return fieldConfig ? fieldConfig.displayName : formatColumnName(key);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
 {/* Header */}
 <div className="max-w-7xl mx-auto mb-6">
  <div className="flex justify-between items-center gap-6 mb-4 mt-14">
    {/* Left: Go to Plan Button */}
    <button
      onClick={onBack}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md whitespace-nowrap flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Go to Plan
    </button>

    {/* Center: Plan Info */}
    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <div>
        <div className="text-xs text-blue-600 font-medium">Current Plan</div>
        <div className="text-sm font-bold text-gray-800 whitespace-nowrap">{selectedPlanName || "Plan"}</div>
      </div>
    </div>

    {/* Center: Form Info */}
    <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <div>
        <div className="text-xs text-purple-600 font-medium">Current Form</div>
        <div className="text-sm font-bold text-gray-800 whitespace-nowrap">{selectedForm || "Form"}</div>
      </div>
    </div>

    {/* Right: Search */}
    <input
      type="text"
      placeholder="Search submissions..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-72 border-2 border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
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
      const visibleColumns = getVisibleColumnsForCollapsed(flat);
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
  {getVisibleColumnsForCollapsed(flat).map((key) => {
    const lastPart = key.split('.').pop();
    const isCoordinate = lastPart === 'coordinates' || lastPart.includes('coordinate');
    const value = formatValue(key, flat[key]);
    
    return (
      <div key={key} className="overflow-hidden">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
          {getDisplayName(key)}
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
        {(isAdmin || isModerator || isSuperAdmin) && (
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
        {(isAdmin ||  isSuperAdmin)&& (
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
  {getVisibleFieldsForExpanded(flat).map(({ key, config }) => (
    <div key={key} className="mb-3">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
        {config.displayName}
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
          disabled={!config.editable}
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
            {(isAdmin || isSuperAdmin)&& (
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