"use client";

import { useLocation, useNavigate } from "react-router-dom";

export default function PendingApprovalPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const status = location.state?.status || "pending";
  const backendMessage = location.state?.message;

  const title =
    status === "rejected"
      ? "Your account was rejected"
      : "Your account is pending approval";

  const description =
    backendMessage ||
    (status === "rejected"
      ? "Your account has been rejected by an administrator. Please contact customer support for more information."
      : "Your account has been created and is waiting for admin approval. You will be able to log in once an administrator approves your account.");

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-red-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-red-900 mb-3">{title}</h1>
        <p className="text-gray-700 mb-6 text-sm sm:text-base">{description}</p>
        {status === "rejected" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-3">
              If you believe this is a mistake or need assistance, please contact our customer support team.
            </p>
            <button
              type="button"
              onClick={() => navigate("/support", { replace: true })}
              className="text-sm text-red-900 hover:text-red-700 font-semibold underline"
            >
              Contact Customer Support →
            </button>
          </div>
        )}
        {status !== "rejected" && (
          <p className="text-xs sm:text-sm text-gray-500 mb-6">
            This usually takes a short time. Try logging in again later. If it
            takes too long, contact the admin or security officer.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate("/signin", { replace: true })}
            className="px-5 py-2.5 rounded-lg bg-[#850303] text-white text-sm font-semibold hover:bg-[#660000] transition-colors duration-200"
          >
            Back to Login
          </button>
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

