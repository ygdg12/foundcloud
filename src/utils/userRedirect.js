/**
 * Utility function to determine the correct redirect path based on user role.
 * Backend now enforces user status ("pending" | "approved" | "rejected").
 * This helper assumes sign-in only succeeds for "approved" users.
 *
 * @param {Object} user - User object with role (and optionally status)
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

