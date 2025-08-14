"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function OrganizationForm({ onClose, loadOrganization }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const registrationData = {
      name: formData.name,
      description: formData.description,
    };

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}/api/v1/organizations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(registrationData),
        }
      );

      if (response.ok) {
        toast.success("Organization created successfully!");
        setFormData({
          name: "",
          description: "",
        });
        loadOrganization();
        setTimeout(() => {
          toast.dismiss(); // Dismiss all toasts before navigating
        }, 5000);
      } else {
        const errorData = await response.json();
        toast.error("Failed to create organization.");
        console.error("Error:", errorData);
      }
    } catch (error) {
      console.error("Error during creation:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer position="bottom-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create Organization</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div>
              <label className="block text-lg font-medium mb-2">
                Organization Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Enter Organization name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Describe the organization"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-200 transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
