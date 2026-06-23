import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Eye, Copy, Trash2, KeyRound, Plus } from "lucide-react";

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
        toast.error(" Failed to load API keys");
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
    className={`max-w-6xl mx-auto ${
      isStandalone ? "mt-24" : ""
    } px-6`}
  >
    <div className="bg-white rounded-3xl border border-purple-100 shadow-xl p-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">

        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
            <KeyRound size={26} className="text-purple-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-purple-600">
              Manage API Key
            </h1>
            <p className="text-gray-500 mt-1">
              Create and manage secure API access keys
            </p>
          </div>
        </div>

        <button
          onClick={generateApiKey}
          disabled={generateLoading}
          className="
            bg-gradient-to-r
            from-purple-600
            to-violet-600
            hover:from-purple-700
            hover:to-violet-700
            text-white
            px-5
            py-3
            rounded-xl
            font-medium
            shadow-md
            transition-all
            flex
            items-center
            gap-2
          "
        >
          <Plus size={18} />
          {generateLoading ? "Generating..." : "Generate API Key"}
        </button>
      </div>

      <div className="border-b border-gray-200 mt-6 mb-8" />

      {/* Table Card */}
      <div className="border border-purple-100 rounded-2xl overflow-hidden">

        <table className="w-full">
          <thead className="bg-purple-50">
            <tr>
              <th className="px-6 py-4 text-left text-purple-700 font-semibold">
                Key
              </th>
              <th className="px-4 py-4 text-center text-purple-700 font-semibold">
                Actions
              </th>
              <th className="px-4 py-4 text-center text-purple-700 font-semibold">
                Status
              </th>
              <th className="px-4 py-4 text-center text-purple-700 font-semibold">
                Expiry
              </th>
              <th className="px-4 py-4 text-center text-purple-700 font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {apiLoading ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-12 text-center text-gray-500"
                >
                  <span className="inline-block w-5 h-5 mr-2 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  Loading API Keys...
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-20">

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <KeyRound
                        size={42}
                        className="text-purple-500"
                      />
                    </div>

                    <h3 className="text-2xl font-semibold text-gray-800">
                      No API key generated
                    </h3>

                    <p className="text-gray-500 mt-2">
                      Click on Generate API Key to create one
                    </p>
                  </div>

                </td>
              </tr>
            ) : (
              keys.map((item, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-purple-50/40 transition"
                >
                  <td className="px-6 py-4">
                    <input
                      type={item.show ? "text" : "password"}
                      value={item.key}
                      readOnly
                      className="
                        w-full
                        px-3
                        py-2
                        border
                        border-gray-200
                        rounded-lg
                        bg-gray-50
                      "
                    />
                  </td>

                  <td className="px-4 py-4 text-center">
                    {!item.show ? (
                      <button
                        onClick={() => toggleShowKey(index)}
                        className="text-gray-500 hover:text-purple-600"
                      >
                        <Eye size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => copyToClipboard(item.key)}
                        className="text-gray-500 hover:text-purple-600"
                      >
                        <Copy size={18} />
                      </button>
                    )}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center text-gray-700">
                    {item.expiry}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => deactivateKey(index)}
                      disabled={deactivateLoadingIndex === index}
                      className="
                        text-gray-500
                        hover:text-red-600
                        transition
                      "
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
    </div>
  </div>
);
};

export default GenerateApiKeyPage;
