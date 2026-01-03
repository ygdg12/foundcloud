import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const BASE_URL =
  import.meta.env?.VITE_BASE_URL ||
  process.env.REACT_APP_BASE_URL ||
  "https://lost-items-backend-q30o.onrender.com";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async (skipApiFetch = false) => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    console.log("checkAuth: Reading localStorage:", { token, userData });

    if (!token) {
      console.log("checkAuth: No token found");
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // Validate token expiration first
    try {
      const decoded = jwtDecode(token);
      console.log("checkAuth: Decoded token:", decoded);
      if (decoded.exp * 1000 <= Date.now()) {
        console.log("checkAuth: Token expired, clearing localStorage");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("checkAuth: Error decoding token:", error.message);
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // CRITICAL: Fetch fresh user data from /api/auth/me to ensure we have the correct user
    // This prevents issues where localStorage has stale data from a different user
    if (!skipApiFetch) {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          method: "GET",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Handle both { user: {...} } and direct user object responses
          const fetchedUser = data.user || data;
          
          // Normalize role (staff -> security)
          const serverRole = fetchedUser.role === "staff" ? "security" : fetchedUser.role;
          const allowedRoles = ["user", "security", "admin"];
          const normalizedRole = allowedRoles.includes(serverRole) ? serverRole : "user";
          const normalizedUser = { ...fetchedUser, role: normalizedRole };
          
          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          
          console.log("checkAuth: Fetched fresh user data from API:", normalizedUser);
          setUser(normalizedUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } else {
          console.warn("checkAuth: Failed to fetch from /api/auth/me, using cached data");
          // Fall through to use cached data
        }
      } catch (apiError) {
        console.warn("checkAuth: Error fetching from /api/auth/me:", apiError);
        // Fall through to use cached data
      }
    }

    // Fallback: Use cached data from localStorage if API fetch fails or is skipped
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("checkAuth: Using cached user data:", parsedUser);
        
        // Normalize role in cached data too
        const serverRole = parsedUser.role === "staff" ? "security" : parsedUser.role;
        const allowedRoles = ["user", "security", "admin"];
        const normalizedRole = allowedRoles.includes(serverRole) ? serverRole : "user";
        const normalizedUser = { ...parsedUser, role: normalizedRole };
        
        setUser(normalizedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("checkAuth: Error parsing cached user data:", error.message);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      console.log("checkAuth: No user data found");
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    // On initial load, fetch fresh user data from API
    checkAuth(false);
    window.addEventListener("authChange", () => checkAuth(true)); // Use cached data on authChange events
    console.log("AuthContext: Added authChange listener");
    return () => {
      window.removeEventListener("authChange", checkAuth);
      console.log("AuthContext: Removed authChange listener");
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("authChange"));
    console.log("AuthContext: Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);