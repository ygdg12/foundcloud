"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { 
  Users, 
  Target, 
  Heart, 
  Shield, 
  Award, 
  Zap,
  ArrowLeft,
  CheckCircle
} from "lucide-react"

const LOGO_SRC = "/foundcloud white.svg"

export default function AboutUs() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const values = [
    {
      icon: Heart,
      title: "Community First",
      description: "We believe in the power of community. Every lost item found is a connection made, a relationship strengthened."
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Your personal information is protected with enterprise-grade security. We take your privacy seriously."
    },
    {
      icon: Zap,
      title: "Speed & Efficiency",
      description: "Quick reporting, instant notifications, and rapid matching help reunite items with their owners faster."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in every interaction, ensuring the best possible experience for our users."
    }
  ]

  const stats = [
    { number: "15,000+", label: "Items Recovered" },
    { number: "50,000+", label: "Active Users" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support Available" }
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
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            About <span className="text-red-900">FoundCloud</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We're on a mission to reunite people with their lost belongings through technology, 
            community, and compassion.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-red-100 text-red-900 px-4 py-2 rounded-full mb-6">
                <Target className="w-5 h-5 mr-2" />
                <span className="font-semibold">Our Mission</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                Connecting Communities, Reuniting Belongings
              </h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                FoundCloud was born from a simple observation: losing something valuable is stressful, 
                and finding it should be simple. We've built a platform that leverages the power of 
                community and technology to make lost and found management effortless.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're a student who lost their laptop, a parent searching for a child's 
                favorite toy, or a security officer managing found items, FoundCloud provides the 
                tools and network to make recovery fast and reliable.
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-900 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Community-Driven</h3>
                    <p className="text-gray-600">
                      Thousands of active users helping each other recover lost items every day.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-900 rounded-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Lightning Fast</h3>
                    <p className="text-gray-600">
                      Instant notifications and smart matching algorithms connect items with owners quickly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-900 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Secure & Private</h3>
                    <p className="text-gray-600">
                      Enterprise-grade security protects your personal information and data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-red-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="hover:transform hover:scale-105 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <p className="text-red-200 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg flex-shrink-0">
                      <Icon className="w-8 h-8 text-red-900" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Our Story</h2>
            <p className="text-xl text-gray-600">
              How FoundCloud came to be
            </p>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              FoundCloud started as a campus project at WSU, where students frequently lost items 
              but had no centralized system to report or find them. We saw the frustration firsthand 
              and decided to build a solution.
            </p>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              What began as a simple lost-and-found board evolved into a comprehensive platform 
              that serves thousands of users. Today, FoundCloud combines cutting-edge technology 
              with community spirit to make item recovery faster, easier, and more reliable.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We're proud to be part of a community that looks out for each other, and we're 
              committed to making FoundCloud the best platform for lost and found management.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-red-950 via-red-900 to-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Join the FoundCloud Community</h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Be part of a community that helps reunite people with their belongings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signin"
              className="bg-white text-red-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-red-900 transition-all duration-200"
            >
              Contact Us
            </Link>
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
