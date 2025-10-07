import React from 'react'
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import apolloClient, { isAuthenticated } from './lib/apollo'

// Import components
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import GameAuthPage from './pages/auth/GameAuthPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import GamesPage from './pages/GamesPage'
import GamesConnectionPage from './pages/GamesConnectionPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/auth/login" replace />
}

// Public Route component (redirect to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <div className="min-h-screen bg-white">
          {/* Navigation - Shows on all pages except auth */}
          <Navigation />
          
          {/* Main Content */}
          <main className="relative">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              } />
              
              <Route path="/auth/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              
              <Route path="/auth/register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
              
              <Route path="/auth/forgot-password" element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } />

              {/* Gaming Authentication Routes - Protected */}
              <Route path="/auth/gaming/:gameId" element={
                <ProtectedRoute>
                  <GameAuthPage />
                </ProtectedRoute>
              } />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />

              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />

              <Route path="/games" element={
                <ProtectedRoute>
                  <GamesPage />
                </ProtectedRoute>
              } />

              <Route path="/games/collection" element={
                <ProtectedRoute>
                  <GamesPage />
                </ProtectedRoute>
              } />
              
              {/* Redirect old preferences routes for backward compatibility */}
              <Route path="/games/preferences" element={<Navigate to="/games/collection" replace />} />
              <Route path="/games/preferrence" element={<Navigate to="/games/collection" replace />} />

              <Route path="/games/connections" element={
                <ProtectedRoute>
                  <GamesConnectionPage />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ApolloProvider>
  )
}

export default App
