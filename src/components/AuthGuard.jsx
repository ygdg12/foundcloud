"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const AuthGuard = ({ children, allowedRoles = [], requirePendingStatus = false }) => {
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

  const userStatus = user?.status
  const userRole = user?.role
  
  // Staff and admin are auto-approved - they should NEVER be blocked regardless of status
  const isAutoApproved = userRole === "admin" || userRole === "security" || userRole === "staff"
  
  // Special handling for pending page - ONLY allow regular users with pending status
  if (requirePendingStatus) {
    // If admin/security tries to access pending page, redirect them to their dashboard
    if (isAutoApproved) {
      const destination = userRole === "admin" ? "/admin" : userRole === "security" ? "/security" : "/dashboard"
      return <Navigate to={destination} replace />
    }
    // Only allow users with role "user" and status "pending"
    if (userRole !== "user" || userStatus !== "pending") {
      return <Navigate to="/dashboard" replace />
    }
    // User is a regular user with pending status - allow access to pending page
    return children
  }
  
  // For all other routes, check status for regular users only
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
