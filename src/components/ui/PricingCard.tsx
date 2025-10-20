import React from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Zap } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface PricingCardProps {
  tier: {
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
  }
  currentTier?: string
  currentBillingCycle?: string
  isCurrentPlan?: boolean
  onSelectPlan: (tierId: string, billingCycle: string) => void
  billingCycle: 'monthly' | 'yearly'
  isLoading?: boolean
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  currentTier,
  currentBillingCycle,
  isCurrentPlan,
  onSelectPlan,
  billingCycle,
  isLoading = false
}) => {
  const yearlyDiscount = 0.2 // 20% discount for yearly
  const displayPrice = billingCycle === 'yearly' ? tier.price * 12 * (1 - yearlyDiscount) : tier.price
  const monthlyPrice = billingCycle === 'yearly' ? displayPrice / 12 : displayPrice

  const formatCollections = (count: number) => {
    if (count === -1) return 'Unlimited'
    return count.toString()
  }

  const formatTokens = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
    return count.toString()
  }

  const formatConnections = (count: number) => {
    if (count === -1) return 'Unlimited'
    if (count === 0) return 'None'
    return count.toString()
  }

  const getCardVariant = () => {
    if (tier.isPopular) return 'popular'
    if (isCurrentPlan) return 'current'
    return 'default'
  }

  const cardStyles = {
    default: 'bg-zinc-900 border-zinc-800 hover:border-zinc-700',
    current: 'bg-blue-900/20 border-blue-600 ring-1 ring-blue-600/50',
    popular: 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500 ring-2 ring-blue-500/50 relative overflow-hidden'
  }

  const buttonStyles = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    current: 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300 cursor-not-allowed',
    popular: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
  }

  const variant = getCardVariant()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {tier.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Most Popular
          </div>
        </div>
      )}

      <Card className={`${cardStyles[variant]} transition-all duration-300 hover:scale-105 h-full`}>
        {tier.isPopular && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 pointer-events-none" />
        )}
        
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {tier.name === 'hardcore_gamer' && <Zap className="w-5 h-5 text-yellow-500" />}
            <CardTitle className="text-xl font-bold text-white">
              {tier.displayName}
            </CardTitle>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-white">
                ${tier.price === 0 ? '0' : monthlyPrice.toFixed(0)}
              </span>
              {tier.price > 0 && (
                <span className="text-zinc-400 text-sm">
                  /{billingCycle === 'yearly' ? 'month' : 'month'}
                </span>
              )}
            </div>
            
            {billingCycle === 'yearly' && tier.price > 0 && (
              <div className="text-xs text-green-400">
                Save ${(tier.price * 12 * yearlyDiscount).toFixed(0)}/year
              </div>
            )}
            
            {billingCycle === 'yearly' && tier.price > 0 && (
              <div className="text-xs text-zinc-500">
                Billed ${displayPrice.toFixed(0)} annually
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400 text-sm">Collections</span>
              <span className="text-white font-semibold">{formatCollections(tier.maxCollections)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400 text-sm">Chat Tokens</span>
              <span className="text-white font-semibold">{formatTokens(tier.tokenLimit)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400 text-sm">Game Connections</span>
              <span className="text-white font-semibold">{formatConnections(tier.maxConnections)}</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Features</h4>
            <ul className="space-y-2">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-zinc-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            {(() => {
              // Check if this is the current tier AND billing cycle
              const isExactMatch = tier.id === currentTier && billingCycle === currentBillingCycle
              // Check if same tier but different billing cycle
              const isBillingCycleChange = tier.id === currentTier && billingCycle !== currentBillingCycle
              
              let buttonText = 'Select Plan'
              if (isLoading) {
                buttonText = 'Processing...'
              } else if (isExactMatch) {
                buttonText = 'Current Plan'
              } else if (isBillingCycleChange) {
                buttonText = `Switch to ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`
              } else if (tier.price === 0) {
                buttonText = 'Get Started Free'
              } else if (!currentTier || currentTier === 'free') {
                buttonText = 'Upgrade Now'
              } else {
                // Determine if upgrade or downgrade
                const tierOrder = ['free', 'casual_gamer', 'daily_gamer', 'hardcore_gamer']
                const currentIndex = tierOrder.indexOf(currentTier || 'free')
                const targetIndex = tierOrder.indexOf(tier.id)
                if (targetIndex > currentIndex) {
                  buttonText = 'Upgrade to This Plan'
                } else if (targetIndex < currentIndex) {
                  buttonText = 'Downgrade to This Plan'
                } else {
                  buttonText = 'Switch Plan'
                }
              }
              
              return (
                <Button
                  onClick={() => onSelectPlan(tier.id, billingCycle)}
                  disabled={isExactMatch || isLoading}
                  className={`w-full ${isExactMatch ? buttonStyles['current'] : buttonStyles[variant]} transition-all duration-300`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    buttonText
                  )}
                </Button>
              )
            })()}
          </div>

          {tier.id === currentTier && billingCycle === currentBillingCycle && (
            <div className="text-center mt-2">
              <span className="text-xs text-zinc-500">
                ✓ You're currently on this plan
              </span>
            </div>
          )}
          
          {tier.id === currentTier && billingCycle !== currentBillingCycle && (
            <div className="text-center mt-2">
              <span className="text-xs text-blue-400">
                💡 Save {billingCycle === 'yearly' ? '20%' : 'with flexible monthly billing'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default PricingCard
