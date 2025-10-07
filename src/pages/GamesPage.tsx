import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { 
  Settings, 
  Check, 
  Plus, 
  Users, 
  Clock,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { usePageTitle } from '../hooks/usePageTitle'

import { 
  GET_CURRENT_USER, 
  GET_SUPPORTED_GAMES,
  GET_ALL_GAMES,
  GET_USER_PROVIDER_CONNECTIONS,
  ADD_TO_GAME_COLLECTION,
  UPDATE_GAME_COLLECTION_ENTRY,
  REMOVE_FROM_GAME_COLLECTION,
  type User
} from '../lib/apollo'

interface DatabaseGame {
  id: string
  gameId: string
  slug: string
  name: string
  shortName?: string
  description?: string
  status: string
  franchise?: string
  seriesNumber?: number
  genre?: string
  categoryIds: string[]
  gameCompanyProviderId?: string
  platformProviderIds: string[]
  developer?: string
  publisher?: string
  platforms: string[]
  releaseDate?: string
  officialSiteUrl?: string
  createdAt: string
  updatedAt: string
}

interface GameCollectionEntry {
  gameId: string
  dateAdded: string
  personalNotes?: string
  userPromptName?: string
  isActive: boolean
  priority: number
}


// Helper function to get game icon and styling based on game data
const getGameStyling = (game: DatabaseGame): { icon: string; backgroundGradient: string; aiFeatures: string[] } => {
  const gameStylingMap: Record<string, { icon: string; backgroundGradient: string; aiFeatures: string[] }> = {
    'destiny2': {
      icon: '🔫',
      backgroundGradient: 'from-orange-500 via-red-500 to-yellow-600',
      aiFeatures: ['Build Optimization', 'Raid Guides', 'PvP Meta', 'Exotic Recommendations']
    },
    'poe': {
      icon: '⚔️',
      backgroundGradient: 'from-red-600 via-orange-600 to-yellow-500',
      aiFeatures: ['Skill Tree Planning', 'Currency Farming', 'League Mechanics', 'Endgame Strategies']
    },
    'poe2': {
      icon: '🗡️',
      backgroundGradient: 'from-red-700 via-purple-600 to-indigo-600',
      aiFeatures: ['Early Access Builds', 'New Mechanics', 'Beta Strategies', 'Class Analysis']
    },
    'diablo4': {
      icon: '👹',
      backgroundGradient: 'from-red-800 via-red-900 to-black',
      aiFeatures: ['Seasonal Builds', 'Dungeon Optimization', 'Paragon Boards', 'Legendary Aspects']
    },
    'diablo2': {
      icon: '🔥',
      backgroundGradient: 'from-red-600 via-orange-500 to-amber-600',
      aiFeatures: ['Classic Builds', 'Runeword Crafting', 'Magic Find Routes', 'Trading Values']
    },
    'wow': {
      icon: '🛡️',
      backgroundGradient: 'from-blue-600 via-purple-600 to-indigo-700',
      aiFeatures: ['Class Rotations', 'Raid Strategies', 'Mythic+ Routes', 'Gear Optimization']
    },
    'minecraft': {
      icon: '🧱',
      backgroundGradient: 'from-green-600 via-emerald-600 to-teal-500',
      aiFeatures: ['Build Guides', 'Redstone Circuits', 'Survival Tips', 'Mod Recommendations']
    }
  }
  
  return gameStylingMap[game.slug.toLowerCase()] || {
    icon: '🎮',
    backgroundGradient: 'from-purple-600 via-blue-600 to-cyan-500',
    aiFeatures: ['General Gaming Tips', 'Strategy Guides', 'Community Insights']
  }
}

const GamesPage: React.FC = () => {
  usePageTitle('Game Collection')
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddGameModal, setShowAddGameModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<GameCollectionEntry | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch current user data
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER)
  
  // Fetch all games from database
  const { data: allGamesData, loading: gamesLoading, error: gamesError } = useQuery(GET_ALL_GAMES)
  
  // Fetch provider connections
  useQuery(GET_SUPPORTED_GAMES)
  useQuery(GET_USER_PROVIDER_CONNECTIONS)
  

  
  // Game Collection mutations
  const [addToCollection] = useMutation(ADD_TO_GAME_COLLECTION, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
    onCompleted: () => {
      console.log('✅ RAGAR: Game added to collection successfully')
    },
    onError: (error) => {
      console.error('❌ RAGAR: Failed to add game to collection:', error)
    }
  })

  const [updateCollectionEntry] = useMutation(UPDATE_GAME_COLLECTION_ENTRY, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
    onCompleted: () => {
      console.log('✅ RAGAR: Collection entry updated successfully')
    },
    onError: (error) => {
      console.error('❌ RAGAR: Failed to update collection entry:', error)
    }
  })

  const [removeFromCollection] = useMutation(REMOVE_FROM_GAME_COLLECTION, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
    onCompleted: () => {
      console.log('✅ RAGAR: Game removed from collection successfully')
    },
    onError: (error) => {
      console.error('❌ RAGAR: Failed to remove game from collection:', error)
    }
  })




  // Collection management functions
  const handleAddToCollection = async (gameId: string, metadata?: { personalNotes?: string; userPromptName?: string; priority?: number }) => {
    try {
      console.log('🎮 RAGAR: Adding game to collection:', { gameId, metadata })
      
      const result = await addToCollection({
        variables: {
          input: {
            gameId,
            personalNotes: metadata?.personalNotes || null,
            userPromptName: metadata?.userPromptName || null,
            priority: metadata?.priority || 1
          }
        }
      })
      
      console.log('✅ RAGAR: Game added to collection successfully:', result)
      setShowAddGameModal(false)
      setSearchQuery('')
    } catch (error: any) {
      console.error('❌ RAGAR: Failed to add game to collection:', error)
      
      // Show user-friendly error message
      const errorMessage = error?.graphQLErrors?.[0]?.message || error?.message || 'Failed to add game to collection'
      alert(`Error: ${errorMessage}`)
    }
  }

  const handleUpdateEntry = async (entry: GameCollectionEntry) => {
    try {
      await updateCollectionEntry({
        variables: {
          input: {
            gameId: entry.gameId,
            personalNotes: entry.personalNotes,
            userPromptName: entry.userPromptName,
            priority: entry.priority,
            isActive: entry.isActive
          }
        }
      })
      setShowEditModal(false)
      setEditingEntry(null)
    } catch (error) {
      console.error('❌ RAGAR: Failed to update collection entry:', error)
    }
  }

  const handleRemoveFromCollection = async (gameId: string) => {
    try {
      await removeFromCollection({
        variables: { gameId }
      })
    } catch (error) {
      console.error('❌ RAGAR: Failed to remove game from collection:', error)
    }
  }

  // Get games available to add to collection (not already in collection)
  const getAvailableGames = () => {
    if (!allGamesData?.allGames || !(userData?.me as any)?.collectedGames) return allGamesData?.allGames || []
    
    const collectedGameIds = (userData?.me as any)?.collectedGames.map((entry: GameCollectionEntry) => entry.gameId)
    return allGamesData.allGames.filter((game: DatabaseGame) => !collectedGameIds.includes(game.gameId))
  }

  // Get game details by gameId
  const getGameById = (gameId: string): DatabaseGame | undefined => {
    return allGamesData?.allGames?.find((game: DatabaseGame) => game.gameId === gameId)
  }






  if (userLoading || gamesLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-lg">🔮 RAGAR: Loading your gaming profile...</span>
        </div>
      </div>
    )
  }

  if (userError || gamesError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Failed to load data</h2>
          <p className="text-zinc-400 mb-6">
            {userError ? 'User data failed to load.' : 'Games data failed to load.'} 
            Please try refreshing the page or contact support.
          </p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Retry
          </Button>
        </div>
      </div>
    )
  }

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
              <Settings className="w-5 h-5" />
            </div>
            <span>My Game Collection</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            {user?.firstName ? `Welcome back, ${user.firstName}! ` : ''}
            Manage your personal game collection and customize AI interactions for each game.
          </p>
        </div>

        {/* User Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{allGamesData?.allGames?.length || 0}</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Supported</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Collection Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-400">
                  {(userData?.me as any)?.collectedGames?.length || 0}
                </span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Collected</Badge>
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
                  150K+
                </span>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add to Collection Section */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary">Game Collection</h2>
          <Button onClick={() => setShowAddGameModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add to Collection
          </Button>
        </div>

        {/* Collection Table */}
        {!(userData?.me as any)?.collectedGames || (userData?.me as any)?.collectedGames.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">Your Collection is Empty</h3>
            <p className="text-zinc-400 mb-6">
              Start building your game collection to get personalized AI recommendations.
            </p>
            <Button onClick={() => setShowAddGameModal(true)} className="bg-blue-600 hover:bg-blue-700">
              Add Your First Game
            </Button>
          </div>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Game
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prompt Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Connection
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(userData?.me as any)?.collectedGames
                      .filter((entry: GameCollectionEntry) => entry.isActive)
                      .map((entry: GameCollectionEntry) => {
                        const game = getGameById(entry.gameId)
                        const styling = game ? getGameStyling(game) : null
                        const linkedConnectionId = linkedGamesMap[entry.gameId]
                        
                        if (!game) return null // Skip if game not found
                        
                        return (
                          <tr key={entry.gameId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl mr-3">
                                  {styling?.icon || '🎮'}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-primary">{game.name}</div>
                                  <div className="text-sm text-secondary">{game.shortName || game.slug}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-primary">
                                {entry.userPromptName || (
                                  <span className="text-zinc-500 italic">Not set</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant="outline" 
                                className={`
                                  ${entry.priority === 5 ? 'border-red-500 text-red-400' : 
                                    entry.priority >= 4 ? 'border-orange-500 text-orange-400' :
                                    entry.priority >= 3 ? 'border-yellow-500 text-yellow-400' :
                                    entry.priority >= 2 ? 'border-blue-500 text-blue-400' :
                                    'border-gray-500 text-gray-400'}
                                `}
                              >
                                {entry.priority === 5 ? 'Critical' :
                                 entry.priority === 4 ? 'High' :
                                 entry.priority === 3 ? 'Medium' :
                                 entry.priority === 2 ? 'Low' : 'Minimal'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                              {new Date(entry.dateAdded).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {linkedConnectionId ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  Connected
                                </Badge>
                              ) : (
                                <span className="text-zinc-500 text-sm">Not connected</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingEntry(entry)
                                    setShowEditModal(true)
                                  }}
                                >
                                  ✏️ Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleRemoveFromCollection(entry.gameId)}
                                >
                                  🗑️ Remove
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Collection Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Personal Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">
                Add personal notes for each game to track your progress, goals, or strategies.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Chat Names</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">
                Set how you want RAGAR to address you in each game's chat for a personalized experience.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Priority Levels</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">
                Set priority levels to help RAGAR focus on the games you're most actively playing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Game Modal */}
        {showAddGameModal && (
          <AddGameModal 
            isOpen={showAddGameModal}
            onClose={() => {
              setShowAddGameModal(false)
              setSearchQuery('')
            }}
            onAdd={handleAddToCollection}
            availableGames={getAvailableGames()}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* Edit Entry Modal */}
        {showEditModal && editingEntry && (
          <EditEntryModal 
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setEditingEntry(null)
            }}
            onUpdate={handleUpdateEntry}
            entry={editingEntry}
            game={getGameById(editingEntry.gameId)}
          />
        )}
      </div>


    </div>
  )
}

// Add Game Modal Component
interface AddGameModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (gameId: string, metadata?: { personalNotes?: string; userPromptName?: string; priority?: number }) => void
  availableGames: DatabaseGame[]
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const AddGameModal: React.FC<AddGameModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  availableGames, 
  searchQuery, 
  setSearchQuery 
}) => {
  const [selectedGame, setSelectedGame] = useState<DatabaseGame | null>(null)
  const [showGameList, setShowGameList] = useState(false)
  const [personalNotes, setPersonalNotes] = useState('')
  const [userPromptName, setUserPromptName] = useState('')
  const [priority, setPriority] = useState(3)

  const filteredGames = availableGames.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGame) return

    onAdd(selectedGame.gameId, {
      personalNotes: personalNotes || undefined,
      userPromptName: userPromptName || undefined,
      priority
    })
    
    // Reset form
    setSelectedGame(null)
    setPersonalNotes('')
    setUserPromptName('')
    setPriority(3)
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">Add Game to Collection</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-primary font-medium px-3 py-1 rounded-md hover:bg-card-hover"
          >
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game Selection */}
          <div>
            <label className="text-primary font-medium mb-2 block">Select Game</label>
            <div className="relative">
              <input
                type="text"
                value={selectedGame ? selectedGame.name : searchQuery}
                onChange={(e) => {
                  if (!selectedGame) {
                    setSearchQuery(e.target.value)
                    setShowGameList(true)
                  }
                }}
                onFocus={() => !selectedGame && setShowGameList(true)}
                placeholder="Search for a game..."
                className="w-full border border-border rounded px-3 py-2 bg-input text-input"
                required
              />
              
              {selectedGame && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGame(null)
                    setSearchQuery('')
                    setShowGameList(true)
                  }}
                  className="absolute right-2 top-2 text-secondary hover:text-primary"
                >
                  ×
                </button>
              )}

              {showGameList && !selectedGame && filteredGames.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredGames.map(game => (
                    <div
                      key={game.gameId}
                      className="px-3 py-3 hover:bg-card-hover cursor-pointer text-primary border-b border-border last:border-b-0"
                      onClick={() => {
                        setSelectedGame(game)
                        setShowGameList(false)
                        setSearchQuery('')
                      }}
                    >
                      <div className="font-medium">{game.name}</div>
                      <div className="text-sm text-secondary">{game.shortName || game.slug}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="text-primary font-medium mb-2 block">Personal Notes (Optional)</label>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Track your progress, goals, or strategies..."
              className="w-full border border-border rounded px-3 py-2 h-20 bg-input text-input"
            />
          </div>

          {/* User Prompt Name */}
          <div>
            <label className="text-primary font-medium mb-2 block">Chat Name (Optional)</label>
            <input
              type="text"
              value={userPromptName}
              onChange={(e) => setUserPromptName(e.target.value)}
              placeholder="How should RAGAR address you in this game?"
              className="w-full border border-border rounded px-3 py-2 bg-input text-input"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-primary font-medium mb-2 block">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full border border-border rounded px-3 py-2 bg-input text-input"
            >
              <option value={1}>1 - Minimal</option>
              <option value={2}>2 - Low</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4 - High</option>
              <option value={5}>5 - Critical</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={!selectedGame}
              className="flex-1"
            >
              Add to Collection
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Entry Modal Component
interface EditEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (entry: GameCollectionEntry) => void
  entry: GameCollectionEntry
  game?: DatabaseGame
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpdate, 
  entry, 
  game 
}) => {
  const [personalNotes, setPersonalNotes] = useState(entry.personalNotes || '')
  const [userPromptName, setUserPromptName] = useState(entry.userPromptName || '')
  const [priority, setPriority] = useState(entry.priority)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onUpdate({
      ...entry,
      personalNotes: personalNotes || undefined,
      userPromptName: userPromptName || undefined,
      priority
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">Edit Collection Entry</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-primary font-medium px-3 py-1 rounded-md hover:bg-card-hover"
          >
            Cancel
          </button>
        </div>
        
        {/* Game Info */}
        {game && (
          <div className="mb-6 p-3 bg-card border border-border rounded">
            <div className="font-medium text-primary">{game.name}</div>
            <div className="text-sm text-secondary">{game.shortName || game.slug}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Notes */}
          <div>
            <label className="text-primary font-medium mb-2 block">Personal Notes</label>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Track your progress, goals, or strategies..."
              className="w-full border border-border rounded px-3 py-2 h-20 bg-input text-input"
            />
          </div>

          {/* User Prompt Name */}
          <div>
            <label className="text-primary font-medium mb-2 block">Chat Name</label>
            <input
              type="text"
              value={userPromptName}
              onChange={(e) => setUserPromptName(e.target.value)}
              placeholder="How should RAGAR address you in this game?"
              className="w-full border border-border rounded px-3 py-2 bg-input text-input"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-primary font-medium mb-2 block">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full border border-border rounded px-3 py-2 bg-input text-input"
            >
              <option value={1}>1 - Minimal</option>
              <option value={2}>2 - Low</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4 - High</option>
              <option value={5}>5 - Critical</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-border">
            <Button
              type="submit"
              className="flex-1"
            >
              Update Entry
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GamesPage 