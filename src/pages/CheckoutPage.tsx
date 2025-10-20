import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import {
  ArrowLeft,
  Lock,
  Shield,
  Check,
  CreditCard,
  AlertCircle,
  Info,
  Calendar,
  Zap
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import StripePaymentForm from '../components/StripePaymentForm'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  GET_CURRENT_SUBSCRIPTION,
  GET_USER_PAYMENT_METHODS,
  UPGRADE_SUBSCRIPTION
} from '../lib/apollo'

interface CheckoutState {
  tierName: string
  tierDisplayName: string
  billingCycle: 'monthly' | 'yearly'
  price: number
  features: string[]
  isPopular?: boolean
}

interface PaymentMethod {
  id: string
  type: string
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

const CheckoutPage: React.FC = () => {
  usePageTitle('Checkout')
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get checkout details from navigation state
  const checkoutState = location.state as CheckoutState | null
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  // GraphQL hooks
  const { data: currentSubData } = useQuery(GET_CURRENT_SUBSCRIPTION)
  const { data: paymentMethodsData, loading: paymentMethodsLoading } = useQuery(GET_USER_PAYMENT_METHODS)
  const [upgradeSubscription] = useMutation(UPGRADE_SUBSCRIPTION)

  const paymentMethods = paymentMethodsData?.userPaymentMethods || []
  const currentSubscription = currentSubData?.currentSubscription

  // Debug: Log payment methods
  useEffect(() => {
    console.log('💳 Payment Methods Data:', paymentMethodsData)
    console.log('💳 Payment Methods Count:', paymentMethods.length)
    if (paymentMethods.length > 0) {
      console.log('💳 Payment Methods:', paymentMethods)
    }
  }, [paymentMethodsData, paymentMethods])

  // Redirect if no checkout state
  useEffect(() => {
    if (!checkoutState) {
      navigate('/pricing')
    }
  }, [checkoutState, navigate])

  // Auto-select default payment method or show add payment form
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const defaultMethod = paymentMethods.find((pm: PaymentMethod) => pm.isDefault)
      setSelectedPaymentMethod(defaultMethod?.id || paymentMethods[0].id)
      setShowAddPayment(false)
    } else {
      setShowAddPayment(true)
    }
  }, [paymentMethods])

  if (!checkoutState) {
    return null
  }

  const { tierName, tierDisplayName, billingCycle, price, features } = checkoutState

  // Calculate pricing
  const isYearly = billingCycle === 'yearly'
  const monthlyPrice = isYearly ? price / 12 : price
  const totalPrice = isYearly ? price : price
  const billingPeriod = isYearly ? 'year' : 'month'
  const savingsAmount = isYearly ? (price / 0.8 - price) : 0 // 20% savings calculation

  const handleCompleteCheckout = async () => {
    if (!agreedToTerms) {
      setCheckoutError('Please agree to the terms and conditions to continue')
      return
    }

    if (!selectedPaymentMethod && !showAddPayment) {
      setCheckoutError('Please select a payment method')
      return
    }

    setIsProcessing(true)
    setCheckoutError(null)

    try {
      const result = await upgradeSubscription({
        variables: {
          input: {
            tierName: tierName,
            billingCycle: billingCycle,
            paymentMethodId: selectedPaymentMethod
          }
        }
      })

      if (result.data?.upgradeSubscription?.success) {
        setCheckoutSuccess(true)
        
        // Redirect to success page after brief delay
        setTimeout(() => {
          navigate('/settings', {
            state: {
              message: `Successfully subscribed to ${tierDisplayName}!`,
              showConfetti: true
            }
          })
        }, 2000)
      } else {
        setCheckoutError(
          result.data?.upgradeSubscription?.error || 
          'Failed to process subscription. Please try again.'
        )
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      setCheckoutError(error.message || 'An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStripeSuccess = async (paymentMethodId: string) => {
    setSelectedPaymentMethod(paymentMethodId)
    setShowAddPayment(false)
    // Automatically proceed with checkout after adding payment method
    if (agreedToTerms) {
      setTimeout(() => {
        handleCompleteCheckout()
      }, 500)
    }
  }

  const handleStripeError = (error: string) => {
    setCheckoutError(error)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/pricing')}
              className="text-zinc-400 hover:text-white"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Lock className="w-6 h-6 text-green-500" />
                Secure Checkout
              </h1>
              <p className="text-zinc-400 mt-1">Complete your subscription purchase</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Success Message */}
        {checkoutSuccess && (
          <Alert className="mb-6 bg-green-900/20 border-green-700">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-300">
              🎉 Subscription activated! Redirecting to your dashboard...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {checkoutError && !checkoutSuccess && (
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-300">{checkoutError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Payment & Checkout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Section */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethodsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Loading payment methods...</p>
                  </div>
                ) : paymentMethods.length > 0 && !showAddPayment ? (
                  <>
                    {/* Existing Payment Methods */}
                    <div className="space-y-3">
                      {paymentMethods.map((method: PaymentMethod) => (
                        <div
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`
                            p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-900/20'
                              : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center
                                ${selectedPaymentMethod === method.id
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-zinc-600'
                                }
                              `}>
                                {selectedPaymentMethod === method.id && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {method.brand?.toUpperCase() || 'Card'} •••• {method.last4}
                                </div>
                                <div className="text-sm text-zinc-400">
                                  Expires {method.expiryMonth}/{method.expiryYear}
                                </div>
                              </div>
                            </div>
                            {method.isDefault && (
                              <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add New Payment Method Button */}
                    <Button
                      variant="outline"
                      onClick={() => setShowAddPayment(true)}
                      className="w-full border-zinc-700 text-zinc-300 hover:text-white"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Use Different Card
                    </Button>
                  </>
                ) : (
                  /* Add Payment Method Form */
                  <div>
                    <StripePaymentForm
                      onSuccess={handleStripeSuccess}
                      onError={handleStripeError}
                      isLoading={isProcessing}
                    />
                    {paymentMethods.length > 0 && (
                      <Button
                        variant="ghost"
                        onClick={() => setShowAddPayment(false)}
                        className="w-full mt-4 text-zinc-400"
                      >
                        Use Saved Card Instead
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-zinc-300 cursor-pointer">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-blue-400 hover:text-blue-300">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-blue-400 hover:text-blue-300">
                      Privacy Policy
                    </a>
                    . I understand that I will be charged {isYearly ? 'annually' : 'monthly'} and can cancel anytime.
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              onClick={handleCompleteCheckout}
              disabled={isProcessing || !agreedToTerms || checkoutSuccess}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Payment...
                </div>
              ) : checkoutSuccess ? (
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Purchase Complete!
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Complete Secure Checkout
                </div>
              )}
            </Button>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Secured by Stripe</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-zinc-800 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Details */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-white font-semibold text-lg">{tierDisplayName}</div>
                      <div className="text-zinc-400 text-sm capitalize">{billingCycle} Billing</div>
                    </div>
                    {checkoutState.isPopular && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
                        POPULAR
                      </span>
                    )}
                  </div>

                  {/* Billing Details */}
                  <div className="pt-3 border-t border-zinc-800 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Price per {billingPeriod}</span>
                      <span className="text-white font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    {isYearly && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Monthly equivalent</span>
                          <span className="text-white">${monthlyPrice.toFixed(2)}/mo</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Annual savings
                          </span>
                          <span className="text-green-400 font-medium">
                            ${savingsAmount.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Total */}
                  <div className="pt-3 border-t border-zinc-800">
                    <div className="flex justify-between items-baseline">
                      <span className="text-white font-semibold text-lg">Total Due Today</span>
                      <span className="text-white font-bold text-2xl">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Renews {isYearly ? 'annually' : 'monthly'}
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="pt-3 border-t border-zinc-800">
                  <div className="text-sm font-semibold text-white mb-3">What's Included:</div>
                  <ul className="space-y-2">
                    {features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {features.length > 4 && (
                      <li className="text-sm text-zinc-500 ml-6">
                        + {features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Money-Back Guarantee */}
                <Alert className="bg-blue-900/20 border-blue-700">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300 text-sm">
                    30-day money-back guarantee. Cancel anytime, no questions asked.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Current Plan Info */}
            {currentSubscription && currentSubscription.tier !== 'free' && (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="text-sm text-zinc-400">
                    <div className="font-semibold text-white mb-2">Current Plan</div>
                    <div>{currentSubscription.displayName}</div>
                    <div className="text-xs text-zinc-500 mt-2">
                      Your new plan will replace your current subscription immediately.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

