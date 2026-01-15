"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  LayoutDashboard,
  Users,
  Package,
  AlertCircle,
  FileCheck,
  Key,
  LogOut,
  Home,
  RefreshCw,
  Lock,
  Mail,
  Menu,
  X
} from "lucide-react"

const LOGO_SRC = "/foundcloud white.svg"

const BASE_URL =
  import.meta.env?.VITE_BASE_URL ||
  process.env.REACT_APP_BASE_URL ||
  "https://lost-items-backend-q30o.onrender.com"

export default function Admin() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState("dashboard") // dashboard, users, resetRequests, foundItems, lostItems, claims, verificationCodes
  const [users, setUsers] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [lostItems, setLostItems] = useState([])
  const [claims, setClaims] = useState([])
  const [verificationCodes, setVerificationCodes] = useState([])
  const [resetRequests, setResetRequests] = useState([]) // For password reset requests tab
  const [resetRequestsStatus, setResetRequestsStatus] = useState("pending")
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [userToReject, setUserToReject] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [userAlert, setUserAlert] = useState(null) // { type: 'success' | 'error', title, message }
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [codeToDelete, setCodeToDelete] = useState(null)
  const [showDeleteCodeModal, setShowDeleteCodeModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // Mobile sidebar toggle
  const navigate = useNavigate()
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    // Wait for AuthContext to finish loading; guard will handle unauthenticated state
    if (authLoading) return

    if (!isAuthenticated || !authUser) {
          navigate("/signin", { replace: true })
          return
        }

    // Normalize role (case-insensitive) and treat staff/security_officer as security
    let normalizedRole = (authUser.role || "").toString().toLowerCase()
    if (
      normalizedRole === "staff" ||
      normalizedRole === "security" ||
      normalizedRole === "security_officer" ||
      normalizedRole === "security-officer"
    ) {
      normalizedRole = "security"
    }
    if (normalizedRole !== "admin") {
            navigate("/signin", { replace: true })
            return
          }

    setUser(authUser)
  }, [authUser, authLoading, isAuthenticated, navigate])

  useEffect(() => {
    // Fetch dashboard data on mount
    if (view === "dashboard") {
      fetchUsers()
      fetchClaims()
      fetchFoundItems()
      fetchLostItems()
    } else if (view === "users") {
      fetchUsers()
    } else if (view === "resetRequests") {
      fetchResetRequests()
    } else if (view === "foundItems") {
      fetchFoundItems()
    } else if (view === "lostItems") {
      fetchLostItems()
    } else if (view === "claims") {
      fetchClaims()
    } else if (view === "verificationCodes") {
      fetchVerificationCodes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]) // fetchClaims, fetchFoundItems, fetchLostItems, fetchUsers are stable functions

  const fetchUsers = async () => {
    // Don't set loading if we're on dashboard (to avoid blocking the UI)
    if (view !== "dashboard") {
      setLoading(true)
    }
    try {
      const token = localStorage.getItem("authToken")
      // Fetch all users for the management table
      const url = `${BASE_URL}/api/admin/users`
      const response = await fetch(url, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
      })
      if (response.ok) {
        const data = await response.json()
        // Filter out admin users
        const filteredUsers = (data.users || []).filter((u) => u.role !== "admin")
        setUsers(filteredUsers)
      } else {
        console.error("Error fetching users:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      if (error.message.includes("Failed to fetch") || error.message.includes("CORS")) {
        console.error("CORS Error: Backend needs to allow requests from:", window.location.origin)
      }
    } finally {
      if (view !== "dashboard") {
        setLoading(false)
      }
    }
  }

  const fetchResetRequests = async (status = resetRequestsStatus) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      let url = `${BASE_URL}/api/admin/password-reset-requests`
      if (status) {
        url += `?status=${encodeURIComponent(status)}`
      }
      const response = await fetch(url, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
      })
      if (response.ok) {
        const data = await response.json()
        setResetRequests(data.requests || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error fetching password reset requests:", errorData.message || response.statusText)
      }
    } catch (error) {
      console.error("Error fetching password reset requests:", error)
      if (error.message.includes("Failed to fetch") || error.message.includes("CORS")) {
        console.error("CORS Error: Backend needs to allow requests from:", window.location.origin)
      }
    } finally {
      setLoading(false)
    }
  }


  const fetchClaims = async () => {
    // Don't set loading if we're on dashboard (to avoid blocking the UI)
    if (view !== "dashboard") {
      setLoading(true)
    }
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${BASE_URL}/api/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setClaims(data.claims || [])
      } else {
        const errorData = await response.json()
        console.error("Error fetching claims:", errorData.message || "Failed to fetch claims")
      }
    } catch (error) {
      console.error("Error fetching claims:", error)
    } finally {
      if (view !== "dashboard") {
        setLoading(false)
      }
    }
  }

  const fetchFoundItems = async () => {
    // Don't set loading if we're on dashboard (to avoid blocking the UI)
    if (view !== "dashboard") {
      setLoading(true)
    }
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${BASE_URL}/api/found-items`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
      })
      if (response.ok) {
        const data = await response.json()
        setFoundItems(data.items || [])
      } else {
        console.error("Error fetching found items:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching found items:", error)
      if (error.message.includes("Failed to fetch") || error.message.includes("CORS")) {
        console.error("CORS Error: Backend needs to allow requests from:", window.location.origin)
      }
    } finally {
      if (view !== "dashboard") {
        setLoading(false)
      }
    }
  }

  const fetchLostItems = async () => {
    // Don't set loading if we're on dashboard (to avoid blocking the UI)
    if (view !== "dashboard") {
      setLoading(true)
    }
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${BASE_URL}/api/lost-items`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
      })
      if (response.ok) {
        const data = await response.json()
        setLostItems(data.items || [])
      } else {
        console.error("Error fetching lost items:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching lost items:", error)
      if (error.message.includes("Failed to fetch") || error.message.includes("CORS")) {
        console.error("CORS Error: Backend needs to allow requests from:", window.location.origin)
      }
    } finally {
      if (view !== "dashboard") {
        setLoading(false)
      }
    }
  }

  const handleDeleteClick = (userData) => {
    setUserToDelete(userData)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      const token = localStorage.getItem("authToken")
      const userId = userToDelete._id || userToDelete.id
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
      })
      if (response.ok) {
        setUsers(users.filter((u) => (u._id || u.id) !== userId))
        setShowDeleteModal(false)
        setUserToDelete(null)
      } else {
        const data = await response.json()
        console.error("Failed to delete user:", data.message || "Unknown error")
        setShowDeleteModal(false)
        setUserToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      setShowDeleteModal(false)
      setUserToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  const fetchVerificationCodes = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${BASE_URL}/api/admin/verification-codes`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
      })
      if (response.ok) {
        const data = await response.json()
        setVerificationCodes(data.codes || [])
      } else {
        const errorData = await response.json()
        console.error("Error fetching verification codes:", errorData.message || "Failed to fetch codes")
      }
    } catch (error) {
      console.error("Error fetching verification codes:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateVerificationCode = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${BASE_URL}/api/admin/verification-codes`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
      })
      if (response.ok) {
        const data = await response.json()
        console.log("API Response:", data)
        
        // Handle different response formats
        let codeValue = null
        
        // Case 1: data.code is a string (expected format: { code: "ABC12345", expiresAt: "..." })
        if (typeof data.code === "string") {
          codeValue = data.code
        }
        // Case 2: data.code is an object with a code property (nested: { code: { code: "ABC12345", ... } })
        else if (data.code && typeof data.code === "object" && typeof data.code.code === "string") {
          codeValue = data.code.code
        }
        // Case 3: The response itself is the code object (direct: { id, code: "ABC12345", ... })
        else if (data && typeof data === "object" && typeof data.code === "string" && data.id) {
          codeValue = data.code
        }
        // Case 4: Fallback - try to find code property anywhere
        else {
          codeValue = data?.code?.code || data?.code || null
        }
        
        console.log("Extracted code value:", codeValue, "Type:", typeof codeValue)
        
        if (codeValue && typeof codeValue === "string") {
          setGeneratedCode(codeValue)
          setShowCodeModal(true)
          // Refresh the codes list
          fetchVerificationCodes()
        } else {
          console.error("Invalid code format received:", data)
        }
      } else {
        const errorData = await response.json()
        console.error("Failed to generate verification code:", errorData.message || "Unknown error")
      }
    } catch (error) {
      console.error("Error generating verification code:", error)
    }
  }

  const handleDeleteCodeClick = (code) => {
    setCodeToDelete(code)
    setShowDeleteCodeModal(true)
  }

  const handleDeleteCodeConfirm = async () => {
    if (!codeToDelete) return

    try {
      const token = localStorage.getItem("authToken")
      const codeId = codeToDelete._id || codeToDelete.id
      const response = await fetch(`${BASE_URL}/api/admin/verification-codes/${codeId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: "cors",
      })
      if (response.ok) {
        setVerificationCodes(verificationCodes.filter((c) => (c._id || c.id) !== codeId))
        setShowDeleteCodeModal(false)
        setCodeToDelete(null)
      } else {
        const data = await response.json()
        console.error("Failed to delete verification code:", data.message || "Unknown error")
        setShowDeleteCodeModal(false)
        setCodeToDelete(null)
      }
    } catch (error) {
      console.error("Error deleting verification code:", error)
      setShowDeleteCodeModal(false)
      setCodeToDelete(null)
    }
  }

  const handleDeleteCodeCancel = () => {
    setShowDeleteCodeModal(false)
    setCodeToDelete(null)
  }

  const copyCodeToClipboard = (code) => {
    navigator.clipboard.writeText(code).catch((err) =>
      console.error("Failed to copy code to clipboard:", err)
    )
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    navigate("/signin")
  }

  return (
    <div className="min-h-screen bg-red-50 relative overflow-hidden">
      {/* Bubbly background */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-20 h-20 bg-red-300 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-red-400 rounded-full opacity-40 animate-ping"></div>
      <div className="absolute inset-0 bg-[#850303]/10 blur-3xl -z-10"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white shadow-lg relative z-20">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="h-10 w-10 md:h-12 md:w-12">
                  <img src={LOGO_SRC} alt="FoundCloud logo" className="h-full w-full object-contain" loading="lazy" />
                </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold">Admin Portal</h1>
                <p className="text-xs md:text-sm text-red-200">Welcome, {user?.name || "Admin"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => navigate("/admin")}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white text-red-900 rounded-lg font-semibold hover:bg-red-50 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)] relative z-10">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
          style={{ top: "80px" }}
        >
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              onClick={() => {
                setView("dashboard")
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                view === "dashboard"
                  ? "bg-red-900 text-white shadow-md"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-900"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setView("users")
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                view === "users"
                  ? "bg-red-900 text-white shadow-md"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-900"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </button>

            <button
              onClick={() => {
                setView("foundItems")
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                view === "foundItems"
                  ? "bg-red-900 text-white shadow-md"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-900"
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Found Items</span>
            </button>

            <button
              onClick={() => {
                setView("lostItems")
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                view === "lostItems"
                  ? "bg-red-900 text-white shadow-md"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-900"
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              <span>Lost Items</span>
            </button>

            <button
              onClick={() => {
                setView("claims")
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                view === "claims"
                  ? "bg-red-900 text-white shadow-md"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-900"
              }`}
            >
              <FileCheck className="w-5 h-5" />
              <span>Claims</span>
            </button>

            <button
              onClick={() => {
                setView("resetRequests")
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                view === "resetRequests"
                  ? "bg-red-900 text-white shadow-md"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-900"
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Reset Requests</span>
            </button>

            <button
              onClick={() => {
                setView("verificationCodes")
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                view === "verificationCodes"
                  ? "bg-red-900 text-white shadow-md"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-900"
              }`}
            >
              <Key className="w-5 h-5" />
              <span>Verification Codes</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-red-50 w-full md:w-auto">
          <div className="p-4 md:p-6">

            {view === "dashboard" && (
          <>
            <div className="mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Dashboard Overview</h2>
              <p className="text-sm md:text-base text-gray-600">Welcome to the admin control panel</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-[#850303]">{users.length}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <svg className="w-8 h-8 text-[#850303]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Lost Items</p>
                    <p className="text-3xl font-bold text-[#850303]">{lostItems.length}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Found Items</p>
                    <p className="text-3xl font-bold text-[#850303]">{foundItems.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Claims</p>
                    <p className="text-3xl font-bold text-[#850303]">{claims.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </>
            )}

            {view === "users" && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Users Management</h2>
                <p className="text-sm md:text-base text-gray-600">Manage and approve pending user accounts</p>
              </div>
                <button 
                onClick={fetchUsers}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#850303] text-white text-sm font-medium hover:opacity-90 transition"
                disabled={loading}
                >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
                </button>
              </div>

            {userAlert && (
              <div
                className={`mb-4 px-4 py-3 rounded-xl border flex items-start justify-between gap-3 ${
                  userAlert.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm md:text-base">{userAlert.title}</p>
                  {userAlert.message && (
                    <p className="mt-1 text-xs md:text-sm leading-snug break-words">{userAlert.message}</p>
                  )}
              </div>
                <button 
                  onClick={() => setUserAlert(null)}
                  className="ml-2 text-xs text-current hover:opacity-70 transition"
                  aria-label="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            )}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center py-12 text-gray-600">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Student ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const status = u.status || "pending"
                      return (
                        <tr key={u._id || u.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{u.name}</td>
                          <td className="py-3 px-4">{u.email}</td>
                          <td className="py-3 px-4">{u.studentId || "N/A"}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              u.role === "admin" ? "bg-red-100 text-red-800" :
                              u.role === "staff" ? "bg-green-100 text-green-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 align-top">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                  status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {status}
                              </span>
                              {status === "rejected" && u.rejectionReason && (
                                <div className="text-xs text-red-800 bg-red-50 border border-red-100 rounded-lg px-3 py-2 max-w-xs">
                                  <p className="font-semibold mb-0.5">Rejection reason</p>
                                  <p className="leading-snug break-words">{u.rejectionReason}</p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-2">
                              {status === "pending" && (
                                <>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const token = localStorage.getItem("authToken")
                                        const userId = u._id || u.id
                                        const res = await fetch(
                                          `${BASE_URL}/api/admin/users/${userId}/approve`,
                                          {
                                            method: "PATCH",
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                              "Content-Type": "application/json",
                                              Accept: "application/json",
                                            },
                                            mode: "cors",
                                          }
                                        )
                                        const data = await res.json().catch(() => ({}))
                                        if (!res.ok) {
                                          throw new Error(data.message || "Failed to approve user")
                                        }
                                        setUsers((prev) =>
                                          prev.map((userItem) =>
                                            (userItem._id || userItem.id) === userId
                                              ? { ...userItem, status: "approved", rejectionReason: undefined }
                                              : userItem
                                          )
                                        )
                                        setUserAlert({
                                          type: "success",
                                          title: `${u.name || "User"} has been approved`,
                                          message: null,
                                        })
                                      } catch (err) {
                                        console.error("Error approving user:", err)
                                        setUserAlert({
                                          type: "error",
                                          title: "Failed to approve user",
                                          message: err.message || "An unexpected error occurred while approving this user.",
                                        })
                                      }
                                    }}
                                    className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setUserToReject(u)
                                      setRejectReason("")
                                      setShowRejectModal(true)
                                    }}
                                    className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            <button
                              onClick={() => handleDeleteClick(u)}
                                className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition"
                            >
                              Remove
                            </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            )}

            {view === "foundItems" && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
            <div className="mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Found Items</h2>
              <p className="text-sm md:text-base text-gray-600">Audit and moderate reported found items</p>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading found items...</p>
              </div>
            ) : foundItems.length === 0 ? (
              <p className="text-center py-12 text-gray-600">No found items found</p>
            ) : (
              <div className="space-y-4">
                {foundItems.map((item) => (
                  <div key={item._id || item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span><strong>Category:</strong> {item.category}</span>
                          <span><strong>Location:</strong> {item.locationFound || "N/A"}</span>
                          <span><strong>Status:</strong> {item.status || "unclaimed"}</span>
                          {item.foundBy && (
                            <span><strong>Found By:</strong> {typeof item.foundBy === "object" ? item.foundBy.name : item.foundBy}</span>
                          )}
                          {item.dateFound && (
                            <span><strong>Date Found:</strong> {new Date(item.dateFound).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            )}

            {view === "lostItems" && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
            <div className="mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Lost Items</h2>
              <p className="text-sm md:text-base text-gray-600">Audit and moderate reported lost items</p>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading lost items...</p>
              </div>
            ) : lostItems.length === 0 ? (
              <p className="text-center py-12 text-gray-600">No lost items found</p>
            ) : (
              <div className="space-y-4">
                {lostItems.map((item) => (
                  <div key={item._id || item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span><strong>Category:</strong> {item.category}</span>
                          <span><strong>Location:</strong> {item.location || "N/A"}</span>
                          <span><strong>Status:</strong> {item.status || "active"}</span>
                          {item.reportedBy && (
                            <span><strong>Reported By:</strong> {typeof item.reportedBy === "object" ? item.reportedBy.name : item.reportedBy}</span>
                          )}
                          {item.dateLost && (
                            <span><strong>Date Lost:</strong> {new Date(item.dateLost).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            )}

            {view === "resetRequests" && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Password Reset Requests</h2>
                <p className="text-sm md:text-base text-gray-600">
                  View password reset requests and generate reset codes for users.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={resetRequestsStatus}
                  onChange={(e) => {
                    const value = e.target.value
                    setResetRequestsStatus(value)
                    fetchResetRequests(value)
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="code_generated">Code Generated</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                </select>
                <button
                  onClick={() => fetchResetRequests()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#850303] text-white text-sm font-medium hover:opacity-90 transition"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading reset requests...</p>
              </div>
            ) : resetRequests.length === 0 ? (
              <p className="text-center py-12 text-gray-600">No reset requests found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Requested At</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resetRequests.map((req) => {
                      const id = req._id || req.id
                      const status = req.status || "pending"
                      const user = req.user || {}
                      const createdAt = req.createdAt || req.requestedAt
                      const code = req.code || req.resetCode

                      return (
                        <tr key={id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{user.name || "Unknown"}</td>
                          <td className="py-3 px-4">{user.email || req.email || "Unknown"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : status === "code_generated"
                                  ? "bg-blue-100 text-blue-800"
                                  : status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {createdAt ? new Date(createdAt).toLocaleString() : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-2">
                              {status === "pending" && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem("authToken")
                                      const res = await fetch(
                                        `${BASE_URL}/api/admin/password-reset-requests/${id}/generate-code`,
                                        {
                                          method: "POST",
                                          headers: {
                                            Authorization: `Bearer ${token}`,
                                            "Content-Type": "application/json",
                                            Accept: "application/json",
                                          },
                                          mode: "cors",
                                          body: JSON.stringify({ expiresInMinutes: 60 }),
                                        }
                                      )
                                      const data = await res.json().catch(() => ({}))
                                      if (!res.ok) {
                                        throw new Error(data.message || "Failed to generate reset code")
                                      }

                                      const updatedReq = data.request || data
                                      const newCode = updatedReq.code || updatedReq.resetCode

                                      setResetRequests((prev) =>
                                        prev.map((r) => ( (r._id || r.id) === id ? { ...r, ...updatedReq } : r ))
                                      )
                                    } catch (err) {
                                      console.error("Error generating reset code:", err)
                                    }
                                  }}
                                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
                                >
                                  Generate Code
                                </button>
                              )}
                              {code && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard
                                      .writeText(code)
                                      .catch((err) => console.error("Failed to copy reset code:", err))
                                  }}
                                  className="px-3 py-1 rounded-lg bg-gray-200 text-gray-800 text-xs font-medium hover:bg-gray-300 transition"
                                >
                                  Copy Code
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            )}

            {view === "claims" && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
            <div className="mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Claims</h2>
              <p className="text-sm md:text-base text-gray-600">View and manage item claims</p>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading claims...</p>
              </div>
            ) : claims.length === 0 ? (
              <p className="text-center py-12 text-gray-600">No claims found</p>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => {
                  const item = typeof claim.item === "object" ? claim.item : (typeof claim.itemId === "object" ? claim.itemId : null)
                  return (
                    <div key={claim._id || claim.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-black mb-2">
                            {item?.title || "Item Claim"}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {item?.description || "N/A"}
                          </p>
                          {item?.category && (
                            <p className="text-sm text-gray-500 mb-2">
                              <strong>Category:</strong> {item.category}
                            </p>
                          )}
                          {item?.uniqueIdentifier && (
                            <p className="text-sm text-gray-500 mb-2">
                              <strong>Unique Identifier:</strong> {item.uniqueIdentifier}
                            </p>
                          )}
                          <div className="mb-3 p-3 rounded-lg border bg-purple-50 border-purple-200">
                            <p className="text-sm font-semibold text-purple-900 mb-1">Ownership Proof:</p>
                            <p className="text-sm text-purple-800 break-words">
                              {claim.ownershipProof || "N/A"}
                            </p>
                          </div>
                          {claim.status === "approved" && (() => {
                            const claimantEmail = claim.claimant?.email || claim.claimantEmail
                            const claimantPhone = claim.claimant?.phone
                            return (claimantEmail || claimantPhone) ? (
                              <div className="mb-3 p-3 rounded-lg border bg-green-50 border-green-300">
                                <p className="text-sm font-semibold text-green-900 mb-2">Contact Information:</p>
                                <div className="space-y-1">
                                  {claimantEmail && (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      <a href={`mailto:${claimantEmail}`} className="text-sm text-green-800 hover:text-green-900 hover:underline">
                                        {claimantEmail}
                                      </a>
                                    </div>
                                  )}
                                  {claimantPhone && (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      <a href={`tel:${claimantPhone}`} className="text-sm text-green-800 hover:text-green-900 hover:underline">
                                        {claimantPhone}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null
                          })()}
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span><strong>Status:</strong> </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              claim.status === "approved" ? "bg-green-100 text-green-800" :
                              claim.status === "rejected" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {claim.status || "pending"}
                            </span>
                            {claim.claimant && (
                              <span><strong>Claimant:</strong> {typeof claim.claimant === "object" ? claim.claimant.name : claim.claimantName || "N/A"}</span>
                            )}
                            {!claim.claimant && claim.claimantName && (
                              <span><strong>Claimant:</strong> {claim.claimantName}</span>
                            )}
                            {claim.claimant?.studentId && (
                              <span><strong>Student ID:</strong> {claim.claimant.studentId}</span>
                            )}
                            {claim.reviewedBy && (
                              <span><strong>Reviewed By:</strong> {typeof claim.reviewedBy === "object" ? claim.reviewedBy.name : "N/A"}</span>
                            )}
                            {claim.reviewedAt && (
                              <span><strong>Reviewed:</strong> {new Date(claim.reviewedAt).toLocaleDateString()}</span>
                            )}
                            {claim.createdAt && (
                              <span><strong>Submitted:</strong> {new Date(claim.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
            )}

            {view === "verificationCodes" && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Verification Codes</h2>
                <p className="text-sm md:text-base text-gray-600">Generate and manage verification codes for security officers</p>
              </div>
              <button
                onClick={generateVerificationCode}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#850303] to-[#700202] text-white text-sm font-semibold hover:from-[#700202] hover:to-[#5a0101] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Generate Code
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading verification codes...</p>
              </div>
            ) : verificationCodes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No verification codes found</p>
                <button
                  onClick={generateVerificationCode}
                  className="px-4 py-2 rounded-lg bg-[#850303] text-white text-sm font-medium hover:opacity-90 transition"
                >
                  Generate First Code
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Used By</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Expires At</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationCodes.map((code) => {
                      const isExpired = new Date(code.expiresAt) < new Date()
                      const isUsed = code.isUsed || false
                      return (
                        <tr key={code._id || code.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">
                                {code.code}
                              </code>
                              <button
                                onClick={() => copyCodeToClipboard(code.code)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                title="Copy code"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isUsed ? "bg-green-100 text-green-800" :
                              isExpired ? "bg-red-100 text-red-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {isUsed ? "Used" : isExpired ? "Expired" : "Active"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {code.usedBy ? (
                              typeof code.usedBy === "object" ? (
                                <span>{code.usedBy.name || code.usedBy.email || "N/A"}</span>
                              ) : (
                                <span>{code.usedBy}</span>
                              )
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={isExpired ? "text-red-600" : ""}>
                              {new Date(code.expiresAt).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteCodeClick(code)}
                              className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            )}
          </div>
        </main>
      </div>

        {/* Generated Code Modal */}
        {showCodeModal && generatedCode && (typeof generatedCode === "string" || (generatedCode && typeof generatedCode === "object" && generatedCode.code)) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-black">Verification Code Generated</h3>
                <button
                  onClick={() => {
                    setShowCodeModal(false)
                    setGeneratedCode(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                A new verification code has been generated. Share this code with the security officer who needs to register.
              </p>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-2xl font-mono font-bold text-[#850303] tracking-wider">
                    {typeof generatedCode === "string" ? generatedCode : (generatedCode?.code || "Invalid code")}
                  </code>
                  <button
                    onClick={() => {
                      const codeToCopy = typeof generatedCode === "string" ? generatedCode : (generatedCode?.code || "")
                      copyCodeToClipboard(codeToCopy)
                    }}
                    className="px-3 py-2 rounded-lg bg-[#850303] text-white text-sm font-medium hover:bg-[#700202] transition flex items-center gap-2"
                    title="Copy code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This code will expire in 7 days and can only be used once.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCodeModal(false)
                    setGeneratedCode(null)
                  }}
                  className="px-4 py-2 rounded-lg bg-[#850303] text-white font-medium hover:bg-[#700202] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-black mb-4">Confirm Delete User</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject User Modal */}
        {showRejectModal && userToReject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-black mb-2">Reject User</h3>
              <p className="text-sm text-gray-600 mb-4">
                You are about to reject{" "}
                <span className="font-semibold">
                  {userToReject.name} ({userToReject.email})
                </span>
                . Optionally provide a reason that will be stored with this account and shown in the admin panel.
              </p>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Rejection reason <span className="font-normal text-gray-500">(optional but recommended)</span>
              </label>
              <textarea
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition mb-4 resize-none"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Example: Details provided do not match our records."
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setUserToReject(null)
                    setRejectReason("")
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!userToReject) return
                    try {
                      const token = localStorage.getItem("authToken")
                      const userId = userToReject._id || userToReject.id
                      const reasonToSend = (rejectReason || "").trim() || "Rejected by admin via dashboard"

                      const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/reject`, {
                        method: "PATCH",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                          Accept: "application/json",
                        },
                        mode: "cors",
                        body: JSON.stringify({
                          reason: reasonToSend,
                        }),
                      })

                      const data = await res.json().catch(() => ({}))
                      if (!res.ok) {
                        throw new Error(data.message || "Failed to reject user")
                      }

                      setUsers((prev) =>
                        prev.map((userItem) =>
                          (userItem._id || userItem.id) === userId
                            ? { ...userItem, status: "rejected", rejectionReason: reasonToSend }
                            : userItem
                        )
                      )

                      setUserAlert({
                        type: "error",
                        title: `${userToReject.name || "User"} has been rejected`,
                        message: reasonToSend,
                      })

                      setShowRejectModal(false)
                      setUserToReject(null)
                      setRejectReason("")
                    } catch (err) {
                      console.error("Error rejecting user:", err)
                      setUserAlert({
                        type: "error",
                        title: "Failed to reject user",
                        message: err.message || "An unexpected error occurred while rejecting this user.",
                      })
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Code Confirmation Modal */}
        {showDeleteCodeModal && codeToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-black mb-4">Confirm Delete Verification Code</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete verification code <strong><code>{codeToDelete.code}</code></strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCodeCancel}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCodeConfirm}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  )
}


