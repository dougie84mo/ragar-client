import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
  Database
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { usePageTitle } from '../hooks/usePageTitle'

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

  const [activeSection, setActiveSection] = useState('security')
  const [isSaving, setIsSaving] = useState(false)
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
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    console.log('✅ RAGAR: Settings updated:', settings)
    // TODO: Implement actual API call to update settings
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

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Login Notifications</h4>
              <p className="text-sm text-zinc-400">Get notified of new login attempts</p>
            </div>
            <button
              onClick={() => handleToggle('loginNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.loginNotifications ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
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
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
            { key: 'gameUpdates', label: 'Game Updates', desc: 'Notifications about game patches and updates' },
            { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of your gaming activity' },
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
            <Label htmlFor="emailAddress" className="text-zinc-300">Email Address</Label>
            <Input
              id="emailAddress"
              type="email"
              value={settings.emailAddress}
              onChange={(e) => handleInputChange('emailAddress', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Marketing Emails</h4>
              <p className="text-sm text-zinc-400">Receive promotional emails and updates</p>
            </div>
            <button
              onClick={() => handleToggle('marketingEmails')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.marketingEmails ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
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
            <Label htmlFor="phoneNumber" className="text-zinc-300">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={settings.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">SMS Notifications</h4>
              <p className="text-sm text-zinc-400">Receive important updates via SMS</p>
            </div>
            <button
              onClick={() => handleToggle('smsEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.smsEnabled ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.smsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSubscriptionSection = () => (
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
              <h4 className="text-white font-medium capitalize">{settings.subscriptionTier} Plan</h4>
              <p className="text-sm text-zinc-400">
                {settings.subscriptionTier === 'free' ? 'Basic features included' : 
                 settings.subscriptionTier === 'pro' ? 'Advanced AI features' : 
                 'All premium features unlocked'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">
                {settings.subscriptionTier === 'free' ? 'Free' : 
                 settings.subscriptionTier === 'pro' ? '$9.99/mo' : '$19.99/mo'}
              </div>
              <div className="text-xs text-zinc-400">
                {settings.billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}
              </div>
            </div>
          </div>

          {settings.subscriptionTier !== 'free' && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div>
                <h4 className="text-white font-medium">Auto-Renewal</h4>
                <p className="text-sm text-zinc-400">Automatically renew your subscription</p>
              </div>
              <button
                onClick={() => handleToggle('autoRenew')}
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

          <div className="pt-4 border-t border-zinc-800">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              {settings.subscriptionTier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPaymentsSection = () => (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No Payment Methods</h3>
            <p className="text-zinc-400 text-sm mb-4">Add a payment method to upgrade your plan</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-zinc-400 text-sm">No billing history available</div>
          </div>
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

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div>
              <h4 className="text-white font-medium">Data Sharing</h4>
              <p className="text-sm text-zinc-400">Share anonymized data to improve RAGAR</p>
            </div>
            <button
              onClick={() => handleToggle('dataSharing')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dataSharing ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Analytics Opt-Out</h4>
              <p className="text-sm text-zinc-400">Opt out of usage analytics collection</p>
            </div>
            <button
              onClick={() => handleToggle('analyticsOptOut')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.analyticsOptOut ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.analyticsOptOut ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

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
          <Button variant="outline" className="w-full border-red-700 text-red-400 hover:bg-red-900/20">
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

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-zinc-400">Manage your account preferences and configuration</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
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
        </motion.div>

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
      </div>
    </div>
  )
}

export default SettingsPage
