import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, 
  Bell, 
  Mail, 
  CreditCard, 
  Lock, 
  Eye, 
  Smartphone,
  Crown,
  Save,
  ChevronRight,
  Database,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Alert, AlertDescription } from '../components/ui/alert'
import { usePageTitle } from '../hooks/usePageTitle'
import { 
  GET_CURRENT_USER, 
  UPDATE_SECURITY_SETTINGS, 
  UPDATE_NOTIFICATION_SETTINGS, 
  UPDATE_COMMUNICATION_SETTINGS, 
  UPDATE_PRIVACY_SETTINGS,
  GET_CURRENT_SUBSCRIPTION,
  CANCEL_SUBSCRIPTION,
  UPDATE_AUTO_RENEW
} from '../lib/apollo'
import CancelSubscriptionModal from '../components/CancelSubscriptionModal'
import { 
  validateEmail, 
  validatePhone, 
  formatPhoneNumber 
} from '../utils/validation'

interface SettingsData {
  // Security
  twoFactorEnabled: boolean
  passwordLastChanged: string
  loginNotifications: boolean
  
  // Notifications
  emailNotifications: boolean
  pushNotifications: boolean
  gameUpdates: boolean
  weeklyDigest: boolean
  soundEnabled: boolean
  
  // Email & SMS
  emailAddress: string
  phoneNumber: string
  smsEnabled: boolean
  marketingEmails: boolean
  
  // Subscription
  subscriptionTier: 'free' | 'pro' | 'premium'
  autoRenew: boolean
  billingCycle: 'monthly' | 'yearly'
  
  // Privacy
  profileVisibility: 'public' | 'friends' | 'private'
  dataSharing: boolean
  analyticsOptOut: boolean
  
  // General
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
}

