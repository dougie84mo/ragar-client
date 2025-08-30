import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, User, Search, Bell, Settings, ChevronDown, LogOut, Sun, Moon, Monitor } from 'lucide-react'
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Dash
            </Link>
            <Link
              to="/chat"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Chat
            </Link>
            <Link
              to="/games/preferences"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Games
            </Link>
            <Link
              to="/games/connections"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Connections
            </Link>
            <Link
              to="/admin/training"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Admin
            </Link>
          </div>

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

            {/* Theme Toggle */}
            <button className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V5M12 19V21M5 12H3M21 12H19M5.64 5.64L7.05 7.05M16.95 16.95L18.36 18.36M5.64 18.36L7.05 16.95M16.95 7.05L18.36 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>

            {/* GitHub */}
            <Link
              to="https://github.com/ragar-ai"
              className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </Link>

            {/* User Menu */}
            {authenticated ? (
              <div className="flex items-center space-x-2">
                <button className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:block">Guardian</span>
                </div>
                
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
                        to="/preferences"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsSettingsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Preferences</span>
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsSettingsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/admin/training"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsSettingsDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>🎮 Training Admin</span>
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
              <Link
                to="/games/preferences"
                className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Games
              </Link>
              <Link
                to="/games/connections"
                className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Connections
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
                      to="/preferences"
                      className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Preferences
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