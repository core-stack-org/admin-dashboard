import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { positions } from "@mui/system";

const Moderation = () => {
  const [projects, setProjects] = useState([]);
  const [plans, setPlans] = useState([]);
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedForm, setSelectedForm] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Row edit states
  const [editingRowUuid, setEditingRowUuid] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});

  // Filtering & column control
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState([]);

  // Safely get user and groups
  // Get the session user object
const sessionUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");

// Safely access the actual user data
const user = sessionUser.user || {};

// Get groups safely
const groups = Array.isArray(user.groups) ? user.groups : [];

// Roles
const isAdmin = groups.some(g => g.name === "Administrator");
const isModerator = groups.some(g => g.name === "Moderator");

// Should show actions
const showActions = isAdmin || isModerator;

// Debug
console.log("User:", user);
console.log("Groups:", groups);
console.log("isAdmin:", isAdmin, "isModerator:", isModerator, "showActions:", showActions);

const formColumnMap = {
  well: ["beneficiary_settlement", "block_name", "owner", "households_benefitted", "caste_uses", "is_functional", "need_maintenance", "plan_name", "status_re"],
  settlement: ["settlement_name", "status_re", "block_name", "number_of_households", "largest_caste", "smallest_caste", "settlement_status", "plan_name","nrega_job_aware", "nrega_job_applied", "nrega_job_card", "nrega_without_job_card", "nrega_work_days", "nrega_past_work", "nrega_raise_demand", "nrega_demand", "nrega_issues", "nrega_community" ],
  waterbody: ["block_name", "beneficiary_settlement", "beneficiary_contact", "who_manages", "specify_other_manager", "owner", "caste_who_uses", "household_benefitted", "water_structure_type", "water_structure_other", "identified_by", "need_maintenance", "plan_name", "status_re"],
  groundwater:["beneficiary_settlement", "block_name", "work_type", "plan_name", "status_re"],
  agri:["beneficiary_settlement","block_name", "work_type", "plan_name", "status_re", ],
  livelihood:["beneficiary_settlement", "block_name","beneficiary_contact","livestock_development", "fisheries", "common_asset", "plan_name", "status_re"],
  crop:["beneficiary_settlement","irrigation_source", "land_classification", "cropping_patterns_kharif","cropping_patterns_rabi","cropping_patterns_zaid", "agri_productivity", "plan_name", "status_re"],
  agri_maint:["plan_name", "status_re"],
  gw_maint:["plan_name", "status_re"],
  swb_maint:["plan_name", "status_re"],
  swb_rs_maint:["plan_name", "status_re"]
};

  // Flatten nested object helper
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

  // Fetch project list
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.REACT_APP_BASEURL}api/v1/projects`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProjects(data.data || data.projects || data))
      .catch(err => console.log("Project Fetch Error", err));
  }, []);

  // Fetch form list
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.REACT_APP_BASEURL}api/v1/forms`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setForms(data.forms || []))
      .catch(err => console.log("Forms Fetch Error", err));
  }, []);

  // Fetch plans on project select
  const handleProjectChange = (e) => {
    const id = e.target.value;
    setSelectedProject(id);
    setSelectedPlan("");
    setSubmissions([]);

    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.REACT_APP_BASEURL}api/v1/projects/${id}/watershed/plans/`, {
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

  // Fetch submissions
  const fetchSubmissions = (pg = 1) => {
    if (!selectedForm || !selectedPlan) return;
    const token = sessionStorage.getItem("accessToken");
    fetch(`${process.env.REACT_APP_BASEURL}api/v1/submissions/${selectedForm}/${selectedPlan}/?page=${pg}`,
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
    )
      .then(res => res.json())
      .then(data => {
        setSubmissions(data.data || []);
        setPage(data.page || pg);
        setTotalPages(data.total_pages || 1);
      })
      .catch(err => console.log("Submission Fetch Error", err));
  };

  // useEffect(() => {
  //   if (submissions.length > 0) {
  //     setVisibleColumns(Object.keys(flattenObject(submissions[0])).filter(c => c !== "uuid"));
  //   }
  // }, [submissions]);

  useEffect(() => {
    if (submissions.length > 0) {
      const allColumns = Object.keys(flattenObject(submissions[0])).filter(
        c => c !== "uuid"
      );
  
      // If form has custom mapping → use it
      if (formColumnMap[selectedForm]) {
        setVisibleColumns(
          allColumns.filter(col => formColumnMap[selectedForm].includes(col))
        );
      } else {
        // default → show all
        setVisibleColumns(allColumns);
      }
    }
  }, [submissions, selectedForm]);
  

  const filteredRows = submissions.filter(row => {
    const flat = flattenObject(row);
    return Object.values(flat).join(" ").toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const thTdStyle = { border: "1px solid #e5e7eb", padding: "8px 10px", whiteSpace: "nowrap", textAlign: "left" };

  return (
    <div className="p-10 mt-16" >
      <div className="w-full flex justify-center top-0 z-50 bg-white py-4">
        <h1 className="text-2xl font-bold">Moderation Dashboard</h1>
      </div>

  
      {/* =================== Control Panel =================== */}
      <div  className="bg-white shadow-md border rounded-lg p-10"
        style={{
          zIndex: 10,
          maxWidth: "600px",
          minHeight:"350px",
          margin: "6px auto",
          paddingBottom: 15,
        }}
>

  {/* Project */}
  <div className="grid grid-cols-3 gap-6 items-center mb-6">
    <label className="font-semibold col-span-1 text-gray-700">
      Select Project
    </label>

    <select
      className="border p-3 col-span-2 rounded-md"
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

  {/* Plan */}
  <div className="grid grid-cols-3 gap-6 items-center mb-6">
    <label className="font-semibold col-span-1 text-gray-700">
      Select Plan
    </label>

    <select
      className="border p-3 col-span-2 rounded-md"
      value={selectedPlan}
      onChange={(e) => {
        setSelectedPlan(e.target.value);
        setSubmissions([]);
      }}
    >
      <option value="">-- Choose Plan --</option>
      {plans?.map((plan) => (
        <option key={plan.plan_id} value={plan.plan_id}>
          {plan.plan}
        </option>
      ))}
    </select>
  </div>

  {/* Form */}
  <div className="grid grid-cols-3 gap-6 items-center mb-8">
    <label className="font-semibold col-span-1 text-gray-700">
      Select Form
    </label>

    <select
      className="border p-3 col-span-2 rounded-md"
      value={selectedForm}
      onChange={(e) => {
        setSelectedForm(e.target.value);
        setSubmissions([]);
      }}
    >
      <option value="">-- Choose Form --</option>
      {forms?.map((form, i) => (
        <option key={i} value={form.name}>
          {form.name}
        </option>
      ))}
    </select>
  </div>

  {/* Button */}
  <div className="text-center">
    <button
      onClick={() => fetchSubmissions(1)}
      disabled={!selectedPlan || !selectedForm}
      className="bg-blue-600 text-white px-6 py-3 rounded-md disabled:bg-gray-400"
    >
      Load Submissions
    </button>
  </div>
      </div>

      {/* ===== Search & Column Filter Bar ===== */}
      {submissions.length > 0 && (
          <div className="flex justify-end gap-3 items-center bg-white py-3 px-2 top-[90px] z-20 border-b text-right">

          {/* Search box */}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded w-60"
          />
          </div>
      )}
  
      {/* =================== TABLE =================== */}
      {submissions.length > 0 && (
        <div className="overflow-x-auto mt-10">
      <div
          style={{
            maxHeight: "65vh",
            width: "100%",              
            maxWidth: "1500px",         
            overflow: "auto",         
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: 10,
            background: "white",
          }}
        >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              {/* ===================== TABLE HEADER ===================== */}
              <thead
                style={{
                  top: 0,
                  background: "#f3f4f6",
                  zIndex: 5,
                }}
              >
                <tr>
      {showActions &&   <th style={{
                                ...thTdStyle,
                                left: 0,
                                zIndex: 20,
                                background: "#f3f4f6",
                              }}>
                            Actions
                        </th>}

      {Object.keys(flattenObject(submissions[0]))?.map(
        (key) =>
          key !== "uuid" &&
          visibleColumns.includes(key) && (
            <th key={key} style={thTdStyle}>
              {key}
            </th>
          )
      )}
    </tr>
  </thead>



  {/* ===================== TABLE BODY ===================== */}
  <tbody>
    {filteredRows.map((row, idx) => {
      const flat = flattenObject(row);
      const rowId = row.uuid;

      return (
        <tr key={idx} style={{ background: idx % 2 ? "#fff" : "#fbfbfb" }}>
          
          {/* =================== ACTIONS COLUMN =================== */}
          {showActions && (
            <td style={{
                    ...thTdStyle,
                    left: 0,
                    zIndex: 15,
                    background: "#fff",
                    verticalAlign: "middle",
                  }}
                >
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                
                {/* ---- EDIT MODE ---- */}
                {editingRowUuid === rowId ? (
                  <>
                    {/* Save */}
                    <Check
                      size={18}
                      className="text-green-600 cursor-pointer"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `${process.env.REACT_APP_BASEURL}api/v1/submissions/${selectedForm}/${row.uuid}/modify/`,
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
                            fetchSubmissions(page);
                            setEditingRowUuid(null);
                          } else {
                            alert("Save failed");
                          }
                        } catch {
                          alert("Server error");
                        }
                      }}
                    />

                    {/* Cancel */}
                    <X
                      size={18}
                      className="text-gray-600 cursor-pointer"
                      onClick={() => setEditingRowUuid(null)}
                    />
                  </>
                ) : (
                  <>
                    {/* ---- VIEW MODE ---- */}

                    {/* Edit — allowed for Admin + Moderator */}
                    {(isAdmin || isModerator) && (
                      <Pencil
                        size={18}
                        className="text-blue-600 cursor-pointer"
                        onClick={() => {
                          setEditingRowUuid(row.uuid);
                          setEditedRowData({ ...flat });
                        }}
                      />
                    )}

                    {/* Delete — only Admin */}
                    {isAdmin && (
                      <Trash2
                        size={18}
                        className="text-red-600 cursor-pointer"
                        onClick={async () => {
                          if (!window.confirm("Delete this submission?")) return;

                          try {
                            const response = await fetch(
                              `${process.env.REACT_APP_BASEURL}api/v1/submissions/${selectedForm}/${row.uuid}/delete/`,
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
                              setSubmissions((prev) =>
                                prev.filter((item) => item.uuid !== row.uuid)
                              );
                            }
                          } catch {
                            alert("Server error");
                          }
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </td>
          )}

          {/* =================== DATA CELLS =================== */}
          {Object.keys(flat).map((key) => {
            if (key === "uuid") return null; // prevent UUID column
            if (!visibleColumns.includes(key)) return null;

            return (
              <td key={key} style={thTdStyle}>
                {editingRowUuid === rowId ? (
                  <input
                    type="text"
                    value={editedRowData[key] ?? ""}
                    onChange={(e) =>
                      setEditedRowData((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="border p-1 w-full"
                  />
                ) : (
                  flat[key] ?? "-"
                )}
              </td>
            );
          })}
        </tr>
      );
    })}
  </tbody>




            </table>
          </div>
        </div>
      )}
  
      {/* =================== Pagination =================== */}
      {submissions.length > 0 && (
        <div className="flex justify-center gap-2 mt-4 flex-wrap bottom-0 bg-white py-3 z-10">
          <button disabled={page === 1} onClick={() => fetchSubmissions(page - 1)} className="px-3 py-1 border rounded">
            Prev
          </button>
  
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchSubmissions(i + 1)}
              className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-blue-600 text-white" : ""}`}
            >
              {i + 1}
            </button>
          ))}
  
          <button disabled={page === totalPages} onClick={() => fetchSubmissions(page + 1)} className="px-3 py-1 border rounded">
            Next
          </button>
        </div>
      )}
    </div>
  );
  
};

export default Moderation;
