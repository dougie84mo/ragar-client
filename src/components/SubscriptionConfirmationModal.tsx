import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertTriangle, Info, Calendar, DollarSign, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'

interface SubscriptionConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  tierName: string
  tierDisplayName: string
  billingCycle: 'monthly' | 'yearly'
  price: number
  currentTier?: string
  currentDisplayName?: string
  currentBillingCycle?: string
  currentPrice?: number
  isProcessing?: boolean
  proration?: {
    creditAmount: number
    chargeAmount: number
    description: string
  }
}

const SubscriptionConfirmationModal: React.FC<SubscriptionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tierName,
  tierDisplayName,
  billingCycle,
  price,
  currentTier = 'free',
  currentDisplayName = 'Free',
  currentBillingCycle = 'monthly',
  currentPrice = 0,
  isProcessing = false,
  proration
}) => {
  if (!isOpen) return null

  const isDowngrade = currentPrice > price && currentTier !== 'free'
  const isBillingCycleChange = currentTier === tierName && currentBillingCycle !== billingCycle
  const isCancellation = tierName === 'free' && currentTier !== 'free'

  const getActionType = () => {
    if (isCancellation) return 'cancel'
    if (isDowngrade) return 'downgrade'
    if (isBillingCycleChange) return 'billing-change'
    return 'upgrade'
  }

  const actionType = getActionType()

  const getModalTitle = () => {
    switch (actionType) {
      case 'cancel':
        return '⚠️ Cancel Subscription?'
      case 'downgrade':
        return 'Confirm Downgrade'
      case 'billing-change':
        return 'Change Billing Cycle'
      default:
        return 'Confirm Your Subscription'
    }
  }

  const getActionButtonText = () => {
    switch (actionType) {
      case 'cancel':
        return 'Yes, Cancel Subscription'
      case 'downgrade':
        return 'Confirm Downgrade'
      case 'billing-change':
        return 'Confirm Billing Change'
      default:
        return 'Confirm & Purchase'
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader className="border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  {actionType === 'cancel' && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                  {actionType === 'upgrade' && <Zap className="w-6 h-6 text-blue-500" />}
                  {actionType === 'downgrade' && <Info className="w-6 h-6 text-orange-500" />}
                  {actionType === 'billing-change' && <Calendar className="w-6 h-6 text-purple-500" />}
                  {getModalTitle()}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Current → New Subscription Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Current Plan */}
                <div className="space-y-2">
                  <div className="text-sm text-zinc-500 font-medium">Current Plan</div>
                  <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <div className="font-semibold text-white">{currentDisplayName}</div>
                    <div className="text-sm text-zinc-400 capitalize">{currentBillingCycle}</div>
                    <div className="text-lg font-bold text-white mt-2">
                      ${currentPrice === 0 ? '0' : currentPrice.toFixed(2)}
                      <span className="text-sm text-zinc-500 font-normal">
                        /{currentBillingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center col-span-2 -my-2">
                  <div className="text-2xl text-blue-500">→</div>
                </div>

                {/* New Plan */}
                <div className="space-y-2 col-span-2">
                  <div className="text-sm text-zinc-500 font-medium">New Plan</div>
                  <div className="p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg border-2 border-blue-500">
                    <div className="font-semibold text-white text-lg">{tierDisplayName}</div>
                    <div className="text-sm text-zinc-300 capitalize">{billingCycle}</div>
                    <div className="text-2xl font-bold text-white mt-2">
                      ${price === 0 ? '0' : price.toFixed(2)}
                      <span className="text-sm text-zinc-400 font-normal">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proration Notice (for upgrades) */}
              {actionType === 'upgrade' && proration && (
                <Alert className="bg-blue-900/20 border-blue-700">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    <div className="font-semibold mb-2">Prorated Billing Applied</div>
                    <div className="space-y-1 text-sm">
                      <div>Credit for unused time: -${proration.creditAmount.toFixed(2)}</div>
                      <div>New plan charge: ${proration.chargeAmount.toFixed(2)}</div>
                      <div className="pt-2 border-t border-blue-700/50">
                        <strong>Amount due today: ${(proration.chargeAmount - proration.creditAmount).toFixed(2)}</strong>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-blue-400">
                      {proration.description}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Downgrade Notice */}
              {actionType === 'downgrade' && (
                <Alert className="bg-orange-900/20 border-orange-700">
                  <Info className="h-4 w-4 text-orange-400" />
                  <AlertDescription className="text-orange-300">
                    <div className="font-semibold mb-2">Downgrade Scheduled</div>
                    <div className="text-sm space-y-1">
                      <div>• You'll keep <strong>{currentDisplayName}</strong> features until your current period ends</div>
                      <div>• No refund will be issued for the remaining time</div>
                      <div>• Your plan will change to <strong>{tierDisplayName}</strong> at renewal</div>
                      <div>• You can cancel this change anytime before renewal</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Cancellation Notice */}
              {actionType === 'cancel' && (
                <Alert className="bg-yellow-900/20 border-yellow-700">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    <div className="font-semibold mb-2">Cancellation Policy</div>
                    <div className="text-sm space-y-1">
                      <div>• You'll keep <strong>{currentDisplayName}</strong> features until your current period ends</div>
                      <div>• No refund will be issued</div>
                      <div>• After your period ends, you'll be downgraded to <strong>Free</strong></div>
                      <div>• You can reactivate anytime before the period ends</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Billing Cycle Change Notice */}
              {actionType === 'billing-change' && (
                <Alert className="bg-purple-900/20 border-purple-700">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <AlertDescription className="text-purple-300">
                    <div className="font-semibold mb-2">Billing Cycle Change</div>
                    <div className="text-sm space-y-1">
                      <div>• Your plan stays the same: <strong>{currentDisplayName}</strong></div>
                      <div>• Billing changes from <strong>{currentBillingCycle}</strong> to <strong>{billingCycle}</strong></div>
                      {billingCycle === 'yearly' && (
                        <div className="text-green-400">• Save 20% with annual billing!</div>
                      )}
                      <div>• Proration applied for remaining time</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Upgrade Benefits */}
              {actionType === 'upgrade' && !isCancellation && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">What You Get:</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Immediate access to all {tierDisplayName} features</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Credit applied for unused time on current plan</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Cancel anytime - no long-term commitment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 border-zinc-700 text-zinc-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className={`flex-1 ${
                    actionType === 'cancel' 
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : actionType === 'downgrade'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    getActionButtonText()
                  )}
                </Button>
              </div>

              {/* Fine Print */}
              <div className="text-xs text-zinc-500 text-center pt-2">
                By confirming, you agree to our Terms of Service and Privacy Policy.
                {actionType === 'upgrade' && ' You will be charged immediately for the prorated amount.'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default SubscriptionConfirmationModal

