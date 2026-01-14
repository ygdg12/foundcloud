"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LayoutDashboard, Package, AlertCircle, FileCheck, LogOut, Home, Menu, X } from "lucide-react"

const LOGO_SRC = "/foundcloud white.svg"

const BASE_URL =
  import.meta.env?.VITE_BASE_URL ||
  process.env.REACT_APP_BASE_URL ||
  "https://lost-items-backend-q30o.onrender.com"
const FOUND_ITEMS_URL = `${BASE_URL}/api/found-items`
const LOST_ITEMS_URL = `${BASE_URL}/api/lost-items`

const DEFAULT_BACKEND_ORIGIN = "https://lost-items-backend-q30o.onrender.com"

const getBackendOrigin = () => {
  try {
    if (typeof BASE_URL === "string" && /^https?:\/\//i.test(BASE_URL)) {
      return BASE_URL
    }
  } catch {
    // ignore
  }
  return DEFAULT_BACKEND_ORIGIN
}

const normalizeImageRef = (raw) => {
  if (raw == null) return ""
  const s = String(raw).trim()
  if (!s) return ""
  if (/^https\/\//i.test(s)) return s.replace(/^https\/\//i, "https://")
  if (/^http\/\//i.test(s)) return s.replace(/^http\/\//i, "http://")
  return s
}

const buildImageUrl = (imgRef) => {
  const origin = getBackendOrigin()
  const imgPath = normalizeImageRef(imgRef)
  if (!imgPath) return ""

  if (/^https?:\/\//i.test(imgPath)) return imgPath
  if (imgPath.startsWith("/")) return `${origin}${imgPath}`

  return `${origin}/${imgPath}`
}

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
      <rect fill='%23eee' width='800' height='600'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='32'>No Image</text>
    </svg>`
  )

export default function SecurityOfficer() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState("")
  const [foundItems, setFoundItems] = useState([])
  const [foundLoading, setFoundLoading] = useState(false)
  const [lostItems, setLostItems] = useState([])
  const [lostLoading, setLostLoading] = useState(false)
  const [actionStatus, setActionStatus] = useState({}) // { [claimId]: 'approved' | 'rejected' }
  const [view, setView] = useState("dashboard") // dashboard, claims, foundItems, lostItems
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const fetchClaims = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("authToken")
      const url = `${BASE_URL}/api/claims`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to load claims")
      setClaims(data.claims || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchFoundItems = async () => {
    setFoundLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(FOUND_ITEMS_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to load found items")
      setFoundItems(data.items || data.foundItems || [])
    } catch (err) {
      console.error("Error loading found items:", err)
    } finally {
      setFoundLoading(false)
    }
  }

  const fetchLostItems = async () => {
    setLostLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(LOST_ITEMS_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to load lost items")
      setLostItems(data.items || data.lostItems || [])
    } catch (err) {
      console.error("Error loading lost items:", err)
    } finally {
      setLostLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is security officer or admin
    // Wait a bit for AuthContext to load fresh user data from API
    const checkUser = () => {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) {
          navigate("/signin", { replace: true })
          return
        }

        // Wait a bit for AuthContext to fetch from API, then check
        setTimeout(() => {
          const u = JSON.parse(localStorage.getItem("user") || "null")
          
          // Normalize role
          const userRole = u?.role === "staff" ? "security" : u?.role
          
          if (!u || (userRole !== "security" && userRole !== "admin")) {
            console.log("SecurityOfficer page: User is not security/admin, redirecting. Role:", userRole)
            navigate("/signin", { replace: true })
            return
          }


          // User is valid security/admin, proceed to fetch data
          fetchClaims()
          fetchFoundItems()
          fetchLostItems()
        }, 100) // Small delay to allow AuthContext to fetch from API
      } catch {
        navigate("/signin", { replace: true })
        return
      }
    }
    
    checkUser()
  }, [navigate])

  const stats = useMemo(() => {
    const total = claims.length
    const approved = claims.filter((c) => c.status === "approved").length
    const rejected = claims.filter((c) => c.status === "rejected").length
    const pending = total - approved - rejected
    return { total, approved, rejected, pending }
  }, [claims])

  const updateClaimStatus = async (claimId, status) => {
    setUpdatingId(claimId)
    setError("")
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found. Please sign in again.")
      }

      const url = `${BASE_URL}/api/claims/${claimId}`
      console.log("Updating claim:", { claimId, status, url })

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json().catch(() => ({ message: "Failed to parse response" }))

      console.log("Response:", { status: response.status, data })

      if (!response.ok) {
        throw new Error(data.message || `Failed to update claim: ${response.status} ${response.statusText}`)
      }

      // Update the claim in state
      setClaims((prev) =>
        prev.map((c) => {
          const id = c._id || c.id
          if (id === claimId) {
            return { ...c, status, ...(data.claim || {}) }
          }
          return c
        })
      )

      // Clear any previous errors on success and reflect action inline
      setError("")
      setActionStatus((prev) => ({ ...prev, [claimId]: status }))
      // Refresh found items if claim was approved to hide contact info
      if (status === "approved") {
        fetchFoundItems()
      }
      // Auto-clear the inline status after a short delay
      setTimeout(() => {
        setActionStatus((prev) => ({ ...prev, [claimId]: undefined }))
      }, 2500)
    } catch (e) {
      console.error("Error updating claim:", e)
      setError(e.message || "Failed to update claim. Please try again.")
    } finally {
      setUpdatingId(null)
    }
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
                <h1 className="text-lg md:text-xl font-bold">Security Officer Portal</h1>
                <p className="text-xs md:text-sm text-red-200">Review claims and items on campus</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => navigate("/security")}
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-red-50 w-full md:w-auto">
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {view === "dashboard" && (
              <>
                <div className="mb-4 md:mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">Dashboard Overview</h2>
                  <p className="text-sm md:text-base text-gray-600">
                    Quick overview of claims and items that need your attention.
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
                  <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Claims</p>
                        <p className="text-3xl font-bold text-[#850303]">{stats.total}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                        <p className="text-3xl font-bold text-[#850303]">{stats.pending}</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                        <p className="text-3xl font-bold text-[#850303]">{stats.approved}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                        <p className="text-3xl font-bold text-[#850303]">{stats.rejected}</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-lg">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {view === "claims" && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Claims list */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-black">Claims</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchClaims}
                        className="px-4 py-2 rounded-lg bg-[#850303] text-white text-sm font-medium hover:opacity-90 transition"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading claims...</p>
                    </div>
                  ) : claims.length === 0 ? (
                    <p className="text-center py-12 text-gray-600">No claims to review</p>
                  ) : (
                    <div className="space-y-4">
                      {claims.map((claim) => {
                        const claimId = claim._id || claim.id
                        const item =
                          typeof claim.item === "object"
                            ? claim.item
                            : typeof claim.itemId === "object"
                            ? claim.itemId
                            : null
                        const claimUniqueId = item?.uniqueIdentifier
                        // Check if this identifier matches any found item
                        const hasMatchingItem =
                          claimUniqueId &&
                          foundItems.some(
                            (fi) =>
                              fi.uniqueIdentifier &&
                              fi.uniqueIdentifier.toLowerCase() === claimUniqueId.toLowerCase()
                          )
                        return (
                          <div
                            key={claimId}
                            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                              hasMatchingItem ? "border-green-400 bg-green-50/30" : "border-gray-200"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold text-black mb-2 break-words">
                                  {item?.title || "Item Claim"}
                                </h3>
                                <div
                                  className={`mb-3 p-3 rounded-lg border ${
                                    hasMatchingItem
                                      ? "bg-green-100 border-green-300"
                                      : "bg-blue-50 border-blue-200"
                                  }`}
                                >
                                  {/* Unique Identifier intentionally hidden in claims view */}
                                </div>
                                <p className="text-gray-600 mb-2">{item?.description || "N/A"}</p>
                                <div className="mb-3 p-3 rounded-lg border bg-purple-50 border-purple-200">
                                  <p className="text-sm font-semibold text-purple-900 mb-1">
                                    Ownership Proof:
                                  </p>
                                  <p className="text-sm text-purple-800 break-words">
                                    {claim.ownershipProof || "N/A"}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                                  <span>
                                    <strong>Status:</strong>{" "}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      claim.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : claim.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {claim.status || "pending"}
                                  </span>
                                  {claim.claimant && (
                                    <span>
                                      <strong>Claimant:</strong>{" "}
                                      {typeof claim.claimant === "object"
                                        ? claim.claimant.name
                                        : claim.claimantName || "N/A"}
                                    </span>
                                  )}
                                  {claim.claimantEmail && (
                                    <span>
                                      <strong>Email:</strong> {claim.claimantEmail}
                                    </span>
                                  )}
                                  {claim.createdAt && (
                                    <span>
                                      <strong>Submitted:</strong>{" "}
                                      {new Date(claim.createdAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                {claim.status === "pending" ? (
                                  <>
                                    <button
                                      disabled={updatingId === claimId}
                                      onClick={() => updateClaimStatus(claimId, "approved")}
                                      className="px-2 sm:px-3 py-1.5 rounded-md bg-green-600 text-white text-xs sm:text-sm disabled:opacity-60 whitespace-nowrap"
                                    >
                                      {updatingId === claimId ? "Updating..." : "Approve"}
                                    </button>
                                    <button
                                      disabled={updatingId === claimId}
                                      onClick={() => updateClaimStatus(claimId, "rejected")}
                                      className="px-2 sm:px-3 py-1.5 rounded-md bg-red-600 text-white text-xs sm:text-sm disabled:opacity-60 whitespace-nowrap"
                                    >
                                      {updatingId === claimId ? "Updating..." : "Reject"}
                                    </button>
                                    {actionStatus[claimId] && (
                                      <span
                                        className={`text-sm font-medium ${
                                          actionStatus[claimId] === "approved"
                                            ? "text-green-700"
                                            : "text-red-700"
                                        }`}
                                      >
                                        {actionStatus[claimId] === "approved"
                                          ? "Approved"
                                          : "Rejected"}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span
                                    className={`text-sm font-semibold ${
                                      claim.status === "approved" ? "text-green-700" : "text-red-700"
                                    }`}
                                  >
                                    {claim.status === "approved" ? "Approved" : "Rejected"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Found items context panel */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-black">Found Items</h2>
                    <button
                      onClick={fetchFoundItems}
                      className="px-4 py-2 rounded-lg bg-[#850303] text-white text-sm font-medium hover:opacity-90 transition"
                    >
                      Refresh
                    </button>
                  </div>

                  {foundLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading found items...</p>
                    </div>
                  ) : foundItems.length === 0 ? (
                    <p className="text-center py-12 text-gray-600">No found items available</p>
                  ) : (
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                      {foundItems.map((item) => {
                        const itemId = item._id || item.id
                        const itemUniqueId = item.uniqueIdentifier

                        const images = Array.isArray(item.images)
                          ? item.images
                          : item.images
                          ? [item.images]
                          : []
                        const mainImage = images[0]
                        const imgSrc = buildImageUrl(mainImage) || PLACEHOLDER_IMG

                        return (
                          <div
                            key={itemId}
                            className="flex gap-3 border border-gray-200 rounded-xl p-3 bg-gray-50"
                          >
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              <img
                                src={imgSrc}
                                alt={item.title || "Found item image"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src = PLACEHOLDER_IMG
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-black line-clamp-2">
                                {item.title || "Untitled item"}
                              </h3>
                              {itemUniqueId && (
                                <p className="mt-0.5 text-[11px] font-mono text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded">
                                  ID: {itemUniqueId}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-700 line-clamp-2">
                                {item.description || "No description provided."}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-gray-600">
                                {item.category && (
                                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                                    {item.category}
                                  </span>
                                )}
                                {(item.locationFound || item.location) && (
                                  <span className="px-2 py-0.5 rounded bg-white border border-gray-200">
                                    {item.locationFound || item.location}
                                  </span>
                                )}
                                {item.dateFound && (
                                  <span>
                                    {new Date(item.dateFound).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "foundItems" && (
              <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">Found Items</h2>
                  <button
                    onClick={fetchFoundItems}
                    className="px-4 py-2 rounded-lg bg-[#850303] text-white text-sm font-medium hover:opacity-90 transition"
                  >
                    Refresh
                  </button>
                </div>

                {foundLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading found items...</p>
                  </div>
                ) : foundItems.length === 0 ? (
                  <p className="text-center py-12 text-gray-600">No found items available</p>
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {foundItems.map((item) => {
                      const itemId = item._id || item.id
                      const itemUniqueId = item.uniqueIdentifier
                      const hasApprovedClaim = claims.some((c) => {
                        if (c.status !== "approved") return false
                        const claimItem = typeof c.item === "object" ? c.item : null
                        if (!claimItem) return false
                        const claimItemId =
                          claimItem._id || claimItem.id || (typeof c.item === "string" ? c.item : null)
                        return claimItemId && claimItemId.toString() === itemId.toString()
                      })

                      const images = Array.isArray(item.images) ? item.images : item.images ? [item.images] : []
                      const mainImage = images[0]
                      const imgSrc = buildImageUrl(mainImage) || PLACEHOLDER_IMG

                      return (
                        <div
                          key={itemId}
                          className="border rounded-2xl overflow-hidden bg-gray-50 hover:shadow-lg transition-shadow"
                        >
                          <div className="h-40 w-full bg-gray-200 overflow-hidden">
                            <img
                              src={imgSrc}
                              alt={item.title || "Found item image"}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMG
                              }}
                            />
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-lg font-semibold text-black line-clamp-2">
                                  {item.title || "Untitled item"}
                                </h3>
                                {itemUniqueId && (
                                  <p className="mt-1 text-xs font-mono text-blue-700 bg-blue-50 inline-block px-2 py-1 rounded">
                                    ID: {itemUniqueId}
                                  </p>
                                )}
                              </div>
                              {item.status && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                                  {item.status}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-700 line-clamp-3">
                              {item.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                              <div className="flex flex-wrap gap-2">
                                {item.category && (
                                  <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 font-medium">
                                    {item.category}
                                  </span>
                                )}
                                {(item.locationFound || item.location) && (
                                  <span className="px-2 py-1 rounded bg-gray-200 text-gray-800">
                                    {item.locationFound || item.location}
                                  </span>
                                )}
                              </div>
                              {item.dateFound && (
                                <span>
                                  <strong>Found:</strong>{" "}
                                  {new Date(item.dateFound).toLocaleString()}
                                </span>
                              )}
                              {!hasApprovedClaim && (item.contactEmail || item.contactPhone) && (
                                <div className="flex flex-col gap-1">
                                  {item.contactEmail && (
                                    <span>
                                      <strong>Email:</strong> {item.contactEmail}
                                    </span>
                                  )}
                                  {item.contactPhone && (
                                    <span>
                                      <strong>Phone:</strong> {item.contactPhone}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {view === "lostItems" && (
              <div className="bg-white rounded-2xl shadow-lg border border-[#850303]/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">Lost Items</h2>
                  <button
                    onClick={fetchLostItems}
                    className="px-4 py-2 rounded-lg bg-[#850303] text-white text-sm font-medium hover:opacity-90 transition"
                  >
                    Refresh
                  </button>
                </div>

                {lostLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#850303] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading lost items...</p>
                  </div>
                ) : lostItems.length === 0 ? (
                  <p className="text-center py-12 text-gray-600">No lost items reported</p>
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {lostItems.map((item) => {
                      const itemId = item._id || item.id
                      const itemUniqueId = item.uniqueIdentifier

                      const images = Array.isArray(item.images) ? item.images : item.images ? [item.images] : []
                      const mainImage = images[0]
                      const imgSrc = buildImageUrl(mainImage) || PLACEHOLDER_IMG

                      return (
                        <div
                          key={itemId}
                          className="border rounded-2xl overflow-hidden bg-gray-50 hover:shadow-lg transition-shadow"
                        >
                          <div className="h-40 w-full bg-gray-200 overflow-hidden">
                            <img
                              src={imgSrc}
                              alt={item.title || "Lost item image"}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_IMG
                              }}
                            />
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-lg font-semibold text-black line-clamp-2">
                                  {item.title || "Untitled item"}
                                </h3>
                                {itemUniqueId && (
                                  <p className="mt-1 text-xs font-mono text-red-700 bg-red-50 inline-block px-2 py-1 rounded">
                                    ID: {itemUniqueId}
                                  </p>
                                )}
                              </div>
                              {item.status && (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                                  {item.status}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-700 line-clamp-3">
                              {item.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                              <div className="flex flex-wrap gap-2">
                                {item.category && (
                                  <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 font-medium">
                                    {item.category}
                                  </span>
                                )}
                                {item.location && (
                                  <span className="px-2 py-1 rounded bg-gray-200 text-gray-800">
                                    {item.location}
                                  </span>
                                )}
                              </div>
                              {item.dateLost && (
                                <span>
                                  <strong>Lost:</strong>{" "}
                                  {new Date(item.dateLost).toLocaleString()}
                                </span>
                              )}
                              {(item.contactEmail || item.contactPhone) && (
                                <div className="flex flex-col gap-1">
                                  {item.contactEmail && (
                                    <span>
                                      <strong>Email:</strong> {item.contactEmail}
                                    </span>
                                  )}
                                  {item.contactPhone && (
                                    <span>
                                      <strong>Phone:</strong> {item.contactPhone}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

