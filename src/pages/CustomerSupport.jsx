"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { 
  HelpCircle, 
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Book,
  FileText,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

const LOGO_SRC = "/foundcloud white.svg"

export default function CustomerSupport() {
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on 'Sign Up' in the top right corner, fill in your details, and verify your email. Regular users will need admin approval before they can log in."
        },
        {
          q: "What should I do if I lost an item?",
          a: "Go to the 'Report Lost Item' page, fill in the details including description, location, and any unique identifiers. Our system will match it with found items automatically."
        },
        {
          q: "How do I report a found item?",
          a: "Navigate to 'Report Found Item', provide details about the item, location found, and upload photos if available. This helps owners identify their belongings."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "Why is my account pending approval?",
          a: "Regular users need admin approval for security. Staff and admin accounts are auto-approved. You'll receive an email when your account is approved."
        },
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the sign-in page, enter your email, and follow the instructions sent to your inbox."
        },
        {
          q: "Is my personal information secure?",
          a: "Yes, we use enterprise-grade encryption and security measures. Your data is only shared when you make a claim or report an item."
        }
      ]
    },
    {
      category: "Claims & Matching",
      questions: [
        {
          q: "How does the matching system work?",
          a: "Our system uses unique identifiers, descriptions, and location data to match lost items with found items. You'll receive notifications when a potential match is found."
        },
        {
          q: "What happens after I claim an item?",
          a: "Security officers review your claim and ownership proof. If approved, you'll receive contact information to arrange pickup."
        },
        {
          q: "How long does claim approval take?",
          a: "Typically 24-48 hours. Security officers review claims during business hours to ensure proper verification."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "The website isn't loading properly",
          a: "Try clearing your browser cache, disabling extensions, or using a different browser. If issues persist, contact our technical support team."
        },
        {
          q: "I'm not receiving email notifications",
          a: "Check your spam folder and ensure notifications@foundcloud.com is whitelisted. Verify your email address in account settings."
        },
        {
          q: "How do I update my profile information?",
          a: "Log in to your account, go to 'Profile Settings', and update your information. Changes are saved automatically."
        }
      ]
    }
  ]

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      available: "Available 9 AM - 6 PM EST",
      action: "Start Chat",
      color: "bg-blue-100 text-blue-900"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      available: "24/7",
      action: "Send Email",
      color: "bg-green-100 text-green-900"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      available: "Mon-Fri 9 AM - 6 PM EST",
      action: "Call Now",
      color: "bg-purple-100 text-purple-900"
    }
  ]

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenFaq(openFaq === key ? null : key)
  }

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
                onClick={() => navigate("/")}
                className={`px-4 py-2 rounded-full border border-red-300/60 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 ${scrolled ? "text-red-900 hover:bg-red-50" : "text-red-100 hover:bg-white/10 hover:text-white"}`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back Sign up Page</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-900 rounded-full mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Customer <span className="text-red-900">Support</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Find answers to common questions or get help from our support team
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
            />
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Get Help</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-red-300"
                >
                  <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{option.title}</h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{option.available}</span>
                  </div>
                  <button className="w-full bg-red-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-800 transition-colors">
                    {option.action}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          {filteredFaqs.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No results found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-red-900 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{category.category}</h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, questionIndex) => {
                      const key = `${categoryIndex}-${questionIndex}`
                      const isOpen = openFaq === key
                      return (
                        <div
                          key={questionIndex}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <button
                            onClick={() => toggleFaq(categoryIndex, questionIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                              <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Help Resources */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Help Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/about"
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <Book className="w-10 h-10 text-red-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">User Guide</h3>
              <p className="text-gray-600">
                Learn how to use FoundCloud effectively with our comprehensive guide
              </p>
            </Link>
            <Link
              to="/contact"
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <FileText className="w-10 h-10 text-blue-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Contact Us</h3>
              <p className="text-gray-600">
                Still need help? Reach out to our support team directly
              </p>
            </Link>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <CheckCircle className="w-10 h-10 text-green-900 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">Status Page</h3>
              <p className="text-gray-600 mb-4">
                Check system status and scheduled maintenance
              </p>
              <span className="inline-flex items-center gap-2 text-green-900 font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-red-950 via-red-900 to-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Still Need Help?</h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Our support team is ready to assist you. Get in touch and we'll help resolve your issue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-red-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Contact Support
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-red-900 transition-all duration-200"
            >
              Learn More
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
