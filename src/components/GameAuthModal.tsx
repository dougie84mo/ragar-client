import React, { useState, useEffect } from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { Loader2, Shield, AlertCircle, ExternalLink } from 'lucide-react'
import { Badge } from './ui/badge'

interface GameAuthModalProps {
  isOpen: boolean
  onClose: () => void
  game: {
    id: string
    name: string
    shortName: string
    icon: string
    connectionType: 'api' | 'preference' | 'manual'
    backgroundGradient: string
  }
  onAuthSuccess: (authData: any) => void
  onAuthError: (error: string) => void
}

interface AuthState {
  status: 'idle' | 'loading' | 'iframe' | 'success' | 'error'
  authUrl?: string
  error?: string
  authData?: any
}

const GameAuthModal: React.FC<GameAuthModalProps> = ({
  isOpen,
  onClose,
  game,
  onAuthSuccess,
  onAuthError
}) => {
  const [authState, setAuthState] = useState<AuthState>({ status: 'idle' })
  const [iframeKey, setIframeKey] = useState(0) // For iframe refresh

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAuthState({ status: 'idle' })
      setIframeKey(prev => prev + 1)
    }
  }, [isOpen])

  // Listen for messages from iframe (for OAuth callback)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin for security
      const allowedOrigins = [
        'https://www.pathofexile.com',
        'https://www.bungie.net',
        'https://battle.net',
        import.meta.env.VITE_API_URL || 'http://localhost:4000'
      ]

      if (!allowedOrigins.includes(event.origin)) {
        return
      }

      if (event.data.type === 'GAME_AUTH_SUCCESS') {
        setAuthState({ status: 'success', authData: event.data.data })
        onAuthSuccess(event.data.data)
      } else if (event.data.type === 'GAME_AUTH_ERROR') {
        setAuthState({ status: 'error', error: event.data.error })
        onAuthError(event.data.error)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onAuthSuccess, onAuthError])

  const handleStartAuth = async () => {
    setAuthState({ status: 'loading' })

    try {
      // Call our backend to initiate OAuth flow
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/api/auth/gaming/${game.id}/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to initiate authentication')
      }

      const data = await response.json()
      
      if (data.authUrl) {
        setAuthState({ status: 'iframe', authUrl: data.authUrl })
      } else {
        throw new Error('No authentication URL received')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      setAuthState({ status: 'error', error: errorMessage })
      onAuthError(errorMessage)
    }
  }

  const handleExternalAuth = () => {
    if (authState.authUrl) {
      window.open(authState.authUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes')
    }
  }

  const getConnectionTypeInfo = (type: string) => {
    switch (type) {
      case 'api':
        return {
          title: 'API Integration',
          description: 'Secure OAuth connection for real-time data access',
          icon: <Shield className="w-4 h-4" />,
          color: 'bg-green-500/20 text-green-400 border-green-500/30'
        }
      case 'preference':
        return {
          title: 'Preference Mode',
          description: 'Set your playstyle preferences without account linking',
          icon: <Shield className="w-4 h-4" />,
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        }
      case 'manual':
        return {
          title: 'Manual Input',
          description: 'Manually share your game information and goals',
          icon: <Shield className="w-4 h-4" />,
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        }
      default:
        return {
          title: 'Connection',
          description: 'Connect to your gaming account',
          icon: <Shield className="w-4 h-4" />,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }
  }

  const connectionInfo = getConnectionTypeInfo(game.connectionType)

  const renderAuthContent = () => {
    switch (authState.status) {
      case 'idle':
        return (
          <div className="space-y-6">
            {/* Game Header */}
            <div className={`p-4 rounded-lg bg-gradient-to-r ${game.backgroundGradient} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative flex items-center space-x-3">
                <span className="text-2xl">{game.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-lg">{game.name}</h3>
                  <Badge className={connectionInfo.color}>
                    {connectionInfo.icon}
                    <span className="ml-1">{connectionInfo.title}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Connection Info */}
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-300">
                {connectionInfo.description}
              </p>
              
              {game.connectionType === 'api' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-800 dark:text-blue-200 font-medium">Secure Authentication</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        RAGAR uses OAuth to securely connect to your {game.name} account. We never store your login credentials.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button 
                onClick={handleStartAuth}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Shield className="w-4 h-4 mr-2" />
                Connect to {game.name}
              </Button>
            </div>
          </div>
        )

      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Initializing connection...</p>
            <p className="text-sm text-gray-500">Setting up secure authentication</p>
          </div>
        )

      case 'iframe':
        return (
          <div className="space-y-4">
            {/* Mobile fallback message */}
            <div className="md:hidden p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">Mobile Authentication</p>
                  <p className="text-yellow-700 dark:text-yellow-300 mb-2">
                    For the best experience on mobile, we recommend opening the authentication in a new tab.
                  </p>
                  <Button 
                    onClick={handleExternalAuth}
                    variant="outline" 
                    size="sm"
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>

            {/* Authentication iframe */}
            <div className="hidden md:block">
              <iframe
                key={iframeKey}
                src={authState.authUrl}
                className="w-full h-96 border border-gray-300 dark:border-gray-600 rounded-lg"
                title={`${game.name} Authentication`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Complete the authentication process above
              </p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-green-600">Successfully Connected!</h3>
            <p className="text-center text-gray-600 dark:text-gray-300">
              Your {game.name} account has been connected to RAGAR.
            </p>
            <Button onClick={onClose} className="mt-4">
              Continue
            </Button>
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-red-600">Connection Failed</h3>
            <p className="text-center text-gray-600 dark:text-gray-300">
              {authState.error || 'Unable to connect to your gaming account. Please try again.'}
            </p>
            <div className="flex space-x-3 mt-4">
              <Button 
                onClick={() => setAuthState({ status: 'idle' })}
                variant="outline"
              >
                Try Again
              </Button>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={authState.status === 'iframe' ? `Connect to ${game.name}` : ''}
      size={authState.status === 'iframe' ? 'xl' : 'lg'}
      variant="dark"
      showCloseButton={authState.status !== 'loading'}
    >
      {renderAuthContent()}
    </Modal>
  )
}

export default GameAuthModal 