import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Modal } from '../components/ui/modal'
import { Input } from '../components/ui/input'
import { GET_USER_PROVIDER_CONNECTIONS, GET_SUPPORTED_GAMES } from '../lib/apollo'
import { Plus, Link as LinkIcon, ExternalLink, Search, Trash2, RefreshCw, Activity } from 'lucide-react'

interface SupportedGameItem {
  id: string // slug
  name: string
  slug: string
  gameId?: string | null // canonical uuid
  provider: string
  description?: string
  iconUrl?: string
  connectionType: 'api' | 'preference' | 'manual'
  requiresOAuth: boolean
  scopes?: string[]
}

interface GameConnection {
  id: string
  gameId: string
  platform?: string
  userProfile?: any
  characters?: any[]
  connectedAt: string
  lastSync?: string
  isActive: boolean
  isTokenExpired: boolean
  displayName?: string
  gameSlug?: string
}

const GamesConnectionPage: React.FC = () => {
  const { data: supportedData } = useQuery(GET_SUPPORTED_GAMES)
  const { data: providerData, refetch: refetchConnections, loading: connectionsLoading } = useQuery(GET_USER_PROVIDER_CONNECTIONS)

  // Modal and connection state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<SupportedGameItem | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [deadlineAt, setDeadlineAt] = useState<number | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [completed, setCompleted] = useState(false)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  const supportedGames: SupportedGameItem[] = useMemo(() => supportedData?.supportedGames || [], [supportedData])
  const connections: GameConnection[] = useMemo(() => {
    // Convert provider connections to game connections for backward compatibility
    const providerConnections = providerData?.userProviderConnections || []
    const gameConnections: GameConnection[] = []
    
    providerConnections.forEach((connection: any) => {
      // Map provider connections to legacy game format
      const gameIdMap: Record<string, string[]> = {
        'bungie': ['DESTINY2'],
        'grinding-gear-games': ['POE', 'POE2'],
        'blizzard': ['DIABLO4', 'DIABLO2', 'WOW']
      }
      
      const gameIds = gameIdMap[connection.providerId] || []
      gameIds.forEach(gameId => {
        gameConnections.push({
          id: `${connection.id}-${gameId}`,
          gameId: gameId,
          platform: connection.providerName,
          userProfile: null,
          characters: [],
          connectedAt: connection.connectedAt,
          lastSync: connection.lastSuccessfulCall,
          isActive: connection.isActive,
          isTokenExpired: false,
          displayName: connection.providerDisplayName,
          gameSlug: gameId.toLowerCase()
        })
      })
    })
    
    return gameConnections
  }, [providerData])

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return supportedGames
    const query = searchQuery.toLowerCase()
    return supportedGames.filter(game => 
      game.name.toLowerCase().includes(query) ||
      game.slug.toLowerCase().includes(query) ||
      game.provider.toLowerCase().includes(query)
    )
  }, [supportedGames, searchQuery])

  // Enrich connections with supported game metadata for display
  const enrichedConnections = useMemo(() => {
    if (!connections) return []
    const idMap = new Map<string, SupportedGameItem>()
    const slugMap = new Map<string, SupportedGameItem>()
    
    supportedGames.forEach((game) => {
      if (game.gameId) idMap.set(game.gameId, game)
      if (game.slug) slugMap.set(game.slug, game)
    })
    
    return connections.map((conn) => {
      const byUuid = conn.gameId ? idMap.get(conn.gameId) : undefined
      const bySlug = conn.gameSlug ? slugMap.get(conn.gameSlug) : undefined
      const meta = byUuid || bySlug
      
      return {
        ...conn,
        displayName: meta?.name || conn.gameSlug || conn.gameId,
        displaySlug: meta?.slug || conn.gameSlug,
        gameInfo: meta
      }
    })
  }, [connections, supportedGames])

  // Check if a game already has a connection
  const hasExistingConnection = (gameId: string) => {
    return connections.some(conn => 
      conn.gameId === gameId || 
      conn.gameSlug === gameId ||
      conn.gameId === supportedGames.find(g => g.id === gameId)?.gameId
    )
  }

  const openCreateConnection = () => {
    if (isConnecting) return
    setSelectedGame(null)
    setStatusMessage('')
    setCompleted(false)
    setSearchQuery('')
    setShowSearchResults(false)
    setIsModalOpen(true)
  }

  const selectGame = (game: SupportedGameItem) => {
    if (isConnecting) return
    setSelectedGame(game)
    setSearchQuery(game.name)
    setShowSearchResults(false)
  }

  const clearSelection = () => {
    if (isConnecting) return
    setSelectedGame(null)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const cancelAuthentication = () => {
    if (!isConnecting) return
    
    // Reset all authentication state
    setIsConnecting(false)
    setDeadlineAt(null)
    setStatusMessage('Authentication cancelled by user')
    setCompleted(false)
    
    // Clear the selected game to allow reselection
    setSelectedGame(null)
    setSearchQuery('')
    setShowSearchResults(false)
    
    // The status message will show briefly, then user can try again
    setTimeout(() => {
      setStatusMessage('')
    }, 3000)
  }

  const startAuth = async () => {
    if (!selectedGame || isConnecting) return
    try {
      setIsConnecting(true)
      setCompleted(false)
      setStatusMessage('Initializing connection...')
      
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const token = localStorage.getItem('ragar-auth-token')
      
      const res = await fetch(`${backendUrl}/api/auth/gaming/${selectedGame.slug || selectedGame.id}/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({})
      })
      
      const data = await res.json()
      if (!data?.success || !data?.authUrl) {
        throw new Error(data?.error || 'Failed to initiate authentication')
      }
      
      // Open auth in new tab
      window.open(data.authUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes')
      setStatusMessage('Waiting for authorization in the new tab...')
      
      // Set 10 minute deadline
      setDeadlineAt(Date.now() + 10 * 60 * 1000)
      
    } catch (e: any) {
      setStatusMessage(e?.message || 'Failed to start authentication')
      setIsConnecting(false)
    }
  }

  // Poll for connection completion every 5 seconds while connecting
  useEffect(() => {
    if (!isConnecting || !deadlineAt || !selectedGame) return
    let cancelled = false
    const interval = setInterval(async () => {
      if (cancelled) return
      if (Date.now() >= deadlineAt) {
        setStatusMessage('Authorization timed out. Please try again.')
        setIsConnecting(false)
        clearInterval(interval)
        return
      }
      try {
        const refreshed = await refetchConnections()
        const current = refreshed?.data?.userProviderConnections || []
        const targetUuid = selectedGame.gameId
        const found = current.some((c: any) => (targetUuid && c.gameId === targetUuid))
        if (found) {
          setStatusMessage('Authorization complete! Click Close to finish.')
          setIsConnecting(false)
          setCompleted(true)
          clearInterval(interval)
        }
      } catch (e) {
        // ignore transient errors
      }
    }, 5000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [isConnecting, deadlineAt, selectedGame, refetchConnections])

  return (
    <div className="page-background text-primary">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Game Connections</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-secondary">Active Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{connections?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-secondary">Supported Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{supportedGames?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-secondary">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-secondary">{isConnecting ? 'Connecting…' : 'Idle'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Primary action under stats */}
        <div className="mb-8">
          <Button onClick={openCreateConnection} disabled={isConnecting}>
            <Plus className="w-4 h-4 mr-2" />
            Create a Connection
          </Button>
        </div>

        {/* Dynamic Connections Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {connectionsLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span className="text-secondary">Loading connections...</span>
            </div>
          ) : enrichedConnections.length > 0 ? (
            enrichedConnections.map((conn) => (
              <Card key={conn.id} className="bg-card border-border hover:border-border-hover transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                        {conn.displayName?.charAt(0) || '?'}
                      </div>
                      {conn.displayName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {conn.isTokenExpired && (
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
                          Token Expired
                        </Badge>
                      )}
                      <Badge className={conn.isActive ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' : 'bg-muted text-muted-foreground border-border'}>
                        {conn.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-secondary">
                    {conn.gameInfo?.provider && <span className="capitalize">{conn.gameInfo.provider}</span>}
                    {conn.displaySlug && <span> • {conn.displaySlug}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-secondary space-y-1">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Connected: {new Date(conn.connectedAt).toLocaleDateString()}
                      </div>
                      {conn.lastSync && (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Last Sync: {new Date(conn.lastSync).toLocaleDateString()}
                        </div>
                      )}
                      {conn.characters && conn.characters.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs">👥 {conn.characters.length} character{conn.characters.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        disabled={isConnecting}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Sync
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-500/30 hover:border-red-500/50"
                        disabled={isConnecting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-secondary mb-4">
                <LinkIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div>No game connections yet</div>
                <div className="text-sm">Connect your gaming accounts to get started</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Create Connection Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isConnecting && setIsModalOpen(false)} 
        size="lg" 
        variant="dark" 
        title="Connect Gaming Account"
      >
        <div className="space-y-6">
          {/* Auto-Search Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">
              Search and select a game to connect:
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search games (e.g., Destiny 2, Path of Exile)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchResults(e.target.value.trim().length > 0)
                  }}
                  onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)}
                  className="pl-10 bg-card-hover border-border text-primary placeholder-muted-foreground"
                  disabled={isConnecting}
                />
                {selectedGame && (
                  <button
                    onClick={clearSelection}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                    disabled={isConnecting}
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && filteredGames.length > 0 && !selectedGame && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border-border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                  {filteredGames.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => selectGame(game)}
                      disabled={isConnecting}
                      className="w-full p-3 text-left hover:bg-card-hover border-b border-border last:border-b-0 disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-primary">{game.name}</div>
                          <div className="text-xs text-secondary capitalize">
                            {game.provider} • {game.connectionType}
                            {game.requiresOAuth && " • OAuth"}
                          </div>
                        </div>
                        {hasExistingConnection(game.id) && (
                          <Badge variant="outline" className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 text-xs">
                            Connected
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Game Display */}
          {selectedGame && (
            <div className="p-4 bg-card-hover border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {selectedGame.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-primary">{selectedGame.name}</div>
                  <div className="text-sm text-secondary capitalize">
                    {selectedGame.provider} • {selectedGame.connectionType}
                    {selectedGame.requiresOAuth && " • OAuth Required"}
                  </div>
                  {selectedGame.description && (
                    <div className="text-xs text-muted-foreground mt-1">{selectedGame.description}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Replacement Warning */}
          {selectedGame && hasExistingConnection(selectedGame.id) && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <span className="text-sm">⚠️</span>
                <span className="text-sm">
                  An existing connection for this game was found. The new authorization will replace the existing connection.
                </span>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="text-sm text-blue-600 dark:text-blue-400">{statusMessage}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {supportedGames.length > 0 && `${supportedGames.length} games available`}
            </div>
            <div className="flex gap-3">
              {isConnecting ? (
                // During authentication: Show Cancel Auth button
                <Button 
                  variant="outline" 
                  onClick={cancelAuthentication}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-500/30 hover:border-red-500/50"
                >
                  Cancel Authentication
                </Button>
              ) : (
                // Normal state: Show Close/Cancel button
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  {completed ? 'Close' : 'Cancel'}
                </Button>
              )}
              
              {!completed && !isConnecting && (
                <Button 
                  onClick={startAuth} 
                  disabled={!selectedGame}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect in New Tab
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GamesConnectionPage


