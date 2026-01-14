"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const AuthGuard = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  // Validate user object exists and has required properties
  if (!user || !user.role) {
    console.error("AuthGuard: Invalid user object, redirecting to signin")
    return <Navigate to="/signin" replace />
  }

  // Enforce status-based access: only "approved" users may access protected routes
  if (user.status && user.status !== "approved") {
    const message =
      user.status === "rejected"
        ? "Your account was rejected. Contact support."
        : "Your account is waiting for admin approval.";

    return (
      <Navigate
        to="/pending-approval"
        replace
        state={{ status: user.status, message }}
      />
    );
  }

  console.log("AuthGuard: User authorized. Role:", user?.role)

  // Normalize role for allowedRoles check (case-insensitive)
  let normalizedRole = (user?.role || "").toString().toLowerCase()
  if (
    normalizedRole === "staff" ||
    normalizedRole === "security_officer" ||
    normalizedRole === "security-officer"
  ) {
    normalizedRole = "security"
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    console.log(
      "AuthGuard: User role not in allowed roles. User role:",
      normalizedRole,
      "Allowed:",
      allowedRoles
    )
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default AuthGuard
