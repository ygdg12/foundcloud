"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { shouldShowPendingPage, getUserRedirectPath } from "../utils/userRedirect"

const BASE_URL =
  import.meta.env?.VITE_BASE_URL ||
  process.env.REACT_APP_BASE_URL ||
  "https://lost-items-backend-q30o.onrender.com"

const LOGO_SRC = "/foundcloud white.svg"

export default function PendingPage() {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    // CRITICAL: Fetch user data from /api/auth/me to get latest role and status
    // This ensures we have the most up-to-date information from the backend
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const cachedUserData = JSON.parse(localStorage.getItem("user") || "null")
        
        if (!token) {
          console.log("PendingPage: No token, redirecting to signin")
          navigate("/signin", { replace: true })
          return
        }

        // Fetch latest user data from /api/auth/me
        let userData = cachedUserData
        let userRole = cachedUserData?.role
        let userStatus = cachedUserData?.status || "pending"

        try {
          const response = await fetch(`${BASE_URL}/api/auth/me`, {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "Accept": "application/json"
            }
          })

          if (response.ok) {
            const data = await response.json()
            // Handle both { user: {...} } and direct user object responses
            const fetchedUser = data.user || data
            
            // Normalize role (staff -> security)
            const serverRole = fetchedUser.role === "staff" ? "security" : fetchedUser.role
            const allowedRoles = ["user", "security", "admin"]
            const normalizedRole = allowedRoles.includes(serverRole) ? serverRole : "user"
            
            userData = { ...fetchedUser, role: normalizedRole }
            userRole = normalizedRole
            userStatus = fetchedUser.status || "pending"
            
            // Update localStorage with latest data
            localStorage.setItem("user", JSON.stringify(userData))
          } else {
            console.warn("PendingPage: Failed to fetch from /api/auth/me, using cached data")
            // Use cached data if API fails
            if (!cachedUserData) {
              navigate("/signin", { replace: true })
              return
            }
          }
        } catch (apiError) {
          console.warn("PendingPage: Error fetching from /api/auth/me:", apiError)
          // Use cached data if API fails
          if (!cachedUserData) {
            navigate("/signin", { replace: true })
            return
          }
        }

        // CRITICAL: Check if user should see pending page
        // ONLY regular users (role: "user") with status "pending" should see this page
        const shouldShowPending = shouldShowPendingPage(userData)
        
        if (!shouldShowPending) {
          // User should NOT see pending page - redirect to appropriate page
          const redirectPath = getUserRedirectPath(userData)
          console.log("PendingPage: User should not see pending page. Role:", userRole, "Status:", userStatus, "Redirecting to:", redirectPath)
          navigate(redirectPath, { replace: true })
          return
        }

        // All checks passed - this is a regular user with pending status
        // Safe to show pending page
        console.log("PendingPage: Regular user with pending status, showing pending page")
        setUser(userData)
        setStatus(userStatus)
        setLoading(false)
      } catch (error) {
        console.error("PendingPage: Error loading user:", error)
        navigate("/signin", { replace: true })
      }
    }

    fetchUserData()
  }, [navigate])

  // Check user status periodically or on button click
  const checkStatus = async () => {
    if (!user) return

    setChecking(true)
    try {
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        console.log("PendingPage: No token found, redirecting to signin")
        navigate("/signin", { replace: true })
        return
      }

      // Use /api/auth/me endpoint (now live)
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })

      if (!response.ok) {
        console.warn("PendingPage: Failed to fetch user status from /api/auth/me")
        setChecking(false)
        return
      }

      const data = await response.json()
      // Handle both { user: {...} } and direct user object responses
      const updatedUser = data.user || data
      
      // Normalize role (staff -> security)
      const serverRole = updatedUser.role === "staff" ? "security" : updatedUser.role
      const allowedRoles = ["user", "security", "admin"]
      const normalizedRole = allowedRoles.includes(serverRole) ? serverRole : "user"
      const normalizedUser = { ...updatedUser, role: normalizedRole }
      
      const newStatus = updatedUser.status || "pending"
      const updatedUserWithStatus = { ...normalizedUser, status: newStatus }

      // Update localStorage with latest data
      localStorage.setItem("user", JSON.stringify(updatedUserWithStatus))

      // CRITICAL: Check if user should still see pending page
      const shouldStillShowPending = shouldShowPendingPage(updatedUserWithStatus)
      
      if (!shouldStillShowPending) {
        // User should no longer see pending page - redirect to appropriate page
        const redirectPath = getUserRedirectPath(updatedUserWithStatus)
        console.log("PendingPage: User status changed, should not see pending page. Redirecting to:", redirectPath)
        window.dispatchEvent(new Event("authChange"))
        navigate(redirectPath, { replace: true })
        return
      }

      // User is still a regular user with pending status - update state
      setStatus(newStatus)
      setUser(updatedUserWithStatus)
    } catch (error) {
      console.error("PendingPage: Error checking status:", error)
      // If there's a network error, don't update state but allow user to retry
    } finally {
      setChecking(false)
    }
  }

  // Auto-check status every 5 seconds (more frequent for faster detection)
  useEffect(() => {
    if (!user || status === "approved") return

    // Check immediately on mount
    checkStatus()

    const interval = setInterval(() => {
      checkStatus()
    }, 5000) // Check every 5 seconds for faster approval detection

    return () => clearInterval(interval)
  }, [user, status])

  const handleLogout = () => {
    logout()
    navigate("/signin", { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Bubbly background */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-20 h-20 bg-red-300 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-red-400 rounded-full opacity-40 animate-ping"></div>
      <div className="absolute inset-0 bg-[#850303]/10 blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16">
            <img src={LOGO_SRC} alt="FoundCloud logo" className="h-full w-full object-contain" loading="lazy" />
          </div>
        </div>

        {/* Status Content */}
        {status === "pending" ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h1>
              <p className="text-gray-600">
                Your account is waiting for admin approval. We'll notify you once your account has been reviewed.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">What happens next?</p>
                  <p className="text-sm text-yellow-800">
                    An administrator will review your registration. This page will automatically update when your account is approved.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={checkStatus}
                disabled={checking}
                className="w-full px-4 py-3 rounded-lg bg-[#850303] text-white font-semibold hover:bg-[#700202] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Checking Status...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Check Status Now</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              This page will automatically refresh every 10 seconds
            </p>
          </>
        ) : status === "rejected" ? (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Rejected</h1>
              <p className="text-gray-600">
                Unfortunately, your account registration has been rejected.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-900 mb-1">What can you do?</p>
                  <p className="text-sm text-red-800 mb-2">
                    If you believe this is an error, please contact support for assistance.
                  </p>
                  {user?.rejectionReason && (
                    <div className="mt-2 p-2 bg-white rounded border border-red-200">
                      <p className="text-xs font-semibold text-red-900 mb-1">Rejection Reason:</p>
                      <p className="text-xs text-red-800">{user.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-lg bg-[#850303] text-white font-semibold hover:bg-[#700202] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}

