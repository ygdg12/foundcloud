/**
 * Utility function to determine the correct redirect path based on user role and status
 * 
 * CRITICAL RULE: Only regular users (role: "user") with status "pending" should see the pending page.
 * Staff and Admin are ALWAYS auto-approved and should NEVER see the pending page.
 * 
 * @param {Object} user - User object with role and status
 * @returns {string} - Redirect path
 */
export const getUserRedirectPath = (user) => {
  if (!user || !user.role) {
    return "/signin";
  }

  // Normalize role (staff -> security)
  const normalizedRole = user.role === "staff" ? "security" : user.role;
  const userStatus = user.status || "pending";

  // CRITICAL: Regular user with pending status → Pending page
  if (normalizedRole === "user" && userStatus === "pending") {
    return "/pending";
  }

  // Rejected user → Signin with message
  if (userStatus === "rejected") {
    return "/signin"; // Will show rejection message
  }

  // Staff users → Staff/Security dashboard
  if (normalizedRole === "security" || normalizedRole === "staff") {
    return "/security";
  }

  // Admin users → Admin dashboard
  if (normalizedRole === "admin") {
    return "/admin";
  }

  // Approved regular users → Homepage/Dashboard
  if (normalizedRole === "user" && userStatus === "approved") {
    return "/dashboard";
  }

  // Default fallback
  return "/dashboard";
};

/**
 * Check if user should see the pending page
 * ONLY returns true for regular users (role: "user") with status "pending"
 * 
 * @param {Object} user - User object with role and status
 * @returns {boolean} - True if user should see pending page
 */
export const shouldShowPendingPage = (user) => {
  if (!user || !user.role) {
    return false;
  }

  // Normalize role
  const normalizedRole = user.role === "staff" ? "security" : user.role;
  const userStatus = user.status || "pending";

  // ONLY show pending page if: role is "user" AND status is "pending"
  return normalizedRole === "user" && userStatus === "pending";
};

/**
 * Check if user is auto-approved (staff or admin)
 * These users should NEVER see the pending page
 * 
 * @param {Object} user - User object with role
 * @returns {boolean} - True if user is auto-approved
 */
export const isAutoApproved = (user) => {
  if (!user || !user.role) {
    return false;
  }

  const normalizedRole = user.role === "staff" ? "security" : user.role;
  return normalizedRole === "admin" || normalizedRole === "security" || normalizedRole === "staff";
};

