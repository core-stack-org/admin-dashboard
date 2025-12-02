import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Eye, Copy, Trash2 } from "lucide-react";

const GenerateApiKeyPage = ({ currentUser,isStandalone = false }) => {
  const [keys, setKeys] = useState([]);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [deactivateLoadingIndex, setDeactivateLoadingIndex] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);

  // Fetch API keys on mount
  useEffect(() => {
    const fetchApiKeys = async () => {
      setApiLoading(true);
      const token = sessionStorage.getItem("accessToken");

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASEURL}api/v1/get_user_api_keys/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to fetch API keys");

        const formattedKeys = data.api_keys.map((item) => ({
          key: item.api_key,
          show: false,
          status: item.is_active ? "Active" : "Inactive",
          expiry: new Date(item.expires_at).toLocaleDateString(),
        }));

        setKeys(formattedKeys);
      } catch (error) {
        console.error("Error fetching API keys:", error);
        toast.error("❌ Failed to load API keys");
      } finally {
        setApiLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  const generateApiKey = async () => {
    if (keys.length >= 2) {
      toast.warn(
        "You can only have 2 active API keys. Please delete one before creating a new one."
      );
      return;
    }

    setGenerateLoading(true);

    const token = sessionStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/generate_api_key/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: currentUser.user.username,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.detail || "Failed to generate key");

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 10);

      setKeys((prev) => [
        ...prev,
        {
          key: data.data?.api_key || "",
          show: false,
          status: "Active",
          expiry: expiryDate.toLocaleDateString(),
        },
      ]);

      toast.success(" API Key generated successfully!");
    } catch (error) {
      console.error("Error generating API key:", error);
      toast.error(" Failed to generate API Key");
    } finally {
      setGenerateLoading(false);
    }
  };

  const deactivateKey = async (index) => {
    const token = sessionStorage.getItem("accessToken");
    const selectedKey = keys[index];

    setDeactivateLoadingIndex(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/generate_api_key/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "deactivate",
            user_id: currentUser.user.id, // Make sure currentUser has .id
            api_key: selectedKey.key,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail || "Failed to deactivate key");

      // Remove from UI
      setKeys((prev) => prev.filter((_, i) => i !== index));

      toast.success(" API Key deactivated successfully!");
    } catch (error) {
      console.error("Error deactivating API key:", error);
      toast.error(" Failed to deactivate API Key");
    } finally {
      setDeactivateLoadingIndex(false);
    }
  };

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    toast.info(" API Key copied to clipboard!");
  };

  const toggleShowKey = (index) => {
    setKeys((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, show: !item.show } : item
      )
    );
  };

  return (
<div
  className={`max-w-3xl mx-auto bg-white rounded shadow p-6 ${
    isStandalone ? "mt-28" : ""
  }`}
>
      {/* Heading + Plus Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage API Key</h2>
        <button
          onClick={generateApiKey}
          disabled={generateLoading}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {generateLoading ? "Generating..." : "+"}
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Key</th>
            <th className="px-4 py-2 text-center">Actions</th>
            <th className="px-4 py-2 text-center">Status</th>
            <th className="px-4 py-2 text-center">Expiry</th>
            <th className="px-4 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {apiLoading ? (
            <tr>
              <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                <span className="inline-block w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                Loading API keys...
              </td>
            </tr>
          ) : keys.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="px-4 py-4 text-center text-gray-500 italic"
              >
                No API key generated, click on + to generate
              </td>
            </tr>
          ) : (
            keys.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">
                  <input
                    type={item.show ? "text" : "password"}
                    value={item.key}
                    readOnly
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  {!item.show ? (
                    <button
                      onClick={() => toggleShowKey(index)}
                      className="text-gray-500 hover:text-black"
                    >
                      <Eye size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => copyToClipboard(item.key)}
                      className="text-gray-500 hover:text-black"
                    >
                      <Copy size={20} />
                    </button>
                  )}
                </td>

                <td className="px-4 py-2 text-center flex items-center justify-center gap-2">
                  <span
                    className={
                      item.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-4 py-2 text-center">{item.expiry}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => deactivateKey(index)}
                    disabled={deactivateLoadingIndex === index}
                    className="text-gray-500 hover:text-red-600"
                    title="Deactivate Key"
                  >
                    {deactivateLoadingIndex === index ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GenerateApiKeyPage;
