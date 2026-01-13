"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Lock } from "lucide-react";

const BASE_URL =
  import.meta.env?.VITE_BASE_URL ||
  process.env.REACT_APP_BASE_URL ||
  "https://lost-items-backend-q30o.onrender.com";

const LOGO_SRC = "/foundcloud white.svg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${BASE_URL}/api/auth/request-password-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          (res.status === 400
            ? "Invalid email address"
            : res.status === 404
            ? "User not found with this email"
            : "Failed to submit password reset request");
        throw new Error(msg);
      }

      setSuccess(
        data?.message ||
          "Password reset request submitted. Please wait for an admin to generate a reset code for you."
      );
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to submit password reset request. Please try again.");
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
          <h2 className="text-2xl font-bold text-card-foreground mb-2">Forgot Password</h2>
          <p className="text-muted-foreground text-sm">
            Enter your email and we’ll submit a reset request. An admin will generate a reset code for you.
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
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="you@example.com"
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
                <span>Submitting request...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Submit Reset Request</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 mt-3">
            Already have a code?{" "}
            <Link to="/reset-password" className="text-[#850303] hover:underline font-medium">
              Reset password with code
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

