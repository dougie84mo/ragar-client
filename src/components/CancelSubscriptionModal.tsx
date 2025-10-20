import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Calendar, Check, Info } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'

interface CancelSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  tierDisplayName: string
  billingCycle: string
  price: number
  periodEndDate?: string
  isProcessing?: boolean
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tierDisplayName,
  billingCycle,
  price,
  periodEndDate,
  isProcessing = false
}) => {
  if (!isOpen) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'the end of your billing period'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
          className="relative w-full max-w-lg"
        >
          <Card className="bg-zinc-900 border-yellow-700">
            <CardHeader className="border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  Cancel Subscription?
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
              {/* Current Plan Info */}
              <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="text-sm text-zinc-400 mb-1">Current Plan</div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="font-semibold text-white text-lg">{tierDisplayName}</div>
                    <div className="text-sm text-zinc-400 capitalize">{billingCycle} billing</div>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${price.toFixed(2)}
                    <span className="text-sm text-zinc-500 font-normal">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <Alert className="bg-yellow-900/20 border-yellow-700">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  <div className="font-semibold mb-3">What Happens When You Cancel:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                      <span>You'll keep <strong>{tierDisplayName}</strong> features until <strong>{formatDate(periodEndDate)}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                      <span>No refund for the remaining time (standard policy)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                      <span>After {formatDate(periodEndDate)}, you'll be downgraded to <strong>Free</strong> tier</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                      <span>You can reactivate anytime before {formatDate(periodEndDate)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                      <span>No penalties or fees for canceling</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* What You'll Lose */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  Features You'll Lose After {formatDate(periodEndDate)}:
                </div>
                <div className="p-3 bg-red-900/10 border border-red-700/30 rounded-lg">
                  <div className="grid grid-cols-1 gap-2 text-sm text-zinc-300">
                    <div>• Limited to 5 game collections (from unlimited)</div>
                    <div>• Reduced to 2,000 chat tokens</div>
                    <div>• No game connections</div>
                    <div>• Basic AI assistance only</div>
                  </div>
                </div>
              </div>

              {/* Alternative Option */}
              <Alert className="bg-blue-900/20 border-blue-700">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300 text-sm">
                  <strong>Consider downgrading instead:</strong> Keep some premium features at a lower price. 
                  You can change your plan anytime from the Pricing page.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600"
                >
                  Keep My Subscription
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Yes, Cancel Subscription
                    </>
                  )}
                </Button>
              </div>

              {/* Fine Print */}
              <div className="text-xs text-zinc-500 text-center pt-2">
                You can reactivate your subscription anytime before {formatDate(periodEndDate)} 
                to keep your current plan.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CancelSubscriptionModal

