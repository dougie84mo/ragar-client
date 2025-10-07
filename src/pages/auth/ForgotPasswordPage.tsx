import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Mail, ArrowLeft, Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { FORGOT_PASSWORD_MUTATION } from '../../lib/apollo'
import { usePageTitle } from '../../hooks/usePageTitle'

const ForgotPasswordPage: React.FC = () => {
  usePageTitle('Reset Password')
  
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const [forgotPassword, { loading, error }] = useMutation(FORGOT_PASSWORD_MUTATION, {
    onCompleted: (data) => {
      console.log('🧠 RAGAR: Password reset email sent!', data)
      setEmailSent(true)
    },
    onError: (error) => {
      console.error('🧠 RAGAR: Forgot password failed:', error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await forgotPassword({
        variables: { email }
      })
    } catch (err) {
      console.error('Forgot password error:', err)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-neon-cyan rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-dark-bg" />
          </motion.div>
          
          <h1 className="font-gaming text-3xl font-bold mb-4 text-glow">
            Check Your Email
          </h1>
          <p className="text-gray-300 font-cyber mb-6">
            We've sent a password reset link to <span className="text-neon-cyan">{email}</span>. 
            Click the link in your email to reset your password.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/auth/login"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
            
            <button
              onClick={() => setEmailSent(false)}
              className="btn-secondary block w-full"
            >
              Send Another Email
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-neon-cyan rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/auth/login" className="inline-flex items-center text-neon-cyan hover:text-neon-pink transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-cyber text-sm">Back to Login</span>
          </Link>
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-16 h-16 bg-gaming-gradient rounded-xl flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="font-gaming text-3xl font-bold mb-2 text-glow">
            Reset Password
          </h1>
          <p className="text-gray-400 font-cyber">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-strong rounded-2xl p-8"
        >
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-ragar-danger/20 border border-ragar-danger/50 rounded-lg p-4 mb-6 flex items-center"
            >
              <AlertTriangle className="w-5 h-5 text-ragar-danger mr-3" />
              <div>
                <p className="text-ragar-danger font-cyber text-sm font-semibold">Error</p>
                <p className="text-gray-300 font-cyber text-xs">
                  {error.message || 'Unable to send reset email. Please try again.'}
                </p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-300 font-cyber text-sm mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-gaming w-full pl-12"
                  placeholder="enter@neural.network"
                  required
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-neon-cyan mt-0.5" />
                <div>
                  <p className="text-neon-cyan font-cyber text-sm font-semibold mb-1">
                    Security Notice
                  </p>
                  <p className="text-gray-300 font-cyber text-xs">
                    For your protection, the reset link will expire in 1 hour. 
                    If you don't receive an email, check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Send Reset Button */}
            <motion.button
              type="submit"
              disabled={loading || !email}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="loading-spinner w-5 h-5" />
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Alternative Actions */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <p className="text-gray-400 font-cyber text-sm mb-4">
                Remember your password?
              </p>
              <Link
                to="/auth/login"
                className="text-neon-cyan hover:text-neon-pink font-cyber font-semibold transition-colors"
              >
                Back to Login
              </Link>
            </div>
            
            <div className="border-t border-border-gray pt-4 text-center">
              <p className="text-gray-400 font-cyber text-sm mb-2">
                Don't have an account?
              </p>
              <Link
                to="/auth/register"
                className="text-neon-cyan hover:text-neon-pink font-cyber font-semibold transition-colors"
              >
                Join RAGAR Network
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage 