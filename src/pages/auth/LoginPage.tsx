import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Zap, Brain } from 'lucide-react'
import { LOGIN_MUTATION } from '../../lib/apollo'
import { setAuthToken } from '../../lib/apollo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const [loginUser, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      console.log('🎉 RAGAR Login: Mutation completed successfully:', data)
      if (data.login.token) {
        console.log('🎉 RAGAR Login: Token received, storing and navigating to dashboard')
        setAuthToken(data.login.token)
        navigate('/dashboard')
      } else {
        console.error('🎉 RAGAR Login: No token in response')
        setError('Login failed')
      }
    },
    onError: (err) => {
      console.error('🎉 RAGAR Login: Mutation failed:', err)
      setError(err.message)
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    await loginUser({
      variables: {
        input: {
          email: formData.email,
          password: formData.password
        }
      }
    })
  }

  const socialLogins = [
    { name: 'Google', icon: '🌟', color: '#4285F4' },
    { name: 'Apple', icon: '🍎', color: '#000000' },
    { name: 'Facebook', icon: '📘', color: '#1877F2' },
    { name: 'Steam', icon: '🎮', color: '#171A21' },
    { name: 'Discord', icon: '💬', color: '#5865F2' }
  ]

  return (
    <div className="auth-container">
      {/* Background Effects */}
      <div className="fixed inset-0 neural-bg opacity-30 pointer-events-none" />
      
      {/* Floating Orbs */}
      <motion.div
        className="fixed top-20 left-20 w-32 h-32 bg-neon-cyan rounded-full blur-2xl opacity-20"
        animate={{
          x: [0, 80, 0],
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="fixed bottom-20 right-20 w-40 h-40 bg-gaming-purple rounded-full blur-3xl opacity-20"
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-strong border-border-gray shadow-gaming-lg">
          <CardHeader className="text-center pb-6">
            <motion.div
              className="flex items-center justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* RAGAR Logo */}
              <div className="w-16 h-16 bg-gaming-gradient rounded-xl flex items-center justify-center relative overflow-hidden mr-4">
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'radial-gradient(circle at 30% 30%, rgba(0,255,255,0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 70% 70%, rgba(255,0,255,0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 30% 30%, rgba(0,255,255,0.4) 0%, transparent 50%)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="relative z-10 flex items-center justify-center">
                  <span className="font-gaming text-2xl font-black text-white">R</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-cyan rounded-full opacity-80 animate-pulse" />
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-neon-pink rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
              <div>
                <CardTitle className="font-gaming text-3xl font-black text-white text-glow">RAGAR</CardTitle>
                <Badge variant="secondary" className="text-neon-cyan font-cyber tracking-widest mt-1">
                  NEURAL・GAMING・AI
                </Badge>
              </div>
            </motion.div>
            
            <CardTitle className="font-gaming text-2xl font-bold text-white mb-2">
              Welcome Back, Guardian
            </CardTitle>
            <CardDescription className="text-gray-400 font-cyber">
              Access your neural gaming network
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert variant="destructive" className="alert-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-cyber">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-cyber">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-gaming pl-10"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-cyber">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-gaming pl-10 pr-12"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-neon-cyan/10 ${showPassword ? 'text-neon-cyan' : 'text-gray-400'}`}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="rounded border-border-gray bg-card-bg accent-neon-cyan"
                  />
                  <Label htmlFor="rememberMe" className="text-gray-300 font-cyber text-sm cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link to="/auth/forgot-password" className="text-neon-cyan hover:text-neon-pink transition-colors text-sm font-cyber">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner w-5 h-5" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="flex items-center my-8">
              <Separator className="flex-1" />
              <span className="px-4 text-gray-400 font-cyber text-sm">or continue with</span>
              <Separator className="flex-1" />
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-5 gap-3">
              {socialLogins.map((social, index) => (
                <motion.div
                  key={social.name}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-full h-12 border-border-gray hover:border-neon-cyan/50 hover:bg-neon-cyan/5"
                    onClick={() => {
                      // TODO: Implement social login
                      console.log(`Login with ${social.name}`)
                    }}
                  >
                    <span className="text-xl">{social.icon}</span>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-6">
              <Separator className="mb-6" />
              <p className="text-gray-400 font-cyber">
                New to RAGAR?{' '}
                <Link to="/auth/register" className="text-neon-cyan hover:text-neon-pink transition-colors">
                  Join the Network
                </Link>
              </p>
            </div>

            {/* Neural Network Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-neon-cyan/5 border-neon-cyan/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center space-x-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-5 h-5 text-neon-cyan" />
                    </motion.div>
                    <span className="text-neon-cyan font-cyber text-sm">
                      Neural Network: <span className="text-neon-green">ONLINE</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage 