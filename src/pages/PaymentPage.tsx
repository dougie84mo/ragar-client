import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from '@apollo/client'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, 
  CreditCard, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Download,
  Calendar,
  DollarSign,
  Shield
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { usePageTitle } from '../hooks/usePageTitle'
import StripePaymentForm from '../components/StripePaymentForm'

import { 
  GET_USER_PAYMENT_METHODS,
  GET_USER_BILLING_HISTORY,
  ADD_PAYMENT_METHOD,
  REMOVE_PAYMENT_METHOD,
  SET_DEFAULT_PAYMENT_METHOD,
  UPGRADE_SUBSCRIPTION
} from '../lib/apollo'

interface PaymentMethod {
  id: string
  type: string
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  createdAt: string
}

interface BillingHistoryItem {
  id: string
  type: string
  amount: number
  amountRefunded?: number
  currency: string
  status: string
  description: string
  invoiceUrl?: string
  paidAt?: string
  createdAt: string
  refunded?: boolean
  chargeId?: string
  reason?: string
  receiptNumber?: string
  paymentMethod?: string
  subscriptionId?: string
}

const PaymentPage: React.FC = () => {
  usePageTitle('Payment & Billing')
  const navigate = useNavigate()
  const location = useLocation()
  
  const [activeTab, setActiveTab] = useState<'methods' | 'history'>('methods')
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // GraphQL hooks
  const { data: paymentMethodsData, loading: paymentMethodsLoading, refetch: refetchPaymentMethods } = useQuery(GET_USER_PAYMENT_METHODS)
  const { data: billingHistoryData, loading: billingHistoryLoading, error: billingHistoryError } = useQuery(GET_USER_BILLING_HISTORY, {
    variables: { limit: 20 }
  })
  const [addPaymentMethod] = useMutation(ADD_PAYMENT_METHOD)
  const [removePaymentMethod] = useMutation(REMOVE_PAYMENT_METHOD)
  const [setDefaultPaymentMethod] = useMutation(SET_DEFAULT_PAYMENT_METHOD)
  const [upgradeSubscription] = useMutation(UPGRADE_SUBSCRIPTION)

  // Use real data from GraphQL queries
  const paymentMethods = paymentMethodsData?.userPaymentMethods || []
  const billingHistory = billingHistoryData?.userBillingHistory || []

  // Check if we're coming from pricing page with upgrade intent
  const upgradeState = location.state as { tier?: string; billingCycle?: string; clientSecret?: string } | null
  const [showSubscriptionConfirm, setShowSubscriptionConfirm] = useState(false)

  // Debug logging for billing history
  useEffect(() => {
    console.log('💳 Billing History Data:', billingHistoryData)
    console.log('💳 Billing History Count:', billingHistory.length)
    if (billingHistory.length > 0) {
      console.log('💳 Billing History Items:', billingHistory)
    }
  }, [billingHistoryData, billingHistory])

  const handleStripeSuccess = async (paymentMethodId: string) => {
    setIsAddingPayment(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      // First, add the payment method
      const pmResult = await addPaymentMethod({
        variables: {
          input: {
            paymentMethodId: paymentMethodId, // Real Stripe payment method ID
            setAsDefault: true // Always set as default for subscriptions
          }
        }
      })

      if (!pmResult.data?.addPaymentMethod?.success) {
        setActionError(pmResult.data?.addPaymentMethod?.error || 'Failed to add payment method')
        setIsAddingPayment(false)
        return
      }

      await refetchPaymentMethods()

      // If we're completing a subscription upgrade, process it now
      if (upgradeState?.tier && upgradeState?.billingCycle) {
        const upgradeResult = await upgradeSubscription({
          variables: {
            input: {
              tierName: upgradeState.tier,
              billingCycle: upgradeState.billingCycle,
              paymentMethodId: paymentMethodId
            }
          }
        })

        if (upgradeResult.data?.upgradeSubscription?.success) {
          setActionSuccess(`Successfully upgraded to ${upgradeState.tier}! Your subscription is now active.`)
          setShowSubscriptionConfirm(false)
          setShowAddPaymentForm(false)
          
          // Redirect back to settings after 3 seconds
          setTimeout(() => {
            navigate('/settings', { 
              state: { message: 'Subscription upgraded successfully!' }
            })
          }, 3000)
        } else {
          setActionError(upgradeResult.data?.upgradeSubscription?.error || 'Failed to complete subscription upgrade')
        }
      } else {
        // Just adding a payment method without subscription upgrade
        setActionSuccess('Payment method added successfully!')
        setShowAddPaymentForm(false)
      }
    } catch (error: any) {
      console.error('Payment processing error:', error)
      setActionError(error.message || 'An unexpected error occurred')
    } finally {
      setIsAddingPayment(false)
    }
  }

  const handleStripeError = (error: string) => {
    setActionError(error)
    setIsAddingPayment(false)
  }

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    setActionError(null)
    setActionSuccess(null)

    try {
      const result = await removePaymentMethod({
        variables: { paymentMethodId }
      })

      if (result.data?.removePaymentMethod) {
        setActionSuccess('Payment method removed successfully!')
        await refetchPaymentMethods()
      } else {
        setActionError('Failed to remove payment method')
      }
    } catch (error: any) {
      console.error('Remove payment method error:', error)
      setActionError(error.message || 'An unexpected error occurred')
    }
  }

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    setActionError(null)
    setActionSuccess(null)

    try {
      const result = await setDefaultPaymentMethod({
        variables: { paymentMethodId }
      })

      if (result.data?.setDefaultPaymentMethod) {
        setActionSuccess('Default payment method updated!')
        await refetchPaymentMethods()
      } else {
        setActionError('Failed to update default payment method')
      }
    } catch (error: any) {
      console.error('Set default payment method error:', error)
      setActionError(error.message || 'An unexpected error occurred')
    }
  }

  const formatCardBrand = (brand?: string) => {
    if (!brand) return 'Card'
    return brand.charAt(0).toUpperCase() + brand.slice(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const getStatusColor = (status: string, type?: string) => {
    if (type === 'refund') {
      switch (status.toLowerCase()) {
        case 'succeeded':
          return 'text-blue-400'
        case 'pending':
          return 'text-yellow-400'
        case 'failed':
          return 'text-red-400'
        default:
          return 'text-zinc-400'
      }
    }
    
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'failed':
        return 'text-red-400'
      case 'refunded':
        return 'text-blue-400'
      default:
        return 'text-zinc-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'refund':
        return '↩️'
      case 'invoice':
        return '📄'
      case 'charge':
        return '💳'
      default:
        return '💰'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'refund':
        return 'text-blue-400 bg-blue-900/20'
      case 'invoice':
        return 'text-green-400 bg-green-900/20'
      case 'charge':
        return 'text-purple-400 bg-purple-900/20'
      default:
        return 'text-zinc-400 bg-zinc-800/20'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
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
              <h1 className="text-3xl font-bold text-white">Payment & Billing</h1>
              <p className="text-zinc-400 mt-1">Manage your payment methods and billing history</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success/Error Alerts */}
        {actionSuccess && (
          <Alert className="mb-6 bg-green-900/20 border-green-700">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-300">{actionSuccess}</AlertDescription>
          </Alert>
        )}
        {actionError && (
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-300">{actionError}</AlertDescription>
          </Alert>
        )}

        {/* Subscription Upgrade Confirmation */}
        {showSubscriptionConfirm && upgradeState && (
          <Card className="mb-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Complete Your Subscription Upgrade
                  </h3>
                  <p className="text-zinc-300 mb-4">
                    You're upgrading to the <strong className="text-blue-400">
                      {upgradeState.tier?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </strong> plan ({upgradeState.billingCycle}). 
                    Add a payment method below to activate your subscription.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Your subscription will be activated immediately after adding payment</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-zinc-900 p-1 rounded-lg border border-zinc-800 w-fit">
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'methods'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2 inline" />
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2 inline" />
            Billing History
          </button>
        </div>

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            {/* Add Payment Method Card */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showAddPaymentForm ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-300 mb-2">
                        Add a credit card or debit card to your account
                      </p>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Shield className="w-4 h-4" />
                        Secured by Stripe - Your payment information is encrypted and secure
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowAddPaymentForm(true)}
                      disabled={isAddingPayment}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white">Add New Payment Method</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddPaymentForm(false)
                          setActionError(null)
                        }}
                        className="text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    <StripePaymentForm
                      onSuccess={handleStripeSuccess}
                      onError={handleStripeError}
                      isLoading={isAddingPayment}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Existing Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Your Payment Methods</h3>
              
              {paymentMethodsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-zinc-400">Loading payment methods...</p>
                </div>
              ) : paymentMethods.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No Payment Methods</h3>
                    <p className="text-zinc-400 text-sm">Add a payment method to manage your subscription</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {paymentMethods.map((method: PaymentMethod) => (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-zinc-800 rounded-lg">
                                <CreditCard className="w-6 h-6 text-zinc-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-white font-medium">
                                    {formatCardBrand(method.brand)} •••• {method.last4}
                                  </h4>
                                  {method.isDefault && (
                                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-zinc-400 text-sm">
                                  Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                                </p>
                                <p className="text-zinc-500 text-xs">
                                  Added {formatDate(method.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!method.isDefault && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemovePaymentMethod(method.id)}
                                className="border-red-700 text-red-400 hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Billing History</h3>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {billingHistoryError ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">Error Loading Billing History</h3>
                  <p className="text-zinc-400 text-sm mb-4">{billingHistoryError.message}</p>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : billingHistoryLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400">Loading billing history...</p>
              </div>
            ) : billingHistory.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No Billing History</h3>
                  <p className="text-zinc-400 text-sm">Your billing history will appear here once you make payments</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-zinc-800">
                        <tr>
                          <th className="text-left p-4 text-zinc-400 font-medium">Date</th>
                          <th className="text-left p-4 text-zinc-400 font-medium">Type</th>
                          <th className="text-left p-4 text-zinc-400 font-medium">Description</th>
                          <th className="text-left p-4 text-zinc-400 font-medium">Amount</th>
                          <th className="text-left p-4 text-zinc-400 font-medium">Status</th>
                          <th className="text-left p-4 text-zinc-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingHistory.map((item: BillingHistoryItem, index: number) => (
                          <tr key={item.id} className={index !== billingHistory.length - 1 ? 'border-b border-zinc-800' : ''}>
                            <td className="p-4 text-zinc-300">
                              {formatDate(item.paidAt || item.createdAt)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                                  {getTypeIcon(item.type)} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-white">{item.description}</div>
                              {item.reason && (
                                <div className="text-zinc-400 text-sm mt-1">
                                  Reason: {item.reason.replace(/_/g, ' ')}
                                </div>
                              )}
                              {item.amountRefunded && item.amountRefunded > 0 && (
                                <div className="text-blue-400 text-sm mt-1">
                                  Refunded: {formatCurrency(item.amountRefunded, item.currency)}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className={`font-medium ${item.amount < 0 ? 'text-blue-400' : 'text-white'}`}>
                                {item.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(item.amount), item.currency)}
                              </div>
                              {item.paymentMethod && (
                                <div className="text-zinc-400 text-sm mt-1">
                                  via {item.paymentMethod}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`capitalize ${getStatusColor(item.status, item.type)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {item.invoiceUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(item.invoiceUrl, '_blank')}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Invoice
                                  </Button>
                                )}
                                {item.receiptNumber && (
                                  <span className="text-zinc-400 text-xs">
                                    #{item.receiptNumber}
                                  </span>
                                )}
                                {!item.invoiceUrl && !item.receiptNumber && (
                                  <span className="text-zinc-500">-</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentPage
