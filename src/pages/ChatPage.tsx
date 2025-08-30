import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Gamepad2, Sparkles, Zap } from 'lucide-react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  gameContext?: string
}

interface GameMode {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

const gameModes: GameMode[] = [
  {
    id: 'DESTINY2',
    name: 'Destiny 2',
    description: 'Guardian builds, raids, PvP strategies',
    color: 'from-orange-500 to-yellow-600',
    icon: '🔫'
  },
  {
    id: 'POE',
    name: 'Path of Exile',
    description: 'Build guides, currency tips, league mechanics',
    color: 'from-red-600 to-orange-600',
    icon: '⚔️'
  },
  {
    id: 'POE2',
    name: 'Path of Exile 2',
    description: 'Early access guides and strategies',
    color: 'from-red-700 to-purple-600',
    icon: '🗡️'
  },
  {
    id: 'DIABLO4',
    name: 'Diablo IV',
    description: 'Season guides, builds, dungeon strategies',
    color: 'from-red-800 to-black',
    icon: '👹'
  },
  {
    id: 'DIABLO2',
    name: 'Diablo II',
    description: 'Classic builds, runes, trading',
    color: 'from-red-600 to-gray-800',
    icon: '🔥'
  },
  {
    id: 'WOW',
    name: 'World of Warcraft',
    description: 'Raids, mythic+, class optimization',
    color: 'from-blue-600 to-purple-600',
    icon: '🛡️'
  },
  {
    id: 'GENERAL',
    name: 'Gaming General',
    description: 'Cross-game advice and general gaming help',
    color: 'from-purple-600 to-blue-600',
    icon: '🎮'
  }
]

const ChatPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameMode>(gameModes[6]) // Default to GENERAL
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Welcome to RAGAR! I'm your AI gaming companion. I've selected **${selectedGame.name}** mode to help you with gaming strategies, builds, and tips. What would you like to know?`,
      sender: 'assistant',
      timestamp: new Date(),
      gameContext: selectedGame.id
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleGameModeChange = (game: GameMode) => {
    setSelectedGame(game)
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Switched to **${game.name}** mode! ${game.description}. How can I help you dominate this game?`,
      sender: 'assistant',
      timestamp: new Date(),
      gameContext: game.id
    }
    setMessages(prev => [...prev, welcomeMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      gameContext: selectedGame.id
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Simulate AI response for now - replace with actual GraphQL call later
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Great question about ${selectedGame.name}! I'm analyzing the best strategies for "${inputMessage}". Here's what I recommend based on current meta and community insights...

**Key Points:**
- Consider your current build and playstyle
- Check the latest patch notes for any changes
- Optimize your gear/skill priorities

*This is a simulated response - full AI integration coming soon!*`,
          sender: 'assistant',
          timestamp: new Date(),
          gameContext: selectedGame.id
        }
        setMessages(prev => [...prev, aiResponse])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="page-background text-primary">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Game Mode Selection */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <Gamepad2 className="w-6 h-6 text-blue-400" />
            <span>RAGAR Chat</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {gameModes.map((game) => (
              <motion.button
                key={game.id}
                onClick={() => handleGameModeChange(game)}
                className={`relative p-3 rounded-lg border transition-all duration-200 ${
                  selectedGame.id === game.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{game.icon}</div>
                  <div className="text-xs font-medium truncate">{game.name}</div>
                  {selectedGame.id === game.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          
          <div className="mt-3 text-sm text-zinc-400">
            <span className="font-medium text-white">Active Mode:</span> {selectedGame.name} - {selectedGame.description}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat */}
          <div className="lg:col-span-3">
            <Card className="bg-zinc-900 border-zinc-800 h-[600px] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex space-x-3 ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user'
                        ? 'bg-blue-600'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className={`max-w-[70%] ${
                      message.sender === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-100'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex space-x-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-zinc-800 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-zinc-800">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask me anything about ${selectedGame.name}...`}
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Quick Tips</span>
              </h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <div className="p-2 bg-zinc-800 rounded">
                  Try asking: "What's the best build for..."
                </div>
                <div className="p-2 bg-zinc-800 rounded">
                  Get current meta insights
                </div>
                <div className="p-2 bg-zinc-800 rounded">
                  Ask for patch note summaries
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <h3 className="font-semibold mb-3">Neural-Net Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Active Indexes:</span>
                  <span className="text-green-400">7/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Current Mode:</span>
                  <span className="text-blue-400">{selectedGame.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">AI Status:</span>
                  <span className="text-green-400">Online</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage 