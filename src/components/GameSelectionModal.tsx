import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Gamepad2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface GameCollectionEntry {
  gameId: string
  dateAdded: string
  personalNotes?: string
  userPromptName?: string
  isActive: boolean
  priority: number
}

interface DatabaseGame {
  id: string
  gameId: string
  slug: string
  name: string
  shortName?: string
  description?: string
  status: string
  franchise?: string
  genre?: string
  platforms: string[]
}

interface GameSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectGame: (gameId: string, gameName: string) => void
  collectedGames: GameCollectionEntry[]
  allGames: DatabaseGame[]
}

// Helper function to get game icon based on game name/slug
const getGameIcon = (gameName: string): string => {
  const name = gameName.toLowerCase()
  if (name.includes('destiny')) return '🔫'
  if (name.includes('path of exile')) return '⚔️'
  if (name.includes('diablo')) return '👹'
  if (name.includes('world of warcraft') || name.includes('wow')) return '🛡️'
  if (name.includes('overwatch')) return '🎯'
  if (name.includes('hearthstone')) return '🃏'
  if (name.includes('starcraft')) return '🚀'
  if (name.includes('call of duty') || name.includes('cod')) return '🎖️'
  if (name.includes('apex')) return '🎯'
  if (name.includes('fortnite')) return '🏗️'
  if (name.includes('valorant')) return '💥'
  if (name.includes('league of legends') || name.includes('lol')) return '⚡'
  return '🎮'
}

// Helper function to get game styling
const getGameStyling = (gameName: string) => {
  const name = gameName.toLowerCase()
  if (name.includes('destiny')) return 'from-orange-500 to-yellow-600'
  if (name.includes('path of exile')) return 'from-red-600 to-orange-600'
  if (name.includes('diablo')) return 'from-red-800 to-black'
  if (name.includes('world of warcraft') || name.includes('wow')) return 'from-blue-600 to-purple-600'
  if (name.includes('overwatch')) return 'from-orange-400 to-blue-500'
  if (name.includes('hearthstone')) return 'from-yellow-600 to-orange-500'
  return 'from-purple-600 to-blue-600'
}

const GameSelectionModal: React.FC<GameSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  collectedGames,
  allGames
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Get game details by gameId
  const getGameById = (gameId: string): DatabaseGame | undefined => {
    return allGames?.find((game: DatabaseGame) => game.gameId === gameId)
  }

  // Filter games based on search query
  const filteredGames = collectedGames.filter(entry => {
    if (!searchQuery.trim()) return true
    
    const game = getGameById(entry.gameId)
    if (!game) return false
    
    const query = searchQuery.toLowerCase()
    return (
      game.name.toLowerCase().includes(query) ||
      game.shortName?.toLowerCase().includes(query) ||
      game.slug.toLowerCase().includes(query) ||
      game.genre?.toLowerCase().includes(query)
    )
  })

  const handleGameSelect = (gameId: string) => {
    const game = getGameById(gameId)
    if (game) {
      onSelectGame(gameId, game.name)
      onClose()
      setSearchQuery('')
    }
  }

  const handleClose = () => {
    onClose()
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-semibold text-white">Start New Chat</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Choose a game from your collection to chat about
              </p>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your games..."
                className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
              />
            </div>
          </div>

          {/* Games List */}
          <div className="flex-1 overflow-y-auto p-6">
            {collectedGames.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">
                  No Games in Collection
                </h3>
                <p className="text-zinc-500 mb-6">
                  Add games to your collection first to start chatting about them.
                </p>
                <Button
                  onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Game Collection
                </Button>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">
                  No Games Found
                </h3>
                <p className="text-zinc-500">
                  Try adjusting your search terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredGames.map((entry) => {
                  const game = getGameById(entry.gameId)
                  if (!game) return null

                  return (
                    <motion.button
                      key={entry.gameId}
                      onClick={() => handleGameSelect(entry.gameId)}
                      className="group relative p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Game Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getGameStyling(game.name)} flex items-center justify-center text-xl`}>
                          {getGameIcon(game.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {game.shortName || game.name}
                          </h3>
                          <p className="text-xs text-zinc-400 truncate">
                            {game.genre || 'Gaming'}
                          </p>
                        </div>
                      </div>

                      {/* Game Details */}
                      {game.description && (
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
                          {game.description}
                        </p>
                      )}

                      {/* Personal Notes */}
                      {entry.personalNotes && (
                        <div className="mb-3">
                          <p className="text-xs text-zinc-400 mb-1">Your Notes:</p>
                          <p className="text-sm text-zinc-300 line-clamp-2">
                            {entry.personalNotes}
                          </p>
                        </div>
                      )}

                      {/* Chat Name */}
                      {entry.userPromptName && (
                        <div className="mb-3">
                          <p className="text-xs text-zinc-400 mb-1">Chat Name:</p>
                          <p className="text-sm text-blue-400">
                            {entry.userPromptName}
                          </p>
                        </div>
                      )}

                      {/* Priority Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {game.platforms && game.platforms.length > 0 && (
                            <span className="text-xs text-zinc-500">
                              {game.platforms.slice(0, 2).join(', ')}
                              {game.platforms.length > 2 && ' +more'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            entry.priority >= 4 ? 'bg-red-900/50 text-red-300' :
                            entry.priority >= 3 ? 'bg-yellow-900/50 text-yellow-300' :
                            'bg-green-900/50 text-green-300'
                          }`}>
                            Priority {entry.priority}
                          </span>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-200" />
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-800">
            <div className="flex justify-between items-center text-sm text-zinc-500">
              <span>
                {filteredGames.length} of {collectedGames.length} games
              </span>
              <Button
                onClick={handleClose}
                variant="ghost"
                className="text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default GameSelectionModal
