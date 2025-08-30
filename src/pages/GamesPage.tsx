import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { 
  Link, 
  Settings, 
  Check, 
  Plus, 
  Users, 
  Clock,
  Shield,
  Zap,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

import { 
  GET_CURRENT_USER, 
  UPDATE_PREFERRED_GAMES,
  GET_SUPPORTED_GAMES,
  GET_USER_PROVIDER_CONNECTIONS,
  type User
} from '../lib/apollo'

interface Game {
  id: string
  name: string
  shortName: string
  description: string
  longDescription: string
  icon: string
  backgroundGradient: string
  isConnected: boolean
  lastUpdated: string
  activeUsers: number
  aiFeatures: string[]
  connectionType: 'api' | 'preference' | 'manual'
  status: 'active' | 'beta' | 'coming-soon'
}

const games: Game[] = [
  {
    id: 'DESTINY2',
    name: 'Destiny 2',
    shortName: 'D2',
    description: 'Guardian builds, raids, PvP strategies',
    longDescription: 'Get optimized builds for all classes, raid strategies, PvP loadouts, and seasonal content guides.',
    icon: '🔫',
    backgroundGradient: 'from-orange-500 via-red-500 to-yellow-600',
    isConnected: false,
    lastUpdated: '2 hours ago',
    activeUsers: 15420,
    aiFeatures: ['Build Optimization', 'Raid Guides', 'PvP Meta', 'Exotic Recommendations'],
    connectionType: 'api',
    status: 'active'
  },
  {
    id: 'POE',
    name: 'Path of Exile',
    shortName: 'PoE',
    description: 'Build guides, currency tips, league mechanics',
    longDescription: 'Master the complex skill tree, learn efficient farming routes, and dominate the current league meta.',
    icon: '⚔️',
    backgroundGradient: 'from-red-600 via-orange-600 to-yellow-500',
    isConnected: true,
    lastUpdated: '1 hour ago',
    activeUsers: 23150,
    aiFeatures: ['Skill Tree Planning', 'Currency Farming', 'League Mechanics', 'Endgame Strategies'],
    connectionType: 'api',
    status: 'active'
  },
  {
    id: 'POE2',
    name: 'Path of Exile 2',
    shortName: 'PoE2',
    description: 'Early access guides and strategies',
    longDescription: 'Stay ahead in the early access with cutting-edge builds and mechanics analysis.',
    icon: '🗡️',
    backgroundGradient: 'from-red-700 via-purple-600 to-indigo-600',
    isConnected: false,
    lastUpdated: '30 minutes ago',
    activeUsers: 8750,
    aiFeatures: ['Early Access Builds', 'New Mechanics', 'Beta Strategies', 'Class Analysis'],
    connectionType: 'preference',
    status: 'beta'
  },
  {
    id: 'DIABLO4',
    name: 'Diablo IV',
    shortName: 'D4',
    description: 'Season guides, builds, dungeon strategies',
    longDescription: 'Conquer Sanctuary with optimized builds, seasonal strategies, and endgame content mastery.',
    icon: '👹',
    backgroundGradient: 'from-red-800 via-red-900 to-black',
    isConnected: true,
    lastUpdated: '45 minutes ago',
    activeUsers: 19200,
    aiFeatures: ['Seasonal Builds', 'Dungeon Optimization', 'Paragon Boards', 'Legendary Aspects'],
    connectionType: 'api',
    status: 'active'
  },
  {
    id: 'DIABLO2',
    name: 'Diablo II: Resurrected',
    shortName: 'D2R',
    description: 'Classic builds, runes, trading',
    longDescription: 'Master the timeless classic with optimized builds, runeword guides, and trading strategies.',
    icon: '🔥',
    backgroundGradient: 'from-red-600 via-orange-500 to-amber-600',
    isConnected: false,
    lastUpdated: '3 hours ago',
    activeUsers: 7820,
    aiFeatures: ['Classic Builds', 'Runeword Crafting', 'Magic Find Routes', 'Trading Values'],
    connectionType: 'manual',
    status: 'active'
  },
  {
    id: 'WOW',
    name: 'World of Warcraft',
    shortName: 'WoW',
    description: 'Raids, mythic+, class optimization',
    longDescription: 'Excel in raids, mythic+ dungeons, and PvP with data-driven class optimization and strategies.',
    icon: '🛡️',
    backgroundGradient: 'from-blue-600 via-purple-600 to-indigo-700',
    isConnected: false,
    lastUpdated: '1.5 hours ago',
    activeUsers: 28500,
    aiFeatures: ['Class Rotations', 'Raid Strategies', 'Mythic+ Routes', 'Gear Optimization'],
    connectionType: 'api',
    status: 'active'
  },
  {
    id: 'GENERAL',
    name: 'Gaming General',
    shortName: 'General',
    description: 'Cross-game advice and general gaming help',
    longDescription: 'Get insights that work across multiple games, general gaming advice, and cross-platform strategies.',
    icon: '🎮',
    backgroundGradient: 'from-purple-600 via-blue-600 to-cyan-500',
    isConnected: true,
    lastUpdated: 'Always active',
    activeUsers: 45000,
    aiFeatures: ['Cross-Game Insights', 'General Strategies', 'Platform Advice', 'Community Trends'],
    connectionType: 'preference',
    status: 'active'
  }
]

const GamesPage: React.FC = () => {

  const [activeView, setActiveView] = useState<'connections' | 'preferences'>('connections')

  
  // Fetch current user data
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER)
  
  // Fetch provider connections
  useQuery(GET_SUPPORTED_GAMES)
  const { data: providerConnectionsData } = useQuery(GET_USER_PROVIDER_CONNECTIONS)
  

  
  const [updatePreferredGames] = useMutation(UPDATE_PREFERRED_GAMES, {
    refetchQueries: [{ query: GET_CURRENT_USER }, { query: GET_USER_PROVIDER_CONNECTIONS }],
    onCompleted: () => {
      console.log('✅ RAGAR: Preferred games updated successfully')
    },
    onError: (error) => {
      console.error('❌ RAGAR: Failed to update preferred games:', error)
    }
  })

  // Get connected games based on user data
  const getConnectedGames = (): Set<string> => {
    if (!userData?.me) return new Set()
    
    const connectedGames = new Set<string>()
    
    // Add games from user preferences
    userData.me.preferredGames?.forEach((game: string) => {
      connectedGames.add(game)
    })
    
    // Add games from provider connections - need to map providers to games
    // For now, we'll map provider connections to legacy game IDs
    providerConnectionsData?.userProviderConnections?.forEach((connection: any) => {
      // Map provider IDs to game IDs for backward compatibility
      const gameIdMap: Record<string, string[]> = {
        'bungie': ['DESTINY2'],
        'grinding-gear-games': ['POE', 'POE2'],
        'blizzard': ['DIABLO4', 'DIABLO2', 'WOW'],
        'steam': [], // Platform providers don't map directly to specific games
        'xbox': [],
        'playstation': []
      }
      
      const gameIds = gameIdMap[connection.providerId] || []
      gameIds.forEach(gameId => connectedGames.add(gameId))
    })
    
    return connectedGames
  }

  // Get user gaming profile for a specific game
  const getUserGameProfile = (gameId: string) => {
    if (!userData?.me?.gamingProfiles) return null
    
    try {
      const profiles = typeof userData.me.gamingProfiles === 'string' 
        ? JSON.parse(userData.me.gamingProfiles) 
        : userData.me.gamingProfiles
      
      return profiles?.[gameId] || null
    } catch (error) {
      console.error('Error parsing gaming profiles:', error)
      return null
    }
  }

  const navigate = useNavigate()

  // Handle game connection/disconnection
  const handleConnect = async (game: Game) => {
    try {
      const connectedGames = getConnectedGames()
      const isCurrentlyConnected = connectedGames.has(game.id)
      
      if (isCurrentlyConnected) {
        // Disconnect game - remove from preferred games
        const newPreferredGames = userData.me.preferredGames.filter((g: string) => g !== game.id)
        
        await updatePreferredGames({
          variables: {
            gameIds: newPreferredGames
          }
        })
        
        console.log(`🎮 RAGAR: Disconnected from ${game.name}`)
      } else {
        // For API connections, navigate to dedicated authentication page
        if (game.connectionType === 'api') {
          console.log(`🎮 RAGAR: Redirecting to authentication page for ${game.name}`)
          navigate(`/auth/gaming/${game.id}`)
        } else {
          // For preference/manual connections, handle directly
          const newPreferredGames = [...(userData.me.preferredGames || []), game.id]
          
          await updatePreferredGames({
            variables: {
              gameIds: newPreferredGames
            }
          })
          
          console.log(`🎮 RAGAR: Connected to ${game.name}`)
        }
      }
    } catch (error) {
      console.error(`❌ RAGAR: Failed to toggle connection for ${game.name}:`, error)
    }
  }



  // Update games data with user connection status
  const getUpdatedGamesData = () => {
    const connectedGames = getConnectedGames()
    
    return games.map(game => ({
      ...game,
      isConnected: connectedGames.has(game.id),
      lastUpdated: getUserGameProfile(game.id)?.lastUpdated ? 
        new Date(getUserGameProfile(game.id)!.lastUpdated).toLocaleDateString() : 
        game.lastUpdated
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
      case 'beta':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Beta</Badge>
      case 'coming-soon':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Coming Soon</Badge>
      default:
        return null
    }
  }

  const getConnectionIcon = (game: Game) => {
    if (game.isConnected) {
      return <Check className="w-5 h-5 text-green-400" />
    }
    return <Plus className="w-5 h-5 text-zinc-400" />
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-lg">🔮 RAGAR: Loading your gaming profile...</span>
        </div>
      </div>
    )
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Failed to load user data</h2>
          <p className="text-zinc-400 mb-6">Please try refreshing the page or contact support.</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const updatedGames = getUpdatedGamesData()
  const connectedGames = getConnectedGames()
  const linkedGamesMap: Record<string, string> = (userData?.me?.linkedGames as Record<string, string>) || {}
  const user = userData?.me as User

  // Calculate total playtime from gaming profiles
  const getTotalPlaytime = () => {
    if (!user?.gamingProfiles) return 0
    
    try {
      const profiles = typeof user.gamingProfiles === 'string' 
        ? JSON.parse(user.gamingProfiles) 
        : user.gamingProfiles
      
      return Object.values(profiles).reduce((total: number, profile: any) => {
        return total + (profile?.playtimeHours || 0)
      }, 0)
    } catch (error) {
      return 0
    }
  }

  return (
    <div className="page-background text-primary">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span>Supported Games</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            {user?.firstName ? `Welcome back, ${user.firstName}! ` : ''}
            Connect your gaming accounts and personalize your RAGAR experience across all your favorite games.
          </p>
          {/* View Toggle */}
          <div className="mt-4 inline-flex rounded-md border border-zinc-700 overflow-hidden">
            <button
              className={`px-4 py-2 text-sm ${activeView === 'connections' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-400'}`}
              onClick={() => setActiveView('connections')}
            >
              Game Connections
            </button>
            <button
              className={`px-4 py-2 text-sm ${activeView === 'preferences' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-400'}`}
              onClick={() => setActiveView('preferences')}
            >
              Game Preferences
            </button>
          </div>
        </div>

        {/* User Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{games.length}</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Supported</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Connected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-400">
                  {connectedGames.size}
                </span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Playtime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-purple-400">
                  {getTotalPlaytime().toFixed(0)}h
                </span>
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">
                  {games.reduce((sum, game) => sum + game.activeUsers, 0).toLocaleString()}
                </span>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {updatedGames.map((game, index) => {
            const userProfile = getUserGameProfile(game.id)
            const linkedConnectionId = linkedGamesMap[game.id] // when client switches to UUIDs, this will align
            
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 overflow-hidden">
                  {/* Card Header with Gradient */}
                  <div className={`h-24 bg-gradient-to-r ${game.backgroundGradient} relative`}>
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <span className="text-2xl">{game.icon}</span>
                      <div>
                        <h3 className="font-bold text-white">{game.name}</h3>
                        <Badge className="text-xs">{game.shortName}</Badge>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(game.status)}
                    </div>
                    <div className="absolute bottom-3 right-3">
                      {activeView === 'connections' ? getConnectionIcon(game) : (
                        game.isConnected || linkedConnectionId ? <Check className="w-5 h-5 text-green-400" /> : <Plus className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardDescription className="text-zinc-400">
                      {game.description}
                    </CardDescription>
                    {userProfile && (
                      <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                        <div className="text-xs text-blue-400 space-y-1">
                          {userProfile.level && <div>Level: {userProfile.level}</div>}
                          {userProfile.playtimeHours && <div>Playtime: {userProfile.playtimeHours}h</div>}
                          {userProfile.completedContent?.length > 0 && (
                            <div>Completed: {userProfile.completedContent.length} items</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-400">{game.lastUpdated}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-400">{game.activeUsers.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* AI Features */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-zinc-300">AI Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {game.aiFeatures.map((feature) => (
                          <Badge 
                            key={feature} 
                            variant="outline" 
                            className="text-xs border-zinc-700 text-zinc-400"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      {activeView === 'connections' ? (
                        game.isConnected ? (
                          <>
                            <Button variant="outline" size="sm" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                              <Settings className="w-4 h-4 mr-2" />
                              Settings
                            </Button>
                            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => handleConnect(game)}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={() => handleConnect(game)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" size="sm" disabled={game.status === 'coming-soon'}>
                              <Plus className="w-4 h-4 mr-2" />
                              {game.connectionType === 'api' ? 'Connect' : 'Enable'}
                            </Button>
                          </>
                        )
                      ) : (
                        // Preferences view: toggle favorite (uses preferredGames for now); linkedGames shows connection id
                        <>
                          <Button variant="outline" size="sm" className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => handleConnect(game)}>
                            {connectedGames.has(game.id) || linkedConnectionId ? 'Unlink/Unfavorite' : 'Favorite/Link'}
                          </Button>
                          {linkedConnectionId && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Linked</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Connection Types Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Link className="w-4 h-4 text-blue-400" />
                <span>API Connection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">
                Direct integration with game APIs for real-time data, builds, and character information.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Preference Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">
                Customize AI responses based on your playstyle and preferences without account linking.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Manual Input</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">
                Get personalized advice by manually sharing your game information and goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  )
}

export default GamesPage 