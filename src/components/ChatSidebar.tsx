import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Library, 
  ChevronDown, 
  ChevronRight,
  MessageSquare,
  Gamepad2,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react'
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

interface ChatSession {
  id: string
  gameId: string
  title: string
  lastMessage?: string
  updatedAt: string
  isActive?: boolean
}

interface ChatSidebarProps {
  collectedGames: GameCollectionEntry[]
  allGames: DatabaseGame[]
  chatSessions: ChatSession[]
  activeChatId?: string
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onSearchChats: (query: string) => void
  onRenameChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
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
  return '🎮'
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  collectedGames,
  allGames,
  chatSessions,
  activeChatId,
  onNewChat,
  onSelectChat,
  onSearchChats,
  onRenameChat,
  onDeleteChat
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set())
  const [showChatOptions, setShowChatOptions] = useState<string | null>(null)

  // Get game details by gameId
  const getGameById = (gameId: string): DatabaseGame | undefined => {
    return allGames?.find((game: DatabaseGame) => game.gameId === gameId)
  }

  // Group chat sessions by game
  const chatsByGame = chatSessions.reduce((acc, chat) => {
    if (!acc[chat.gameId]) {
      acc[chat.gameId] = []
    }
    acc[chat.gameId].push(chat)
    return acc
  }, {} as Record<string, ChatSession[]>)

  // Toggle game section expansion
  const toggleGameExpansion = (gameId: string) => {
    const newExpanded = new Set(expandedGames)
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId)
    } else {
      newExpanded.add(gameId)
    }
    setExpandedGames(newExpanded)
  }

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChats(value)
  }

  // Close chat options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showChatOptions && !(event.target as Element).closest('.chat-options-container')) {
        setShowChatOptions(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showChatOptions])

  // Filter chats based on search query
  const filteredChatsByGame = Object.entries(chatsByGame).reduce((acc, [gameId, chats]) => {
    if (!searchQuery.trim()) {
      acc[gameId] = chats
    } else {
      const filtered = chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (filtered.length > 0) {
        acc[gameId] = filtered
      }
    }
    return acc
  }, {} as Record<string, ChatSession[]>)

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full overflow-visible">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-zinc-800">
        {/* New Chat Button */}
        <Button
          onClick={onNewChat}
          className="w-full mb-3 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 justify-start"
        >
          <Plus className="w-4 h-4 mr-2" />
          New chat
        </Button>

        {/* Search Chats */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search chats"
            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
          />
        </div>
      </div>

      {/* Library Section - Fixed */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center text-sm text-zinc-400 hover:text-white cursor-pointer">
          <Library className="w-4 h-4 mr-2" />
          Library
        </div>
      </div>

      {/* Game Sections - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-visible min-h-0">
        <div className="p-2">
          {collectedGames.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Gamepad2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No games in collection</p>
              <p className="text-xs mt-1">Add games to start chatting</p>
            </div>
          ) : (
            collectedGames.map((entry) => {
              const game = getGameById(entry.gameId)
              if (!game) return null

              const gameChats = filteredChatsByGame[entry.gameId] || []
              const isExpanded = expandedGames.has(entry.gameId)
              const hasChats = gameChats.length > 0

              return (
                <div key={entry.gameId} className="mb-2">
                  {/* Game Header */}
                  <button
                    onClick={() => toggleGameExpansion(entry.gameId)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 text-left group"
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span className="text-lg">{getGameIcon(game.name)}</span>
                      <span className="text-sm font-medium text-white truncate">
                        {game.shortName || game.name}
                      </span>
                      {hasChats && (
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {gameChats.length}
                        </span>
                      )}
                    </div>
                    {hasChats && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Chat Sessions */}
                  {isExpanded && hasChats && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 mt-1 space-y-1"
                    >
                      {gameChats.map((chat) => (
                        <div key={chat.id} className="relative group z-30" data-chat-id={chat.id}>
                          <button
                            onClick={() => onSelectChat(chat.id)}
                            className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                              activeChatId === chat.id
                                ? 'bg-blue-600 text-white'
                                : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1 pr-6">
                                <div className="truncate font-medium">
                                  {chat.title}
                                </div>
                                {chat.lastMessage && (
                                  <div className="truncate text-xs opacity-70 mt-0.5">
                                    {chat.lastMessage}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                          
                          {/* Chat Options Button */}
                          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 chat-options-container z-40">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowChatOptions(showChatOptions === chat.id ? null : chat.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-700 transition-all"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>
                            
                            {/* Options Dropdown */}
                            {showChatOptions === chat.id && (
                              <div className="absolute -right-2 top-6 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[120px] z-[100]"
                                   style={{ boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.3)' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onRenameChat(chat.id)
                                    setShowChatOptions(null)
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors text-left"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Rename</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteChat(chat.id)
                                    setShowChatOptions(null)
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-red-400 hover:bg-zinc-700 transition-colors text-left"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* No chats message */}
                  {isExpanded && !hasChats && (
                    <div className="ml-6 mt-1 text-xs text-zinc-500 p-2">
                      No chats yet. Start a new conversation!
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatSidebar
