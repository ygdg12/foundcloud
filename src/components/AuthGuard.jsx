"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { getUserRedirectPath } from "../utils/userRedirect"

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

  console.log("AuthGuard: User authorized. Role:", user?.role)

  // Normalize role for allowedRoles check
  const normalizedRole = user?.role === "staff" ? "security" : user?.role
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    console.log("AuthGuard: User role not in allowed roles. User role:", normalizedRole, "Allowed:", allowedRoles)
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default AuthGuard
