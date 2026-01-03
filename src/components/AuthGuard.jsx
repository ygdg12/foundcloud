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

  // CRITICAL: Validate user object exists and has required properties
  if (!user || !user.role) {
    console.error("AuthGuard: Invalid user object, redirecting to signin")
    return <Navigate to="/signin" replace />
  }

  const userStatus = user?.status
  const userRole = user?.role
  
  // CRITICAL: Staff and admin are auto-approved - they should NEVER be blocked regardless of status
  // Check role FIRST before any status checks
  // Normalize role to handle any variations
  const normalizedRole = userRole === "staff" ? "security" : userRole
  const isAutoApproved = normalizedRole === "admin" || normalizedRole === "security" || normalizedRole === "staff"
  
  // Special handling for pending page - ONLY allow regular users with pending status
  if (requirePendingStatus) {
    // CRITICAL: If admin/security/staff tries to access pending page, redirect them immediately
    // This check MUST happen first to prevent admin/security from seeing pending page
    if (isAutoApproved) {
      console.log("AuthGuard: Admin/Security/Staff user tried to access pending page, redirecting. Role:", normalizedRole)
      const destination = normalizedRole === "admin" ? "/admin" : normalizedRole === "security" ? "/security" : "/dashboard"
      return <Navigate to={destination} replace />
    }
    // Only allow users with role "user" and status "pending"
    // If role is not "user", redirect to dashboard
    if (normalizedRole !== "user") {
      console.log("AuthGuard: Non-user role tried to access pending page, redirecting. Role:", normalizedRole)
      return <Navigate to="/dashboard" replace />
    }
    // If status is not "pending", redirect to dashboard
    if (userStatus !== "pending") {
      console.log("AuthGuard: User status is not pending, redirecting. Status:", userStatus)
      return <Navigate to="/dashboard" replace />
    }
    // User is a regular user with pending status - allow access to pending page
    console.log("AuthGuard: Regular user with pending status, allowing access to pending page")
    return children
  }
  
  // For all other routes, check status for regular users ONLY
  // Admin/security/staff bypass all status checks
  if (!isAutoApproved) {
    // Only regular users need approval
    const isApproved = userStatus === "approved"
    
    if (!isApproved) {
      // Redirect pending users to pending page, rejected users to signin
      if (userStatus === "pending") {
        console.log("AuthGuard: Regular user with pending status, redirecting to pending page")
        return <Navigate to="/pending" replace />
      } else if (userStatus === "rejected") {
        console.log("AuthGuard: Regular user with rejected status, redirecting to signin")
        return <Navigate to="/signin" state={{ infoMessage: "Your account has been rejected. Please contact support." }} replace />
      }
      // Fallback for any other status - redirect to pending page
      console.log("AuthGuard: Regular user with unknown status, redirecting to pending page. Status:", userStatus)
      return <Navigate to="/pending" replace />
    }
  }
  
  // Admin/security/staff users pass through here without status checks
  console.log("AuthGuard: User authorized. Role:", normalizedRole, "Status:", userStatus)

  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    console.log("AuthGuard: User role not in allowed roles. User role:", normalizedRole, "Allowed:", allowedRoles)
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default AuthGuard
