import React, { useState } from "react";
import { Loader2, Mail, User } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailRequired, setEmailRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      toast.error("Username is required");
      return;
    }

    if (emailRequired && !email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);

    try {
      const body = emailRequired
        ? { username, email }
        : { username };

      const response = await fetch(
        `${process.env.REACT_APP_BASEURL}api/v1/auth/forgot-password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.email_required) {
          setEmailRequired(true);
          toast.info(data.detail);
          setLoading(false);
          return;
        }

        throw new Error(data.detail || "Request failed");
      }

      toast.success(data.detail || "Reset link sent to your email");

      setUsername("");
      setEmail("");
      setEmailRequired(false);

      // Optional redirect after success
      setTimeout(() => {
        navigate("/");
      }, 2500);

    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded pl-10 py-2"
            />
          </div>

          {/* Email appears only if backend asks */}
          {emailRequired && (
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded pl-10 py-2"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded py-2 px-4 text-white flex items-center justify-center gap-2 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;