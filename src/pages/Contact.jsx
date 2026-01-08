"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft
} from "lucide-react"

const LOGO_SRC = "/foundcloud white.svg"

export default function Contact() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])


  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "support@foundcloud.com",
      link: "mailto:support@foundcloud.com"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+1 (555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: MapPin,
      title: "Address",
      content: "WSU Campus, Building 123, Room 456",
      link: null
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-red-950/30 shadow-lg backdrop-blur-xl border-b border-red-800/60"
            : "bg-gradient-to-r from-red-950/90 via-red-900/90 to-red-950/90 shadow-md backdrop-blur-md border-b border-red-800/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 sm:h-20">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 transition-all duration-300 group-hover:scale-110 group-hover:rotate-1">
                <img
                  src={LOGO_SRC}
                  alt="FoundCloud logo"
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg sm:text-xl font-bold tracking-tight group-hover:text-red-50 transition-colors duration-300 ${scrolled ? "text-red-900" : "text-white"}`}>
                  FoundCloud
                </span>
                <span className={`text-[10px] sm:text-xs font-medium opacity-80 hidden sm:block ${scrolled ? "text-red-700" : "text-red-200"}`}>
                  Reunite • Recover • Restore
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className={`px-4 py-2 rounded-full border border-red-300/60 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 ${scrolled ? "text-red-900 hover:bg-red-50" : "text-red-100 hover:bg-white/10 hover:text-white"}`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Get in <span className="text-red-900">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Have a question, suggestion, or need help? We're here to assist you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Contact Information</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Reach out to us through any of these channels. We typically respond within 24 hours.
              </p>

              <div className="space-y-6 mb-8">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  const content = info.link ? (
                    <a
                      href={info.link}
                      className="text-red-900 hover:text-red-700 hover:underline transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <span className="text-gray-700">{info.content}</span>
                  )

                  return (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-3 bg-red-100 rounded-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-red-900" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                        <div className="text-gray-600">{content}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Office Hours */}
              <div className="bg-red-50 rounded-lg p-6 border border-red-100">
                <h3 className="font-semibold text-gray-900 mb-3">Office Hours</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Need Immediate Help?</h3>
                <p className="text-gray-600 mb-4">
                  For urgent matters related to lost items, please visit our{" "}
                  <Link to="/support" className="text-red-900 hover:underline font-medium">
                    Customer Support
                  </Link>{" "}
                  page for faster assistance.
                </p>
                <Link
                  to="/support"
                  className="inline-flex items-center text-red-900 hover:text-red-700 font-medium transition-colors"
                >
                  Go to Support Center
                  <span className="ml-2">→</span>
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-red-950 via-black to-black text-white pt-12 pb-8 px-4 border-t border-red-900/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-10 md:grid-cols-[1.5fr,1fr,1fr,1fr]">
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="h-9 w-9">
                  <img src={LOGO_SRC} alt="FoundCloud logo" className="h-full w-full object-contain" loading="lazy" />
                </div>
                <span className="text-xl font-bold tracking-tight">FoundCloud</span>
              </div>
              <p className="text-sm text-red-200/80 max-w-sm">
                Connecting communities to reunite people with their lost belongings through a fast, secure, and modern platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white text-sm uppercase tracking-widest">Product</h3>
              <ul className="space-y-2 text-red-200/80 text-sm">
                <li>
                  <Link to="/founditems" className="hover:text-white transition-colors duration-200">
                    Found Items
                  </Link>
                </li>
                <li>
                  <Link to="/lostitems" className="hover:text-white transition-colors duration-200">
                    Lost Items
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors duration-200">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white text-sm uppercase tracking-widest">Support</h3>
              <ul className="space-y-2 text-red-200/80 text-sm">
                <li>
                  <Link to="/support" className="hover:text-white transition-colors duration-200">
                    Customer Support
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors duration-200">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors duration-200">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white text-sm uppercase tracking-widest">Legal</h3>
              <ul className="space-y-2 text-red-200/80 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors duration-200">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-red-900/70 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-red-300/80">
            <p>&copy; 2025 FoundCloud. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
              Built for fast, secure lost &amp; found management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
