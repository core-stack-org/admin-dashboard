import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, ArrowLeft } from "lucide-react";

const LayerStatusDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stateName, districtName, blockName } = location.state || {};

  const [layerData, setLayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    if (!stateName || !districtName || !blockName) return;

    const fetchLayerStatus = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}/api/v1/layer_status_dashboard/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              state: stateName,
              district: districtName,
              block: blockName,
            }),
          }
        );

        const data = await response.json();
        setLayerData(data.result);
      } catch (error) {
        console.error("Error fetching layer status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLayerStatus();
  }, [stateName, districtName, blockName]);

  const handleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getSortedData = () => {
    if (!layerData) return [];
    return Object.entries(layerData).sort(([, a], [, b]) => {
      if (sortOrder === "asc") {
        return b.status_code - a.status_code;
      } else {
        return a.status_code - b.status_code;
      }
    });
  };

  if (!stateName || !districtName || !blockName) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">No data found. Please go back.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 bg-white p-8">
      <div className="relative mb-6 mt-14">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-1 
               text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Centered Title */}
        <h1 className="text-2xl font-bold text-center">Layer Status Details</h1>
      </div>

      {/* State, District, Block info */}
      <div className="flex flex-wrap justify-center gap-8 mb-8 text-lg">
        <p>
          <strong>State:</strong> {stateName}
        </p>
        <p>
          <strong>District:</strong> {districtName}
        </p>
        <p>
          <strong>Block:</strong> {blockName}
        </p>
      </div>

      {/* Loader */}
      {isLoading ? (
        <div className="text-center text-lg text-gray-600 animate-pulse">
          Details are loading... please wait
        </div>
      ) : (
        <>
          {layerData ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-6">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-sm">
                    <th className="px-6 py-4 font-semibold text-left">
                      Workspace
                    </th>
                    <th className="px-6 py-4 font-semibold text-left">
                      Layer Name
                    </th>

                    <th className="px-6 py-4 font-semibold text-left">
                      <div className="flex items-center gap-2">
                        Status
                        <button
                          onClick={handleSort}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          {sortOrder === "asc" ? (
                            <ArrowDown size={16} />
                          ) : (
                            <ArrowUp size={16} />
                          )}
                        </button>
                      </div>
                    </th>

                    <th className="px-6 py-4 font-semibold text-left">
                      Feature Count
                    </th>
                    <th className="px-6 py-4 font-semibold text-left">
                      Start Date
                    </th>
                    <th className="px-6 py-4 font-semibold text-left">
                      End Date
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm text-gray-700">
                  {getSortedData().map(([layerName, info], idx) => (
                    <tr
                      key={layerName}
                      className={`transition hover:bg-gray-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {/*Workspace */}
                      <td className="px-6 py-4 border-t border-gray-200">
                        {/* {layerName} */}
                        {info.workspace}
                      </td>

                      {/* Layer Name */}
                      <td className="px-6 py-4 border-t border-gray-200">
                        {/* {layerName} */}
                        {info.layer_name}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 border-t border-gray-200">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            info.status_code === 200
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {info.status_code === 200
                            ? "Available"
                            : "Not Available"}
                        </span>
                      </td>

                      {/* Feature Count */}
                      <td className="px-6 py-4 border-t border-gray-200">
                        {info.totalFeature ?? "-"}
                      </td>

                      {/* Start Date */}
                      <td className="px-6 py-4 border-t border-gray-200">
                        {info.startDate ? info.startDate : "-"}
                      </td>

                      {/* End Date */}
                      <td className="px-6 py-4 border-t border-gray-200">
                        {info.endDate ? info.endDate : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-6">
              No layer data available.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default LayerStatusDetails;
