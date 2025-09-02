import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import { ArrowLeftCircle } from "lucide-react";

const AllOrganizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState("");

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/auth/register/available_organizations/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "420",
            },
          }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setOrganizations(data);
        } else {
          console.error("Unexpected API response format:", data);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        return [];
      }
    };
    loadOrganization();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="pt-6 bg-white rounded-xl mt-16 flex items-center px-6">
        <Tooltip title="Back to Dashboard">
          <IconButton onClick={() => navigate("/dashboard")}>
            <ArrowLeftCircle className="w-7 h-7 text-blue-600 hover:text-purple-600 transition-colors" />
          </IconButton>
        </Tooltip>

        {/* Centered Title */}
        <h1 className="flex-1 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 text-center drop-shadow-md">
          Organizations Information
        </h1>
      </div>

      {/* Table */}
      {organizations.length > 0 ? (
        <div className="rounded-2xl shadow-lg border border-gray-200 bg-white overflow-y-auto m-2">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gradient-to-r from-blue-100 to-purple-100 text-black sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">S. No.</th>
                <th className="px-6 py-4">Organization Name</th>
                <th className="px-6 py-4">Organization ID</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {organizations.map((org, index) => (
                <tr
                  key={org.id}
                  className="hover:bg-gray-50 transition duration-200 text-gray-700"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{org.name}</td>
                  <td className="px-6 py-4">{org.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No organizations found.</p>
      )}
    </div>
  );
};

export default AllOrganizations;
