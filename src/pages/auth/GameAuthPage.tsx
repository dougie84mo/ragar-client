import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Alert } from '../../components/ui/alert'

// Game-specific authentication configurations
const GAME_AUTH_CONFIGS = {
  DESTINY2: {
    name: 'Destiny 2',
    platforms: [], // Bungie handles platform selection on their JoinUp page
    requiresPlatformSelection: false, // Bungie handles this
    description: 'Connect your Destiny 2 account to unlock powerful AI insights for your Guardian.',
    helpText: 'You\'ll be redirected to Bungie.net to select your gaming platform and authorize RAGAR.',
    flowType: 'bungie_redirect'
  },
  STEAM: {
    name: 'Steam',
    platforms: [],
    requiresPlatformSelection: false,
    description: 'Connect your Steam account to access your game library and achievements.',
    helpText: 'Sign in with your Steam account to connect your gaming profile.',
    flowType: 'standard_oauth'
  },
  BATTLENET: {
    name: 'Battle.net',
    platforms: [
      { id: 'wow', name: 'World of Warcraft', icon: '⚔️', color: '#0084FF' },
      { id: 'diablo4', name: 'Diablo IV', icon: '🔥', color: '#C41E3A' },
      { id: 'diablo2', name: 'Diablo II: Resurrected', icon: '💀', color: '#8B0000' },
      { id: 'overwatch2', name: 'Overwatch 2', icon: '🎯', color: '#FF6C00' }
    ],
    requiresPlatformSelection: true,
    description: 'Connect your Battle.net account for Blizzard games.',
    helpText: 'Select your primary Blizzard game to get started.',
    flowType: 'platform_selection'
  },
  POE: {
    name: 'Path of Exile',
    platforms: [],
    requiresPlatformSelection: false,
    description: 'Connect your Path of Exile account for build optimization and league insights.',
    helpText: 'Sign in with your Path of Exile account to access your characters and league data.',
    flowType: 'standard_oauth'
  }
}

interface AuthState {
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  authUrl?: string
}

const GameAuthPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [authState, setAuthState] = useState<AuthState>({ status: 'idle' })
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')

  // Handle OAuth callback if we have code/state params
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      setAuthState({
        status: 'error',
        message: `Authentication failed: ${error}`
      })
      return
    }

    if (code && state) {
      handleOAuthCallback(code, state)
    }
  }, [searchParams])

  const gameConfig = gameId ? GAME_AUTH_CONFIGS[gameId.toUpperCase() as keyof typeof GAME_AUTH_CONFIGS] : null

  if (!gameConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/90 border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-400">Game Not Found</CardTitle>
            <CardDescription className="text-gray-300">
              The requested game authentication is not supported.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/games')} className="w-full">
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleOAuthCallback = async (code: string, state: string) => {
    setAuthState({ status: 'loading', message: 'Processing authentication...' })

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/api/auth/gaming/${gameId}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: JSON.stringify({
          code,
          state,
          platform: selectedPlatform
        })
      })

      const result = await response.json()

      if (result.success) {
        setAuthState({
          status: 'success',
          message: `Successfully connected to ${gameConfig.name}!`
        })
        
        // Redirect back to games page after 2 seconds
        setTimeout(() => {
          navigate('/games?connected=' + gameId)
        }, 2000)
      } else {
        throw new Error(result.error || 'Authentication failed')
      }
    } catch (error) {
      setAuthState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Authentication failed'
      })
    }
  }

  const handleStartAuth = async () => {
    if (gameConfig.requiresPlatformSelection && !selectedPlatform) {
      setAuthState({
        status: 'error',
        message: 'Please select a platform first'
      })
      return
    }

    setAuthState({ 
      status: 'loading', 
      message: gameConfig.flowType === 'bungie_redirect' 
        ? 'Redirecting to Bungie.net...' 
        : 'Redirecting to authentication...' 
    })

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/api/auth/gaming/${gameId}/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          redirectUrl: window.location.href // Use current page as redirect
        })
      })

      const result = await response.json()

      if (result.success && result.authUrl) {
        console.log(`🎮 RAGAR: Starting ${gameConfig.name} authentication`)
        console.log(`🔗 Auth URL: ${result.authUrl}`)
        
        // For Bungie, this will redirect to their JoinUp page
        // which handles platform selection and then OAuth
        window.location.href = result.authUrl
      } else {
        throw new Error(result.error || 'Failed to initiate authentication')
      }
    } catch (error) {
      setAuthState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to start authentication'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-800/90 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">
            🎮 Connect to {gameConfig.name}
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            {gameConfig.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Platform Selection (if required) */}
          {gameConfig.requiresPlatformSelection && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white text-center">
                {gameConfig.helpText}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gameConfig.platforms.map((platform) => (
                  <Button
                    key={platform.id}
                    variant={selectedPlatform === platform.id ? "default" : "outline"}
                    className={`p-4 h-auto flex items-center justify-center space-x-3 transition-all ${
                      selectedPlatform === platform.id
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                    }`}
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="font-medium">{platform.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Authentication Status */}
          {authState.status !== 'idle' && (
            <Alert className={`${
              authState.status === 'error' ? 'border-red-500 bg-red-950/50' :
              authState.status === 'success' ? 'border-green-500 bg-green-950/50' :
              'border-blue-500 bg-blue-950/50'
            }`}>
              <div className={`${
                authState.status === 'error' ? 'text-red-300' :
                authState.status === 'success' ? 'text-green-300' :
                'text-blue-300'
              }`}>
                {authState.message}
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/games')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              ← Back to Games
            </Button>

            <Button
              onClick={handleStartAuth}
              disabled={
                authState.status === 'loading' || 
                (gameConfig.requiresPlatformSelection && !selectedPlatform)
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {authState.status === 'loading' ? (
                '🔄 Connecting...'
              ) : (
                `🚀 Connect to ${gameConfig.name}`
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-400 bg-gray-900/50 p-4 rounded-lg">
            <p>🔒 Your gaming credentials are securely handled through official {gameConfig.name} OAuth.</p>
            <p>RAGAR never stores your gaming passwords - only authorized API tokens.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GameAuthPage