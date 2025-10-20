import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { CreditCard, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface PaymentFormProps {
  onSuccess: (paymentMethodId: string) => void
  onError: (error: string) => void
  isLoading?: boolean
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess, onError, isLoading = false }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements || isLoading) {
      return
    }

    setIsProcessing(true)
    setCardError(null)
    
    const cardElement = elements.getElement(CardElement)
    
    if (!cardElement) {
      setCardError('Card element not found')
      setIsProcessing(false)
      return
    }

    try {
      // Create payment method with Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        setCardError(error.message || 'An error occurred while processing your card')
        onError(error.message || 'Payment method creation failed')
      } else if (paymentMethod) {
        // Success! Pass the real Stripe payment method ID to parent
        onSuccess(paymentMethod.id)
        setCardError(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setCardError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null)
    setCardComplete(event.complete)
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#9ca3af',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: '#10b981',
        iconColor: '#10b981',
      },
    },
    hidePostalCode: true, // We'll handle billing address separately if needed
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Input Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          <CreditCard className="inline w-4 h-4 mr-2" />
          Card Information
        </label>
        <div className={`
          p-4 border rounded-lg bg-zinc-800/50 transition-colors
          ${cardError ? 'border-red-500' : cardComplete ? 'border-green-500' : 'border-zinc-700'}
          ${cardError ? 'bg-red-950/20' : cardComplete ? 'bg-green-950/20' : ''}
        `}>
          <CardElement
            options={cardElementOptions}
            onChange={handleCardChange}
          />
        </div>
        
        {/* Card Error Display */}
        {cardError && (
          <Alert className="border-red-500 bg-red-950/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {cardError}
            </AlertDescription>
          </Alert>
        )}

        {/* Card Complete Indicator */}
        {cardComplete && !cardError && (
          <Alert className="border-green-500 bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Card information is complete and valid
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Security Notice */}
      <div className="text-xs text-zinc-400 bg-zinc-800/30 p-3 rounded-lg border border-zinc-700">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium">Secure Payment</span>
        </div>
        Your payment information is encrypted and processed securely by Stripe. 
        We never store your card details on our servers.
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !cardComplete || isProcessing || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </>
        )}
      </Button>

      {/* Test Card Info (Development Only) */}
      {import.meta.env.DEV && (
        <div className="text-xs text-zinc-500 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
          <div className="font-medium mb-2">Test Cards (Development Mode):</div>
          <div className="space-y-1">
            <div><strong>Success:</strong> 4242 4242 4242 4242</div>
            <div><strong>Declined:</strong> 4000 0000 0000 0002</div>
            <div><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</div>
            <div className="mt-2 text-zinc-600">Use any future expiry date and any 3-digit CVC</div>
          </div>
        </div>
      )}
    </form>
  )
}

// Main component that wraps PaymentForm with Stripe Elements provider
interface StripePaymentFormProps {
  onSuccess: (paymentMethodId: string) => void
  onError: (error: string) => void
  isLoading?: boolean
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ 
  onSuccess, 
  onError, 
  isLoading = false 
}) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        onSuccess={onSuccess} 
        onError={onError} 
        isLoading={isLoading}
      />
    </Elements>
  )
}

export default StripePaymentForm
