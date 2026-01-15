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

  // Normalize role for allowedRoles check (case-insensitive, consistent with AuthContext)
  // Use the same normalization logic as AuthContext
  const normalizeRole = (rawRole) => {
    if (!rawRole) return "user"
    const role = rawRole.toString().toLowerCase().trim()
    if (role === "admin") {
      return "admin"
    } else if (
      role === "staff" ||
      role === "security" ||
      role === "security_officer" ||
      role === "security-officer"
    ) {
      return "security"
    }
    return "user"
  }
  
  const normalizedRole = normalizeRole(user?.role)
  console.log("AuthGuard: Normalized role:", normalizedRole, "from raw role:", user?.role)

  // Normalize allowedRoles to lowercase for comparison
  const normalizedAllowedRoles = allowedRoles.map(role => role.toString().toLowerCase().trim())
  
  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedRole)) {
    console.log(
      "AuthGuard: User role not in allowed roles. User role:",
      normalizedRole,
      "Allowed:",
      normalizedAllowedRoles
    )
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default AuthGuard
