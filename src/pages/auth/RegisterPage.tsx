import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Eye, EyeOff, User, Mail, Lock, Check, X, ArrowLeft, UserPlus, AlertTriangle, CheckCircle } from 'lucide-react'
import { REGISTER_MUTATION, setAuthToken } from '../../lib/apollo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface RegisterFormData {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  confirmPassword: string
  agreedToTerms: boolean
}

interface PasswordStrength {
  score: number
  checks: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    number: boolean
    special: boolean
  }
}

const RegisterPage: React.FC = () => {

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  })

  const [register, { loading, error }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      console.log('🧠 RAGAR: Registration successful!', data)
      if (data.register.token) {
        setAuthToken(data.register.token)
        setRegistrationSuccess(true)
      }
    },
    onError: (error) => {
      console.error('🧠 RAGAR: Registration failed:', error)
    }
  })

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
    
    const score = Object.values(checks).filter(Boolean).length
    return { score, checks }
  }

  const passwordStrength = checkPasswordStrength(formData.password)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordsMatch) {
      return
    }

    if (passwordStrength.score < 4) {
      return
    }

    try {
      await register({
        variables: {
          input: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            email: formData.email,
            password: formData.password
            // Note: confirmPassword and agreedToTerms are frontend-only validation
          }
        }
      })
    } catch (err) {
      console.error('Registration error:', err)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score < 2) return '#ff4757'
    if (score < 4) return '#ffa502'
    return '#00ff00'
  }

  const getStrengthText = (score: number) => {
    if (score < 2) return 'Weak'
    if (score < 4) return 'Good'
    return 'Strong'
  }

  if (registrationSuccess) {
    return (
      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Card className="glass-strong border-border-gray shadow-gaming-lg">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-neon-green rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-dark-bg" />
              </motion.div>
              
              <CardTitle className="font-gaming text-3xl font-bold mb-4 text-glow">
                Welcome to RAGAR!
              </CardTitle>
              <CardDescription className="text-gray-300 font-cyber mb-6">
                Your account has been created successfully. Please check your email to verify your account before logging in.
              </CardDescription>
              
              <Button asChild className="btn-primary">
                <Link to="/auth/login">
                  Continue to Login
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-neon-pink rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gaming-blue rounded-full blur-3xl opacity-10"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="auth-card"
      >
        <Card className="glass-strong border-border-gray shadow-gaming-lg">
          <CardHeader className="text-center pb-6">
            <Button asChild variant="ghost" size="sm" className="self-start mb-4 text-neon-cyan hover:text-neon-pink">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-16 h-16 bg-gaming-gradient rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            
            <CardTitle className="font-gaming text-3xl font-bold mb-2 text-glow">
              Join the Network
            </CardTitle>
            <CardDescription className="text-gray-400 font-cyber">
              Unlock neural-powered gaming intelligence
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Alert variant="destructive" className="alert-error">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-cyber text-sm font-semibold">Registration Failed</p>
                    <p className="opacity-80 font-cyber text-xs">
                      {error.message || 'Unable to create account. Please try again.'}
                    </p>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300 font-cyber">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-gaming pl-10"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300 font-cyber">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input-gaming"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300 font-cyber">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input-gaming pl-10"
                    placeholder="gamer_username"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-cyber">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-gaming pl-10"
                    placeholder="gamer@neural.network"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-cyber">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-gaming pl-10 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-neon-cyan/10 ${showPassword ? 'text-neon-cyan' : 'text-gray-400'}`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <Card className="mt-3 bg-card-bg/50 border-border-gray">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 font-cyber text-xs">Password Strength</span>
                          <Badge 
                            variant="outline"
                            style={{ 
                              color: getStrengthColor(passwordStrength.score),
                              borderColor: getStrengthColor(passwordStrength.score)
                            }}
                          >
                            {getStrengthText(passwordStrength.score)}
                          </Badge>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            className="h-full transition-all duration-300"
                            style={{ backgroundColor: getStrengthColor(passwordStrength.score) }}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries({
                            'At least 8 characters': passwordStrength.checks.length,
                            'Lowercase letter': passwordStrength.checks.lowercase,
                            'Uppercase letter': passwordStrength.checks.uppercase,
                            'Number': passwordStrength.checks.number,
                            'Special character': passwordStrength.checks.special
                          }).map(([label, passed]) => (
                            <div key={label} className="flex items-center text-xs font-cyber">
                              {passed ? (
                                <Check className="w-3 h-3 text-neon-green mr-2" />
                              ) : (
                                <X className="w-3 h-3 text-gray-500 mr-2" />
                              )}
                              <span style={{ color: passed ? '#00ff00' : '#6b7280' }}>
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 font-cyber">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-gaming pl-10 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-neon-cyan/10 ${showConfirmPassword ? 'text-neon-cyan' : 'text-gray-400'}`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex items-center space-x-2"
                  >
                    {passwordsMatch ? (
                      <>
                        <Check className="w-4 h-4 text-neon-green" />
                        <span className="text-neon-green font-cyber text-xs">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-ragar-danger" />
                        <span className="text-ragar-danger font-cyber text-xs">Passwords don't match</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Terms Agreement */}
              <Card className="bg-neon-cyan/5 border-neon-cyan/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agreedToTerms"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleInputChange}
                      className="mt-1 rounded border-border-gray bg-card-bg accent-neon-cyan"
                      required
                    />
                    <Label htmlFor="agreedToTerms" className="text-gray-300 font-cyber text-sm cursor-pointer">
                      I agree to the{' '}
                      <Link to="/terms" className="text-neon-cyan hover:text-neon-pink transition-colors">Terms of Service</Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-neon-cyan hover:text-neon-pink transition-colors">Privacy Policy</Link>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Register Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={loading || !passwordsMatch || passwordStrength.score < 4 || !formData.agreedToTerms}
                  className="btn-primary w-full"
                  size="lg"
                >
                  {loading ? (
                    <div className="loading-spinner w-5 h-5" />
                  ) : (
                    <>
                      <span>Join RAGAR Network</span>
                      <UserPlus className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Login Link */}
            <div className="text-center pt-6">
              <Separator className="mb-6" />
              <p className="text-gray-400 font-cyber text-sm">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="text-neon-cyan hover:text-neon-pink font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default RegisterPage 