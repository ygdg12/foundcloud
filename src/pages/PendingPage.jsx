"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

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
    // Get user from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "null")
      const token = localStorage.getItem("authToken")
      
      if (!userData || !token) {
        navigate("/signin", { replace: true })
        return
      }

      setUser(userData)
      const userStatus = userData.status || "pending"
      setStatus(userStatus)

      // Staff and admin are auto-approved - redirect immediately, don't show pending page
      const userRole = userData.role
      if (userRole === "admin" || userRole === "security" || userRole === "staff") {
        console.log("Admin/Security/Staff user detected, redirecting to dashboard")
        // Determine correct destination based on role
        const destination = userRole === "admin" ? "/admin" : userRole === "security" ? "/security" : "/dashboard"
        navigate(destination, { replace: true })
        return
      }

      // If already approved, redirect to home
      if (userStatus === "approved") {
        navigate("/dashboard", { replace: true })
        return
      }

      setLoading(false)
    } catch (error) {
      console.error("Error loading user:", error)
      navigate("/signin", { replace: true })
    }
  }, [navigate])

  // Check user status periodically or on button click
  const checkStatus = async () => {
    if (!user) return

    setChecking(true)
    try {
      const token = localStorage.getItem("authToken")
      const userEmail = user.email
      
      // Try multiple endpoints to get user info
      const endpoints = [
        `${BASE_URL}/api/auth/me`,
        `${BASE_URL}/api/users/me`,
        `${BASE_URL}/api/user/me`,
      ]
      
      let updatedUser = null
      let newStatus = status

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (response.ok) {
            const data = await response.json()
            updatedUser = data.user || data
            newStatus = updatedUser.status || "pending"
            break
          }
        } catch (err) {
          // Try next endpoint
          continue
        }
      }

      // If we couldn't get user info from those endpoints, try signing in again
      // This will get the latest user status from the backend
      if (!updatedUser && userEmail) {
        try {
          // Try to get user from admin endpoint (if token allows)
          const adminResponse = await fetch(`${BASE_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (adminResponse.ok) {
            const adminData = await adminResponse.json()
            const foundUser = (adminData.users || []).find(u => u.email === userEmail)
            if (foundUser) {
              updatedUser = foundUser
              newStatus = foundUser.status || "pending"
            }
          }
        } catch (err) {
          console.log("Could not fetch from admin endpoint:", err)
        }
      }

      // If we got updated user info
      if (updatedUser) {
        // Update localStorage
        const serverRole = updatedUser.role === "staff" ? "security" : updatedUser.role
        const allowedRoles = ["user", "security", "admin"]
        const normalizedRole = allowedRoles.includes(serverRole) ? serverRole : "user"
        const normalizedUser = { ...updatedUser, role: normalizedRole }
        
        localStorage.setItem("user", JSON.stringify(normalizedUser))

        // If approved, redirect to home immediately
        if (newStatus === "approved") {
          console.log("User approved! Redirecting to dashboard...")
          window.dispatchEvent(new Event("authChange"))
          // Small delay to ensure state is updated
          setTimeout(() => {
            navigate("/dashboard", { replace: true })
          }, 100)
          return
        }

        // Update status
        setStatus(newStatus)
        setUser(normalizedUser)
      } else {
        // If we can't get user info, the token might be invalid
        // User should sign in again after approval
        console.log("Could not fetch user status. User may need to sign in again after approval.")
      }
    } catch (error) {
      console.error("Error checking status:", error)
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

