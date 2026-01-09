"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import AuthGuard from "./components/AuthGuard"
import HomePage from "./pages/HomePage"
import Signup from "./pages/Signup.jsx"
import FoundItems from "./pages/Founditems";
import LostItems from "./pages/Lostitems.jsx";
import Admin from "./pages/Admin.jsx";
import SecurityOfficer from "./pages/SecurityOfficer.jsx";
import PendingApprovalPage from "./pages/PendingApproval.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Contact from "./pages/Contact.jsx";
import CustomerSupport from "./pages/CustomerSupport.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/signin" element={<Signup />} />

          {/* Public Found Items page (both cases) */}
          <Route path="/Founditems" element={<FoundItems />} />
          <Route path="/founditems" element={<FoundItems />} />

          {/* Public Lost Items page (both cases) */}
          <Route path="/Lostitems" element={<LostItems />} />
          <Route path="/lostitems" element={<LostItems />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard allowedRoles={["user", "security", "admin"]}>
                <HomePage />
              </AuthGuard>
            }
          />

          <Route
            path="/dashboard/report"
            element={
              <AuthGuard allowedRoles={["user", "security", "admin"]}>
              <FoundItems/>
              </AuthGuard>
            }
          />

          <Route
            path="/search"
            element={
              <AuthGuard allowedRoles={["user", "security", "admin"]}>
                {/* Add SearchPage component when available */}
              </AuthGuard>
            }
          />

          <Route
            path="/security"
            element={
              <AuthGuard allowedRoles={["security", "admin"]}>
                <SecurityOfficer />
              </AuthGuard>
            }
          />

          {/* Legacy staff routes removed in favor of security officer */}

          <Route
            path="/admin"
            element={
              <AuthGuard allowedRoles={["admin"]}>
                <Admin />
              </AuthGuard>
            }
          />

          <Route path="/Admin" element={<Admin />} />

          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

          {/* Admin portal (client-side guarded) */}
          <Route path="/admin-portal" element={<Admin />} />

          {/* Pending approval info page */}
          <Route path="/pending-approval" element={<PendingApprovalPage />} />

          {/* Public Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<CustomerSupport />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App