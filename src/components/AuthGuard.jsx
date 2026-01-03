"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { shouldShowPendingPage, isAutoApproved, getUserRedirectPath } from "../utils/userRedirect"

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

  // CRITICAL: Use utility functions to check user status
  const userIsAutoApproved = isAutoApproved(user)
  const userShouldShowPending = shouldShowPendingPage(user)
  
  // Special handling for pending page - ONLY allow regular users with pending status
  if (requirePendingStatus) {
    // CRITICAL: If user should NOT see pending page, redirect them immediately
    if (!userShouldShowPending) {
      const redirectPath = getUserRedirectPath(user)
      console.log("AuthGuard: User should not see pending page, redirecting. Role:", user?.role, "Status:", user?.status, "Redirect:", redirectPath)
      return <Navigate to={redirectPath} replace />
    }
    // User is a regular user with pending status - allow access to pending page
    console.log("AuthGuard: Regular user with pending status, allowing access to pending page")
    return children
  }
  
  // For all other routes, check status for regular users ONLY
  // Admin/security/staff bypass all status checks
  if (!userIsAutoApproved) {
    // Only regular users need approval
    const userStatus = user?.status
    
    if (userStatus === "rejected") {
      console.log("AuthGuard: Regular user with rejected status, redirecting to signin")
      return <Navigate to="/signin" state={{ infoMessage: "Your account has been rejected. Please contact support." }} replace />
    }
    
    // If user should see pending page, redirect them
    if (userShouldShowPending) {
      console.log("AuthGuard: Regular user with pending status, redirecting to pending page")
      return <Navigate to="/pending" replace />
    }
    
    // If user is not approved and not pending, redirect to pending (fallback)
    if (userStatus !== "approved") {
      console.log("AuthGuard: Regular user with unknown status, redirecting to pending page. Status:", userStatus)
      return <Navigate to="/pending" replace />
    }
  }
  
  // Admin/security/staff users pass through here without status checks
  console.log("AuthGuard: User authorized. Role:", user?.role, "Status:", user?.status)

  // Normalize role for allowedRoles check
  const normalizedRole = user?.role === "staff" ? "security" : user?.role
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    console.log("AuthGuard: User role not in allowed roles. User role:", normalizedRole, "Allowed:", allowedRoles)
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default AuthGuard
