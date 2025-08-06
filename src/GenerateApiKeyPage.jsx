import React, { useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff, Copy } from "lucide-react";

const GenerateApiKeyPage = ({ currentUser }) => {
  console.log(currentUser);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const generateApiKey = async () => {
    setLoading(true);
    setApiKey("");

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

      setApiKey(data.key);
      toast.success("✅ API Key generated successfully!");
    } catch (error) {
      console.error("Error generating API key:", error);
      toast.error("❌ Failed to generate API Key");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast.info("🔑 API Key copied to clipboard!");
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Generate API Key</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={generateApiKey}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate New API Key"}
      </button>

      {apiKey && (
        <div className="relative mt-4">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            readOnly
            className="w-full px-4 py-2 border rounded pr-20"
          />
          <button
            type="button"
            onClick={() => setShowKey((prev) => !prev)}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
          >
            <Copy size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default GenerateApiKeyPage;
