import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, User, Search, Bell, Settings, ChevronDown, LogOut, Sun, Moon, Monitor, Link as LinkIcon, MessageSquare } from 'lucide-react'
import { isAuthenticated, removeAuthToken } from '../lib/apollo'
import { useTheme } from '../contexts/ThemeContext'

const Navigation: React.FC = () => {
  const location = useLocation()
  const authenticated = isAuthenticated()
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false)
  const settingsDropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    removeAuthToken()
    window.location.href = '/'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setIsSettingsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Don't show nav on auth pages for cleaner experience
  if (location.pathname.startsWith('/auth/')) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 nav-themed border-b border-theme">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-white group-hover:text-blue-400 transition-colors text-sm">
              RAGAR
            </span>
          </Link>


          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="search-icon absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search gaming data..."
                  className="search-input w-64 h-8 pl-8 pr-4 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs bg-card border border-theme rounded text-secondary">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Chat Icon */}
            {authenticated && (
              <Link
                to="/chat"
                className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
                title="Chat with RAGAR"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>
            )}

            {/* User Menu */}
            {authenticated ? (
              <div className="flex items-center space-x-2">
                <button className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
                
                {/* Settings Dropdown */}
                <div className="relative" ref={settingsDropdownRef}>
                  <button
                    onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                    className="flex items-center space-x-1 p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <ChevronDown className={`w-3 h-3 transition-transform ${isSettingsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isSettingsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg py-1 z-50"
                    >
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsSettingsDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        to="/games/collection"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsSettingsDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Collections</span>
                      </Link>
                      <Link
                        to="/games/connections"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsSettingsDropdownOpen(false)}
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>Connections</span>
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsSettingsDropdownOpen(false)}
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <span>Profile</span>
                      </Link>
                      <div className="border-t border-theme my-1"></div>
                      
                      {/* Theme Toggle Section */}
                      <div className="px-4 py-2">
                        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Theme</span>
                        <div className="flex mt-2 space-x-1">
                          <button
                            onClick={() => setTheme('light')}
                            className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                              theme === 'light' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                            title="Light Mode"
                          >
                            <Sun className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                              theme === 'dark' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                            title="Dark Mode"
                          >
                            <Moon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTheme('system')}
                            className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                              theme === 'system' 
                                ? 'bg-blue-600 text-white' 
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                            title="System"
                          >
                            <Monitor className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-theme my-1"></div>
                      <button
                        onClick={() => {
                          setIsSettingsDropdownOpen(false)
                          handleLogout()
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth/login"
                  className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-theme bg-black"
          >
            <div className="px-2 py-4 space-y-2">
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dash
              </Link>
              <Link
                to="/chat"
                className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Chat
              </Link>
              
              {authenticated && (
                <>
                  <div className="pt-3 border-t border-theme">
                    <Link
                      to="/settings"
                      className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <Link
                      to="/games/collection"
                      className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Collections
                    </Link>
                    <Link
                      to="/games/connections"
                      className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Connections
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
              
              <div className="pt-3 border-t border-theme">
                <div className="relative">
                  <Search className="search-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search gaming data..."
                    className="search-input w-full h-10 pl-10 pr-4 text-sm rounded-md"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navigation 