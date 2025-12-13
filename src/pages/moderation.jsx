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

  const formColumnMap = {
    Well: ["submission_time","beneficiary_settlement", "block_name", "owner", "need_maintenance"],
    Settlement: ["submission_time","settlement_name", "block_name", "plan_name", "settlement_status",],
    Waterbody: ["submission_time", "beneficiary_settlement", "beneficiary_contact", "owner","block_name", ],
    Groundwater: ["submission_time", "beneficiary_settlement", "work_type",  "block_name", "status_re"],
    Agri: ["submission_time", "beneficiary_settlement", "work_type", "block_name", "status_re"],
    Livelihood: ["submission_time", "beneficiary_settlement", "beneficiary_contact", "livestock_development", "block_name"],
    Crop: ["submission_time", "beneficiary_settlement", "cropping_patterns_zaid", "cropping_patterns_kharif", "cropping_patterns_rabi"],
    "Agri Maintenance" :["submissionDate","Beneficiary_Name","beneficiary_settlement", "Beneficiary_Contact_Number", "ben_father"],
    "GroundWater Maintenance":["submissionDate","Beneficiary_Name","beneficiary_settlement", "Beneficiary_Contact_Number", "ben_father"],
    "Surface Water Body Maintenance":["submissionDate","Beneficiary_Name","beneficiary_settlement", "Beneficiary_Contact_Number", "ben_father"],
    "Surface Water Body Recharge Structure Maintenance":["submissionDate","Beneficiary_Name","beneficiary_settlement", "Beneficiary_Contact_Number", "ben_father"],
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

  const fetchSubmissions = (pg = 1) => {
    if (!selectedForm || !selectedPlan) return;
    const token = sessionStorage.getItem("accessToken");
    fetch(`${BASEURL}api/v1/submissions/${selectedForm}/${selectedPlan}/?page=${pg}`,
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
    )
      .then(res => res.json())
      .then(data => {
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
      })
      .catch(err => console.log("Submission Fetch Error", err));
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
        const matchingColumn = allColumns.find(col => {
          const lastPart = col.split('.').pop();
          return col === configField || lastPart === configField;
        });
        
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

  const handleSave = async (row) => {
    try {
      const response = await fetch(
        `${BASEURL}api/v1/submissions/${selectedForm}/${row.uuid}/modify/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(editedRowData),
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Saved successfully!");
        setEditedSubmissions(prev => new Set([...prev, row.uuid]));
        fetchSubmissions(page);
        setEditingRowUuid(null);
        setExpandedCards(prev => ({ ...prev, [row.uuid]: false }));
      } else {
        alert("Save failed");
      }
    } catch {
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
      
      {/* Existing columns */}
      <div className="grid grid-cols-5 gap-4">
      {visibleColumns.map((key) => (
  <div key={key} className="overflow-hidden">
    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
      {formatColumnName(key)}
    </div>
    <div className="text-gray-800 font-medium truncate">
      {isTimestampField(key) ? formatToIST(flat[key]) : (flat[key] ?? "-")}
    </div>
  </div>
))}
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
    
    <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
  {Object.keys(flat).filter(k => k !== "uuid").map((key) => (
    <div key={key} className="mb-3">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
        {formatColumnName(key)}
      </div>
      {isEditing ? (
        <input
          type="text"
          value={isTimestampField(key) ? formatToIST(editedRowData[key]) : (editedRowData[key] ?? "")}
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
        <div className="text-gray-800 font-medium bg-white p-2 rounded border border-gray-200">
          {isTimestampField(key) ? formatToIST(flat[key]) : (flat[key] ?? "-")}
        </div>
      )}
    </div>
  ))}
</div>

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