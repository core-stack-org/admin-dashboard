import React, { useState } from "react";
import { format } from "date-fns";

const OrganizationDetails = ({ modalData, closeModal, mode }) => {
  const [formData, setFormData] = useState(modalData || {});
  const isEditMode = mode === "edit";

  const formatDate = (dateString) => {
    if (!dateString) return "No data available";
    try {
      return format(new Date(dateString), "dd-MM-yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (isEditMode) {
      console.log(formData);
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/organizations/${modalData.id}/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update organization details");
        }

        const updatedData = await response.json();
        console.log("Organization updated successfully:", updatedData);
      } catch (error) {
        console.error("Error updating organization:", error);
      }
    }
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div
          className={`text-white px-6 py-4 flex justify-between items-center ${
            isEditMode ? "bg-teal-600" : "bg-blue-600"
          }`}
        >
          <h2 className="text-xl font-semibold">
            {isEditMode ? "Edit Organization" : "View Organization"}
          </h2>
          <button
            onClick={closeModal}
            className={`text-white rounded-full p-2 ${
              isEditMode
                ? "hover:bg-teal-700 bg-teal-600"
                : "hover:bg-blue-700 bg-blue-600"
            }`}
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Name:{" "}
                  {isEditMode ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    modalData?.name || "No data available"
                  )}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Organization ID</p>
                  <p className="text-sm font-medium">
                    {modalData?.id || "No data available"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Description
              </h4>
              {isEditMode ? (
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                <p className="text-sm text-gray-700">
                  {modalData?.description || "No data available"}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Created On</p>
                <p>{formatDate(modalData?.created_at)}</p>
              </div>
            </div>

            {isEditMode && (
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleSubmit}
                  className={`text-white px-4 py-2 rounded ${
                    isEditMode
                      ? "bg-teal-500 hover:bg-teal-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isEditMode ? "Update" : "Close"}
                </button>

                <button
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetails;
