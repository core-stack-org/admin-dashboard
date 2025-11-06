import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown } from "lucide-react";

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
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
      <h1 className="text-2xl font-bold mb-6 text-center mt-4">
        Layer Status Details
      </h1>

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
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold border-b">
                    Layer Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold border-b">
                    <div className="flex items-center gap-2">
                      Status
                      <button
                        onClick={handleSort}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {sortOrder === "asc" ? (
                          <ArrowDown size={16} />
                        ) : (
                          <ArrowUp size={16} />
                        )}
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedData().map(([layerName, info]) => (
                  <tr key={layerName} className="hover:bg-gray-50">
                    <td className="px-6 py-3 border-b">{layerName}</td>
                    <td className="px-6 py-3 border-b">
                      <span
                        className={`font-semibold ${
                          info.status_code === 200
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {info.status_code === 200
                          ? "Available"
                          : "Not Available"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
