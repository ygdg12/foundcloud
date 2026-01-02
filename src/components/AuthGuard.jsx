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
  
  // Staff and admin are auto-approved - they should NEVER be blocked regardless of status
  const isAutoApproved = userRole === "admin" || userRole === "security" || userRole === "staff"
  
  // Only check status for regular users (not admin/security/staff)
  if (!isAutoApproved) {
    const isApproved = userStatus === "approved"
    
    if (!isApproved) {
      // Redirect pending users to pending page, rejected users to signin
      if (userStatus === "pending") {
        return <Navigate to="/pending" replace />
      } else if (userStatus === "rejected") {
        return <Navigate to="/signin" state={{ infoMessage: "Your account has been rejected. Please contact support." }} replace />
      }
      // Fallback for any other status - redirect to pending page
      return <Navigate to="/pending" replace />
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default AuthGuard
