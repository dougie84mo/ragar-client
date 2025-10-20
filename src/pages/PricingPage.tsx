import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Shield, 
  Gamepad2,
  Bot,
  Users,
  Star,
  Sparkles
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import PricingCard from '../components/ui/PricingCard'
import { usePageTitle } from '../hooks/usePageTitle'

import {
  GET_SUBSCRIPTION_TIERS,
  GET_CURRENT_SUBSCRIPTION
} from '../lib/apollo'

interface SubscriptionTier {
  id: string
  name: string
  displayName: string
  price: number
  billingCycle: string
  maxCollections: number
  tokenLimit: number
  maxConnections: number
  features: string[]
  isPopular?: boolean
  stripePriceId?: string
}

const PricingPage: React.FC = () => {
  usePageTitle('Pricing Plans')
  const navigate = useNavigate()
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [upgradeError, setUpgradeError] = useState<string | null>(null)

  // GraphQL hooks
  const { data: tiersData, loading: tiersLoading } = useQuery(GET_SUBSCRIPTION_TIERS)
  const { data: currentSubData, loading: currentSubLoading } = useQuery(GET_CURRENT_SUBSCRIPTION)

  // Mock data for development (remove when GraphQL is connected)
  const mockTiers: SubscriptionTier[] = [
    {
      id: 'free',
      name: 'free',
      displayName: 'Free',
      price: 0,
      billingCycle: 'monthly',
      maxCollections: 5,
      tokenLimit: 2000,
      maxConnections: 0,
      features: [
        'Up to 5 Game Collections',
        '2,000 Chat Tokens',
        'Basic AI Assistance',
        'Community Support'
      ]
    },
    {
      id: 'casual_gamer',
      name: 'casual_gamer',
      displayName: 'Casual Gamer',
      price: 5,
      billingCycle: 'monthly',
      maxCollections: 20,
      tokenLimit: 20000,
      maxConnections: 2,
      features: [
        'Up to 20 Game Collections',
        '20,000 Chat Tokens',
        '2 Game Connections',
        'Advanced AI Features',
        'Priority Support',
        'Weekly Gaming Insights'
      ],
      isPopular: true
    },
    {
      id: 'daily_gamer',
      name: 'daily_gamer',
      displayName: 'Daily Gamer',
      price: 20,
      billingCycle: 'monthly',
      maxCollections: -1,
      tokenLimit: 100000,
      maxConnections: 10,
      features: [
        'Unlimited Game Collections',
        '100,000 Chat Tokens',
        '10 Game Connections',
        'Premium AI Features',
        'Real-time Game Data',
        'Custom Build Recommendations',
        'Priority Support'
      ]
    },
    {
      id: 'hardcore_gamer',
      name: 'hardcore_gamer',
      displayName: 'Hardcore Gamer',
      price: 50,
      billingCycle: 'monthly',
      maxCollections: -1,
      tokenLimit: 1000000,
      maxConnections: 50,
      features: [
        'Unlimited Game Collections',
        '1,000,000 Chat Tokens',
        '50 Game Connections',
        'Elite AI Features',
        'Advanced Analytics',
        'Custom Integrations',
        'Dedicated Support',
        'Beta Feature Access'
      ]
    }
  ]

  const tiers = tiersData?.subscriptionTiers || mockTiers
  const currentSubscription = currentSubData?.currentSubscription
  const currentTier = currentSubscription?.tier || 'free'
  const currentBillingCycle = currentSubscription?.billingCycle || 'monthly'

  const handleSelectPlan = async (tierId: string, cycle: string) => {
    // Allow selection even if same tier (for billing cycle changes)
    const isExactMatch = tierId === currentTier && cycle === currentBillingCycle
    if (isExactMatch) return
    
    // Find the selected tier details
    const selectedTierData = tiers.find((t: SubscriptionTier) => t.id === tierId)
    if (!selectedTierData) {
      setUpgradeError('Invalid tier selected')
      return
    }

    // Calculate price based on billing cycle
    const yearlyDiscount = 0.2
    const price = cycle === 'yearly' 
      ? selectedTierData.price * 12 * (1 - yearlyDiscount)
      : selectedTierData.price

    // Redirect to checkout page with all necessary information
    navigate('/checkout', {
      state: {
        tierName: selectedTierData.name,
        tierDisplayName: selectedTierData.displayName,
        billingCycle: cycle,
        price: price,
        features: selectedTierData.features,
        isPopular: selectedTierData.isPopular,
        maxCollections: selectedTierData.maxCollections,
        tokenLimit: selectedTierData.tokenLimit,
        maxConnections: selectedTierData.maxConnections
      }
    })
  }

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Gaming Assistant',
      description: 'Get intelligent recommendations and strategies powered by advanced AI'
    },
    {
      icon: Gamepad2,
      title: 'Multi-Game Support',
      description: 'Connect and manage multiple games from different platforms'
    },
    {
      icon: Shield,
      title: 'Secure Data Management',
      description: 'Your gaming data is encrypted and securely stored'
    },
    {
      icon: Users,
      title: 'Community Features',
      description: 'Connect with other gamers and share strategies'
    },
    {
      icon: Star,
      title: 'Real-time Updates',
      description: 'Get the latest game updates and patch information'
    },
    {
      icon: Sparkles,
      title: 'Custom Integrations',
      description: 'Build custom workflows and integrations for your gaming setup'
    }
  ]

  if (tiersLoading || currentSubLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading pricing plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
              <p className="text-zinc-400 mt-1">Unlock the full potential of RAGAR with our gaming-focused plans</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Error Alert */}
        {upgradeError && (
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertDescription className="text-red-300">{upgradeError}</AlertDescription>
          </Alert>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  20% OFF
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier: SubscriptionTier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              currentTier={currentTier}
              currentBillingCycle={currentBillingCycle}
              isCurrentPlan={tier.id === currentTier && billingCycle === currentBillingCycle}
              onSelectPlan={handleSelectPlan}
              billingCycle={billingCycle}
              isLoading={false}
            />
          ))}
        </div>

        {/* Features Section */}
        <div className="border-t border-zinc-800 pt-16 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need for Gaming Excellence
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              RAGAR provides comprehensive gaming intelligence and automation tools 
              to enhance your gaming experience across multiple platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-zinc-900 border-zinc-800 h-full hover:border-zinc-700 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-zinc-800 pt-16 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-2">Can I change my plan anytime?</h3>
                <p className="text-zinc-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-zinc-400">We accept all major credit cards, PayPal, and other secure payment methods through Stripe.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-zinc-400">Our Free plan gives you access to core features. You can upgrade anytime to unlock premium features.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-2">What happens to my data if I cancel?</h3>
                <p className="text-zinc-400">Your data remains safe and accessible. You can reactivate your subscription anytime to restore full access.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-zinc-400">Yes, we offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Can I use RAGAR for multiple games?</h3>
                <p className="text-zinc-400">Absolutely! RAGAR supports multiple games and platforms. Higher tiers allow more game connections.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-zinc-800 pt-16 text-center">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Level Up Your Gaming?
            </h2>
            <p className="text-zinc-400 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of gamers who trust RAGAR to enhance their gaming experience 
              with AI-powered insights and automation.
            </p>
            <Button
              onClick={() => handleSelectPlan('casual_gamer', billingCycle)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage
