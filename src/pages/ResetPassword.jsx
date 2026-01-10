"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Key, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const BASE_URL =
  import.meta.env?.VITE_BASE_URL ||
  process.env.REACT_APP_BASE_URL ||
  "https://lost-items-backend-q30o.onrender.com";

const LOGO_SRC = "/foundcloud white.svg";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSendCode = async () => {
    if (!formData.email.trim()) {
      setError("Please enter your email address first");
      return;
    }

    setSendCodeLoading(true);
    setError("");
    setSuccess("");

    try {
      // Call the backend API to request password reset and send email
      console.log("Requesting password reset for email:", formData.email.trim());
      
      const response = await fetch(`${BASE_URL}/api/auth/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          email: formData.email.trim(),
        }),
      });

      console.log("Response status:", response.status, response.statusText);
      
      const data = await response.json().catch((parseErr) => {
        console.error("Failed to parse response:", parseErr);
        return {};
      });

      console.log("Response data:", data);

      // If the endpoint doesn't exist (404) or is not implemented (501), use fallback
      if (!response.ok && (response.status === 404 || response.status === 501 || response.status === 405)) {
        // Fallback: Store request for admin to handle manually
        // The admin can see it in the Password Resets tab and send the code
        const resetRequests = JSON.parse(localStorage.getItem("passwordResetRequests") || "[]");
        if (!resetRequests.includes(formData.email.trim())) {
          resetRequests.push(formData.email.trim());
          localStorage.setItem("passwordResetRequests", JSON.stringify(resetRequests));
        }
        
        setSuccess(
          "Password reset request received. An admin will send you the reset code shortly. " +
          "Please check your email or contact support if you don't receive it within a few minutes."
        );
        setCodeSent(true);
        setSendCodeLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          data?.error ||
          (response.status === 404
            ? "User not found with this email address"
            : response.status === 400
            ? "Invalid email address"
            : "Failed to send reset code. Please try again.");
        throw new Error(errorMsg);
      }

      // Store the reset request in localStorage so admin can see it
      const resetRequests = JSON.parse(localStorage.getItem("passwordResetRequests") || "[]");
      if (!resetRequests.includes(formData.email.trim())) {
        resetRequests.push(formData.email.trim());
        localStorage.setItem("passwordResetRequests", JSON.stringify(resetRequests));
      }

      setSuccess(
        data?.message ||
          "Password reset code has been sent to your email. Please check your inbox and enter the code below."
      );
      setCodeSent(true);
    } catch (err) {
      console.error("Error sending code request:", err);
      // If it's a network/CORS error, still store the request for admin
      if (err.message.includes("Failed to fetch") || err.message.includes("CORS")) {
        const resetRequests = JSON.parse(localStorage.getItem("passwordResetRequests") || "[]");
        if (!resetRequests.includes(formData.email.trim())) {
          resetRequests.push(formData.email.trim());
          localStorage.setItem("passwordResetRequests", JSON.stringify(resetRequests));
        }
        setError(
          "Unable to connect to the server. Your request has been saved. " +
          "Please contact an admin or try again later."
        );
      } else {
        setError(err.message || "Failed to send code request. Please try again.");
      }
    } finally {
      setSendCodeLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          token: formData.token.trim(),
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          (res.status === 404
            ? "User not found"
            : res.status === 400 || res.status === 401
            ? "Invalid reset token"
            : "Reset token is expired or already used");
        throw new Error(msg);
      }

      setSuccess(
        data?.message || "Password updated successfully. You can now sign in with your new password."
      );

      setTimeout(() => {
        navigate("/signin", { replace: true });
      }, 1500);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-24 h-24 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-20 h-20 bg-red-300 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-red-400 rounded-full opacity-40 animate-ping"></div>
      <div className="absolute inset-0 bg-[#850303]/10 blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="inline-flex items-center text-sm text-red-900 hover:text-red-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sign In
          </button>
          <div className="h-8 w-8">
            <img src={LOGO_SRC} alt="FoundCloud logo" className="h-full w-full object-contain" />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#850303] rounded-2xl mb-6 shadow-lg">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">Reset Password</h2>
          <p className="text-muted-foreground text-sm">
            Enter your email, the reset code from your email, and your new password.
          </p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendCodeLoading || !formData.email.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {sendCodeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Send Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="token">
              Reset code
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="token"
                name="token"
                type="text"
                value={formData.token}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Enter the code from your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Enter a new password (min 8 characters)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#850303] hover:bg-[#660000] text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Reset password</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 mt-3">
            Remember your password?{" "}
            <Link to="/signin" className="text-[#850303] hover:underline font-medium">
              Go back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

