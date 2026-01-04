/**
 * Utility function to determine the correct redirect path based on user role
 * All users are now auto-approved, so we only check roles.
 * 
 * @param {Object} user - User object with role
 * @returns {string} - Redirect path
 */
export const getUserRedirectPath = (user) => {
  if (!user || !user.role) {
    return "/signin";
  }

  // Normalize role (staff -> security)
  const normalizedRole = user.role === "staff" ? "security" : user.role;

  // Staff users → Staff/Security dashboard
  if (normalizedRole === "security" || normalizedRole === "staff") {
    return "/security";
  }

  // Admin users → Admin dashboard
  if (normalizedRole === "admin") {
    return "/admin";
  }

  // Regular users → Homepage/Dashboard
  return "/dashboard";
};