const SettingsPage: React.FC = () => {
  usePageTitle('Settings')
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('security')
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [isSavingCommunication, setIsSavingCommunication] = useState(false)
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; error: string | null }>({ isValid: true, error: null })
  const [phoneValidation, setPhoneValidation] = useState<{ isValid: boolean; error: string | null }>({ isValid: true, error: null })
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({
    // Security
    twoFactorEnabled: false,
    passwordLastChanged: '2024-01-15',
    loginNotifications: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    gameUpdates: true,
    weeklyDigest: false,
    soundEnabled: true,
    
    // Email & SMS
    emailAddress: 'guardian@example.com',
    phoneNumber: '',
    smsEnabled: false,
    marketingEmails: false,
    
    // Subscription
    subscriptionTier: 'free',
    autoRenew: true,
    billingCycle: 'monthly',
    
    // Privacy
    profileVisibility: 'public',
    dataSharing: false,
    analyticsOptOut: false,
    
    // General
    theme: 'dark',
    language: 'English',
    timezone: 'UTC-5'
  })

  // GraphQL hooks
  const { data: userData, loading: userLoading, refetch } = useQuery(GET_CURRENT_USER)
  const { data: subscriptionData, loading: subscriptionLoading } = useQuery(GET_CURRENT_SUBSCRIPTION)
  const [updateSecuritySettings] = useMutation(UPDATE_SECURITY_SETTINGS)
  const [updateNotificationSettings] = useMutation(UPDATE_NOTIFICATION_SETTINGS)
  const [updateCommunicationSettings] = useMutation(UPDATE_COMMUNICATION_SETTINGS)
  const [updatePrivacySettings] = useMutation(UPDATE_PRIVACY_SETTINGS)
  const [cancelSubscription] = useMutation(CANCEL_SUBSCRIPTION)
  const [updateAutoRenew] = useMutation(UPDATE_AUTO_RENEW)

  // Load user settings when data is available
  useEffect(() => {
    if (userData?.me?.settings) {
      const userSettings = userData.me.settings
      setSettings({
        // Security
        twoFactorEnabled: userSettings.security.twoFactorEnabled,
        passwordLastChanged: userSettings.security.passwordLastChanged || '2024-01-15',
        loginNotifications: userSettings.security.loginNotifications,
        
        // Notifications
        emailNotifications: userSettings.notifications.emailNotifications,
        pushNotifications: userSettings.notifications.pushNotifications,
        gameUpdates: userSettings.notifications.gameUpdates,
        weeklyDigest: userSettings.notifications.weeklyDigest,
        soundEnabled: userSettings.notifications.soundEnabled,
        
        // Email & SMS
        emailAddress: userData.me.email || 'guardian@example.com',
        phoneNumber: userSettings.communication.phoneNumber || '',
        smsEnabled: userSettings.notifications.smsNotifications,
        marketingEmails: userSettings.notifications.marketingEmails,
        
        // Subscription
        subscriptionTier: userSettings.subscription.subscriptionTier as 'free' | 'pro' | 'premium',
        autoRenew: userSettings.subscription.autoRenew,
        billingCycle: userSettings.subscription.billingCycle as 'monthly' | 'yearly',
        
        // Privacy
        profileVisibility: userSettings.privacy.profileVisibility as 'public' | 'friends' | 'private',
        dataSharing: userSettings.privacy.dataSharing,
        analyticsOptOut: userSettings.privacy.analyticsOptOut,
        
        // General
        theme: userSettings.theme as 'light' | 'dark' | 'system',
        language: userSettings.language,
        timezone: userSettings.timezone
      })
    }
  }, [userData])

  const sections = [
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'communication', name: 'Email & SMS', icon: Mail },
    { id: 'subscription', name: 'Subscription', icon: Crown },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'privacy', name: 'Privacy', icon: Eye }
  ]

  const handleToggle = (key: keyof SettingsData) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleInputChange = (key: keyof SettingsData, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))

    // Real-time validation for email
    if (key === 'emailAddress') {
      const validation = validateEmail(value)
      setEmailValidation(validation)
    }

    // Real-time validation for phone
    if (key === 'phoneNumber') {
      const validation = validatePhone(value)
      setPhoneValidation(validation)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits to be typed
    const digitsOnly = e.target.value.replace(/\D/g, '')
    const formatted = formatPhoneNumber(digitsOnly)
    handleInputChange('phoneNumber', formatted)
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right arrows
    if ([8, 9, 27, 13, 46, 35, 36, 37, 39].includes(e.keyCode) ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey) ||
        (e.keyCode === 67 && e.ctrlKey) ||
        (e.keyCode === 86 && e.ctrlKey) ||
        (e.keyCode === 88 && e.ctrlKey)) {
      return
    }
    // Ensure that it's a number and stop the keypress if it's not
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  }

  const handleSaveSecurity = async () => {
    setIsSavingSecurity(true)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      await updateSecuritySettings({
        variables: {
          input: {
            twoFactorEnabled: settings.twoFactorEnabled,
            loginNotifications: settings.loginNotifications
          }
        }
      })
      setSaveSuccess('Security settings updated successfully')
      await refetch()
      console.log('✅ RAGAR: Security settings updated')
    } catch (error: any) {
      console.error('❌ RAGAR: Error updating security settings:', error)
      setSaveError(error.message || 'Failed to update security settings')
    } finally {
      setIsSavingSecurity(false)
      setTimeout(() => {
        setSaveSuccess(null)
        setSaveError(null)
      }, 3000)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      await updateNotificationSettings({
        variables: {
          input: {
            emailNotifications: settings.emailNotifications,
            pushNotifications: settings.pushNotifications,
            smsNotifications: settings.smsEnabled,
            gameUpdates: settings.gameUpdates,
            weeklyDigest: settings.weeklyDigest,
            marketingEmails: settings.marketingEmails,
            soundEnabled: settings.soundEnabled
          }
        }
      })
      setSaveSuccess('Notification settings updated successfully')
      await refetch()
      console.log('✅ RAGAR: Notification settings updated')
    } catch (error: any) {
      console.error('❌ RAGAR: Error updating notification settings:', error)
      setSaveError(error.message || 'Failed to update notification settings')
    } finally {
      setIsSavingNotifications(false)
      setTimeout(() => {
        setSaveSuccess(null)
        setSaveError(null)
      }, 3000)
    }
  }

  const handleSaveCommunication = async () => {
    // Validate before saving
    const emailCheck = validateEmail(settings.emailAddress)
    const phoneCheck = validatePhone(settings.phoneNumber)

    if (!emailCheck.isValid || !phoneCheck.isValid) {
      setSaveError('Please fix validation errors before saving')
      setTimeout(() => setSaveError(null), 5000)
      return
    }

    setIsSavingCommunication(true)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      await updateCommunicationSettings({
        variables: {
          input: {
            emailAddress: settings.emailAddress,
            phoneNumber: settings.phoneNumber,
            smsEnabled: settings.smsEnabled
          }
        }
      })
      setSaveSuccess('Communication settings updated successfully')
      await refetch()
      console.log('✅ RAGAR: Communication settings updated')
    } catch (error: any) {
      console.error('❌ RAGAR: Error updating communication settings:', error)
      
      // Check for duplicate email or phone errors
      if (error.message?.includes('email address is already registered')) {
        setSaveError('This email address is already registered to another account')
      } else if (error.message?.includes('phone number is already registered')) {
        setSaveError('This phone number is already registered to another account')
      } else if (error.message?.includes('duplicate') || error.message?.includes('already exists') || error.message?.includes('E11000')) {
        setSaveError('This information is already registered to another account')
      } else {
        setSaveError(error.message || 'Failed to update communication settings')
      }
    } finally {
      setIsSavingCommunication(false)
      setTimeout(() => {
        setSaveSuccess(null)
        setSaveError(null)
      }, 3000)
    }
  }

  const handleSavePrivacy = async () => {
    setIsSavingPrivacy(true)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      await updatePrivacySettings({
        variables: {
          input: {
            profileVisibility: settings.profileVisibility,
            dataSharing: settings.dataSharing,
            analyticsOptOut: settings.analyticsOptOut
          }
        }
      })
      setSaveSuccess('Privacy settings updated successfully')
      await refetch()
      console.log('✅ RAGAR: Privacy settings updated')
    } catch (error: any) {
      console.error('❌ RAGAR: Error updating privacy settings:', error)
      setSaveError(error.message || 'Failed to update privacy settings')
    } finally {
      setIsSavingPrivacy(false)
      setTimeout(() => {
        setSaveSuccess(null)
        setSaveError(null)
      }, 3000)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      const result = await cancelSubscription()
      
      if (result.data?.cancelSubscription?.success) {
        setSaveSuccess('Your subscription has been scheduled for cancellation')
        setShowCancelModal(false)
        // Refetch to show updated status
        window.location.reload() // Reload to refresh all subscription data
      } else {
        setSaveError(result.data?.cancelSubscription?.error || 'Failed to cancel subscription')
      }
      console.log('✅ RAGAR: Subscription cancellation scheduled')
    } catch (error: any) {
      console.error('❌ RAGAR: Error canceling subscription:', error)
      setSaveError(error.message || 'Failed to cancel subscription')
    } finally {
      setIsCancelling(false)
      setTimeout(() => {
        setSaveSuccess(null)
        setSaveError(null)
      }, 5000)
    }
  }

  const handleToggleAutoRenew = async (newValue: boolean) => {
    // Update local state immediately for UI feedback
    setSettings(prev => ({ ...prev, autoRenew: newValue }))
    
    try {
      const result = await updateAutoRenew({
        variables: { autoRenew: newValue }
      })
      
      if (result.data?.updateAutoRenew?.success) {
        if (newValue && result.data.updateAutoRenew.subscription?.cancelAtPeriodEnd === false) {
          setSaveSuccess('Subscription reactivated! Auto-renewal enabled.')
          // Reload to refresh cancellation status
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setSaveSuccess(`Auto-renewal ${newValue ? 'enabled' : 'disabled'}`)
        }
        console.log('✅ RAGAR: Auto-renewal updated')
      } else {
        setSaveError(result.data?.updateAutoRenew?.error || 'Failed to update auto-renewal')
        // Revert on error
        setSettings(prev => ({ ...prev, autoRenew: !newValue }))
      }
    } catch (error: any) {
      console.error('❌ RAGAR: Error updating auto-renewal:', error)
      setSaveError(error.message || 'Failed to update auto-renewal')
      // Revert on error
      setSettings(prev => ({ ...prev, autoRenew: !newValue }))
    } finally {
      setTimeout(() => {
        setSaveSuccess(null)
        setSaveError(null)
      }, 3000)
    }
  }

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-zinc-400">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => handleToggle('twoFactorEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.twoFactorEnabled ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Password</h4>
                <p className="text-sm text-zinc-400">
                  Last changed: {new Date(settings.passwordLastChanged).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button for Security */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSecurity}
          disabled={isSavingSecurity}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSavingSecurity ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'loginNotifications', label: 'Login Notifications', desc: 'Get notified of new login attempts' },
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
            { key: 'smsEnabled', label: 'SMS Notifications', desc: 'Receive important updates via SMS' },
            { key: 'gameUpdates', label: 'Game Updates', desc: 'Notifications about game patches and updates' },
            { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of your gaming activity' },
            { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional emails and updates' },
            { key: 'soundEnabled', label: 'Sound Effects', desc: 'Play sounds for notifications' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">{label}</h4>
                <p className="text-sm text-zinc-400">{desc}</p>
              </div>
              <button
                onClick={() => handleToggle(key as keyof SettingsData)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[key as keyof SettingsData] ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[key as keyof SettingsData] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button for Notifications */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveNotifications}
          disabled={isSavingNotifications}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSavingNotifications ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )

  const renderCommunicationSection = () => (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emailAddress" className="text-zinc-300 pb-[5px] block">
              Email Address
            </Label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                !emailValidation.isValid ? 'text-red-500' : emailValidation.error && emailValidation.isValid ? 'text-yellow-500' : 'text-zinc-500'
              }`} />
              <Input
                id="emailAddress"
                type="email"
                value={settings.emailAddress}
                onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                className={`bg-zinc-800 text-white pl-10 pr-10 ${
                  !emailValidation.isValid 
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : emailValidation.error && emailValidation.isValid
                    ? 'border-yellow-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
                    : 'border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {settings.emailAddress && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {!emailValidation.isValid ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : emailValidation.error && emailValidation.isValid ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
              )}
            </div>
            {emailValidation.error && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                !emailValidation.isValid ? 'text-red-400' : 'text-yellow-400'
              }`}>
                <AlertCircle className="w-3 h-3" />
                {emailValidation.error}
              </p>
            )}
            {!emailValidation.error && (
              <p className="text-xs text-zinc-500 mt-1">
                Primary email address for account notifications
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            SMS Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber" className="text-zinc-300 pb-[5px] block">
              Phone Number (US)
            </Label>
            <div className="relative">
              <Smartphone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                !phoneValidation.isValid ? 'text-red-500' : 'text-zinc-500'
              }`} />
              <Input
                id="phoneNumber"
                type="tel"
                value={settings.phoneNumber}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                className={`bg-zinc-800 text-white pl-10 pr-10 ${
                  !phoneValidation.isValid 
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : 'border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
                placeholder="1-(555)-123-4567"
                maxLength={18}
              />
              {settings.phoneNumber && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {!phoneValidation.isValid ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
              )}
            </div>
            {phoneValidation.error && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {phoneValidation.error}
              </p>
            )}
            {!phoneValidation.error && (
              <p className="text-xs text-zinc-500 mt-1">
                Used for SMS notifications and two-factor authentication. Format: 1-(###)-###-####
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button for Communication */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveCommunication}
          disabled={isSavingCommunication}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSavingCommunication ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )

  const renderSubscriptionSection = () => {
    const currentSubscription = subscriptionData?.currentSubscription
    const tierDisplayNames = {
      'free': 'Free',
      'casual_gamer': 'Casual Gamer',
      'daily_gamer': 'Daily Gamer',
      'hardcore_gamer': 'Hardcore Gamer'
    }
    
    const tierPrices = {
      'free': 0,
      'casual_gamer': 5,
      'daily_gamer': 20,
      'hardcore_gamer': 50
    }

    const currentTier = currentSubscription?.tier || settings.subscriptionTier || 'free'
    const displayName = tierDisplayNames[currentTier as keyof typeof tierDisplayNames] || 'Free'
    const price = tierPrices[currentTier as keyof typeof tierPrices] || 0

    return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
                <h4 className="text-white font-medium">{displayName} Plan</h4>
              <p className="text-sm text-zinc-400">
                  {currentTier === 'free' ? 'Basic features included' : 
                   currentTier === 'casual_gamer' ? 'Perfect for casual gaming' : 
                   currentTier === 'daily_gamer' ? 'Advanced features for daily gamers' :
                   'Elite features for hardcore gamers'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">
                  {price === 0 ? 'Free' : `$${price}/mo`}
              </div>
                <div className="text-xs text-zinc-400 capitalize">
                  {currentSubscription?.billingCycle || 'monthly'} billing
              </div>
            </div>
          </div>

            {/* Billing Cycle Description */}
            {currentSubscription && currentSubscription.billingCycle && price > 0 && (
              <div className="pt-3 border-t border-zinc-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Billing Cycle</span>
                  <span className="text-white font-medium capitalize">
                    {currentSubscription.billingCycle}
                  </span>
                </div>
                {currentSubscription.currentPeriodEnd && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-zinc-400">Next Payment</span>
                    <span className="text-white">
                      {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {currentSubscription.billingCycle === 'yearly' && (
                  <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Saving 20% with annual billing
                  </div>
                )}
              </div>
            )}

            {/* Usage Stats */}
            {currentSubscription && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {currentSubscription.maxCollections === -1 ? '∞' : currentSubscription.maxCollections}
                  </div>
                  <div className="text-xs text-zinc-400">Collections</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {currentSubscription.tokenLimit >= 1000000 ? `${(currentSubscription.tokenLimit / 1000000).toFixed(1)}M` :
                     currentSubscription.tokenLimit >= 1000 ? `${(currentSubscription.tokenLimit / 1000).toFixed(0)}K` :
                     currentSubscription.tokenLimit}
                  </div>
                  <div className="text-xs text-zinc-400">Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {currentSubscription.maxConnections === -1 ? '∞' : currentSubscription.maxConnections}
                  </div>
                  <div className="text-xs text-zinc-400">Connections</div>
                </div>
              </div>
            )}

          {settings.subscriptionTier !== 'free' && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div>
                <h4 className="text-white font-medium">Auto-Renewal</h4>
                  <p className="text-sm text-zinc-400">
                    {settings.autoRenew 
                      ? 'Subscription will renew automatically' 
                      : currentSubscription?.cancelAtPeriodEnd
                      ? 'Enable to reactivate your subscription'
                      : 'Subscription will not renew'}
                  </p>
              </div>
              <button
                  onClick={() => handleToggleAutoRenew(!settings.autoRenew)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoRenew ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoRenew ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

            {/* Subscription Status Section */}
            {currentSubscription && currentTier !== 'free' && (
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                {/* Active Status */}
                {!currentSubscription.cancelAtPeriodEnd && !currentSubscription.scheduledTierChange && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Active Subscription</span>
                    {currentSubscription.autoRenew && (
                      <span className="text-zinc-500">
                        • Renews {currentSubscription.currentPeriodEnd 
                          ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'automatically'}
                      </span>
                    )}
                  </div>
                )}

                {/* Scheduled Cancellation (Downgrade to Free) */}
                {currentSubscription.cancelAtPeriodEnd && currentSubscription.scheduledChangeDate && (
                  <Alert className="bg-yellow-900/20 border-yellow-700">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-300">
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        Subscription Ending
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          Your <strong>{displayName}</strong> subscription will be cancelled on{' '}
                          <strong>{new Date(currentSubscription.scheduledChangeDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</strong>.
                        </div>
                        <div className="flex items-start gap-2 pt-2 border-t border-yellow-700/30">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-yellow-400" />
                          <span>You'll keep all {displayName} features until then</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-400" />
                          <span>After cancellation, you'll be downgraded to <strong>Free</strong> tier</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-yellow-700/30 text-xs text-yellow-400">
                          💡 Want to keep your subscription? Toggle Auto-Renewal ON to reactivate.
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Scheduled Downgrade (to a paid tier) */}
                {!currentSubscription.cancelAtPeriodEnd && currentSubscription.scheduledTierChange && currentSubscription.scheduledTierChange !== 'free' && (
                  <Alert className="bg-orange-900/20 border-orange-700">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="text-orange-300">
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        Downgrade Scheduled
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          Your plan will change from <strong>{displayName}</strong> to{' '}
                          <strong>{currentSubscription.scheduledChangeDisplayName || currentSubscription.scheduledTierChange}</strong>{' '}
                          on <strong>{new Date(currentSubscription.scheduledChangeDate!).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</strong>.
                        </div>
                        <div className="flex items-start gap-2 pt-2 border-t border-orange-700/30">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-orange-400" />
                          <span>You'll keep all {displayName} features until the downgrade date</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 text-orange-400" />
                          <span>No refund for the remaining time on your current plan</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-orange-700/30 text-xs text-orange-400">
                          💡 Changed your mind? Go to Pricing to select a different plan.
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <Button 
                onClick={() => navigate('/pricing')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {settings.subscriptionTier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
            </Button>
              
              {settings.subscriptionTier !== 'free' && (
                <>
                  <Button 
                    onClick={() => navigate('/payment')}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Manage Billing
                  </Button>
                  
                  {!currentSubscription?.cancelAtPeriodEnd && (
                    <Button 
                      onClick={() => setShowCancelModal(true)}
                      variant="outline"
                      className="w-full border-red-700 text-red-400 hover:bg-red-900/20"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
  }

  const renderPaymentsSection = () => (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment & Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Manage Your Payments</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Add payment methods, view billing history, and manage your subscription
            </p>
            <Button 
              onClick={() => navigate('/payment')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Payment Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => navigate('/pricing')}
            variant="outline" 
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 justify-start"
          >
            <Crown className="w-4 h-4 mr-2" />
            View All Plans
          </Button>
          <Button 
            onClick={() => navigate('/payment')}
            variant="outline" 
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 justify-start"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Methods
          </Button>
          <Button 
            onClick={() => navigate('/payment')}
            variant="outline" 
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 justify-start"
          >
            <Database className="w-4 h-4 mr-2" />
            Billing History
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-zinc-300">Profile Visibility</Label>
            <div className="mt-2 space-y-2">
              {[
                { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                { value: 'friends', label: 'Friends Only', desc: 'Only friends can view your profile' },
                { value: 'private', label: 'Private', desc: 'Only you can view your profile' }
              ].map(({ value, label, desc }) => (
                <label key={value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value={value}
                    checked={settings.profileVisibility === value}
                    onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-700 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-white font-medium">{label}</div>
                    <div className="text-sm text-zinc-400">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800 opacity-50">
            <div>
              <h4 className="text-white font-medium flex items-center">
                Data Sharing
                <Crown className="w-4 h-4 ml-2 text-yellow-500" />
              </h4>
              <p className="text-sm text-zinc-400">Share anonymized data to improve RAGAR (Pro/Premium)</p>
            </div>
            <button
              disabled
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-zinc-700 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
            </button>
          </div>

          <div className="flex items-center justify-between opacity-50">
            <div>
              <h4 className="text-white font-medium flex items-center">
                Analytics Opt-Out
                <Crown className="w-4 h-4 ml-2 text-yellow-500" />
              </h4>
              <p className="text-sm text-zinc-400">Opt out of usage analytics collection (Pro/Premium)</p>
            </div>
            <button
              disabled
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-zinc-700 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button for Privacy */}
      <div className="flex justify-end">
        <Button
          onClick={handleSavePrivacy}
          disabled={isSavingPrivacy}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSavingPrivacy ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Download My Data
          </Button>
          <Button className="w-full !bg-red-600 hover:!bg-red-700 !text-white font-semibold border-0">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'security': return renderSecuritySection()
      case 'notifications': return renderNotificationsSection()
      case 'communication': return renderCommunicationSection()
      case 'subscription': return renderSubscriptionSection()
      case 'payments': return renderPaymentsSection()
      case 'privacy': return renderPrivacySection()
      default: return renderSecuritySection()
    }
  }

  // Show loading state
  if (userLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-zinc-400">Manage your account preferences and configuration</p>
        </motion.div>

        {/* Success/Error Alerts */}
        {saveSuccess && (
          <Alert className="mb-4 bg-green-900/20 border-green-700">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-300">{saveSuccess}</AlertDescription>
          </Alert>
        )}
        {saveError && (
          <Alert className="mb-4 bg-red-900/20 border-red-700">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-300">{saveError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-3" />
                          <span className="font-medium">{section.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {renderContent()}
          </motion.div>
        </div>

        {/* Cancel Subscription Modal */}
        {subscriptionData?.currentSubscription && subscriptionData.currentSubscription.tier !== 'free' && (
          <CancelSubscriptionModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleCancelSubscription}
            tierDisplayName={subscriptionData.currentSubscription.displayName || 'Your Plan'}
            billingCycle={subscriptionData.currentSubscription.billingCycle || 'monthly'}
            price={subscriptionData.currentSubscription.price || 0}
            periodEndDate={subscriptionData.currentSubscription.currentPeriodEnd}
            isProcessing={isCancelling}
          />
        )}
      </div>
    </div>
  )
}

export default SettingsPage
