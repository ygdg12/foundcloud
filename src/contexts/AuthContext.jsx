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
    let decoded;
    try {
      decoded = jwtDecode(token);
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

    // CRITICAL: Verify token user ID matches cached user ID (if cached user exists)
    // This prevents using stale user data from a different user's token
    if (userData) {
      try {
        const cachedUser = JSON.parse(userData);
        const tokenUserId = decoded.userId || decoded.id || decoded._id || decoded.sub;
        const cachedUserId = cachedUser._id || cachedUser.id;
        
        // If user IDs don't match, clear localStorage - token and user don't belong together
        if (tokenUserId && cachedUserId && tokenUserId.toString() !== cachedUserId.toString()) {
          console.error("checkAuth: Token user ID doesn't match cached user ID. Clearing localStorage.", {
            tokenUserId,
            cachedUserId
          });
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn("checkAuth: Could not verify token-user match:", error);
      }
    }

    // Prefer fresh user data from /api/auth/me, but if that fails (e.g. CORS / backend down),
    // fall back to cached user instead of logging the user out. This prevents admin refresh
    // from kicking users to the signup page when the backend has temporary issues.
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
          
          // CRITICAL: Verify the fetched user ID matches the token user ID
          const tokenUserId = decoded.userId || decoded.id || decoded._id || decoded.sub;
          const fetchedUserId = fetchedUser._id || fetchedUser.id;
          
          if (tokenUserId && fetchedUserId && tokenUserId.toString() !== fetchedUserId.toString()) {
            console.error("checkAuth: Token user ID doesn't match API response user ID!", {
              tokenUserId,
              fetchedUserId
            });
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
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
          console.error("checkAuth: Failed to fetch from /api/auth/me. Status:", response.status);
          console.error(
            "checkAuth: This might be a CORS or backend issue. Falling back to cached user data if available."
          );
        }
      } catch (apiError) {
        // If API call fails (network error, CORS, etc.), fall back to cached data
        console.error("checkAuth: Error fetching from /api/auth/me:", apiError);
        console.error(
          "checkAuth: Treating this as a temporary backend issue. Will attempt to use cached user data instead."
        );
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
    // On initial load, ALWAYS fetch fresh user data from API (never use cached data)
    // This ensures we have the correct user data and prevents stale data issues
    checkAuth(false);
    // On authChange events, also fetch fresh data to ensure we have the latest user info
    window.addEventListener("authChange", () => checkAuth(false)); // Fetch fresh data on authChange too
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