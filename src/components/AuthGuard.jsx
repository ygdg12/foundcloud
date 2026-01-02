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

  // Check user status - only allow approved users (staff and admin are auto-approved)
  const userStatus = user?.status
  const userRole = user?.role
  
  // Staff and admin are auto-approved, so they don't have status or have status "approved"
  const isAutoApproved = userRole === "admin" || userRole === "security" || userRole === "staff"
  const isApproved = isAutoApproved || userStatus === "approved"
  
  if (!isApproved) {
    // Redirect to signin with appropriate message
    if (userStatus === "pending") {
      return <Navigate to="/signin" state={{ infoMessage: "Your account is pending approval. Please wait for admin approval." }} replace />
    } else if (userStatus === "rejected") {
      return <Navigate to="/signin" state={{ infoMessage: "Your account has been rejected. Please contact support." }} replace />
    }
    // Fallback for any other status
    return <Navigate to="/signin" state={{ infoMessage: "Your account is not approved. Please contact support." }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default AuthGuard
