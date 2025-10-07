import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Copy, ThumbsUp, ThumbsDown, Mic, MicOff, Paperclip, Image, Video } from 'lucide-react'
import { useQuery } from '@apollo/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '../components/ui/button'
import { usePageTitle } from '../hooks/usePageTitle'
import ChatSidebar from '../components/ChatSidebar'
import GameSelectionModal from '../components/GameSelectionModal'
import { GET_CURRENT_USER, GET_ALL_GAMES } from '../lib/apollo'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  gameContext?: string
}

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


const ChatPage: React.FC = () => {
  usePageTitle('Chat with RAGAR')
  
  // Fetch user data and games
  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER)
  const { data: allGamesData, loading: gamesLoading } = useQuery(GET_ALL_GAMES)
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [showGameSelectionModal, setShowGameSelectionModal] = useState(false)
  
  // Multi-modal input states
  const [isRecording, setIsRecording] = useState(false)
  const [showFileOptions, setShowFileOptions] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-expand textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const maxHeight = 200 // Maximum height in pixels (about 8-10 lines)
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('ragar-chat-sessions')
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats)
        setChatSessions(parsedChats)
      } catch (error) {
        console.error('Failed to load chat sessions:', error)
      }
    }
  }, [])

  // Save chat sessions to localStorage when they change
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('ragar-chat-sessions', JSON.stringify(chatSessions))
    }
  }, [chatSessions])

  // Adjust textarea height when input message changes
  useEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage])

  // Autosave messages whenever they change
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      localStorage.setItem(`ragar-chat-${activeChatId}`, JSON.stringify(messages))
      console.log(`💾 RAGAR: Autosaved ${messages.length} messages for chat ${activeChatId}`)
    }
  }, [messages, activeChatId])

  // Close file options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFileOptions && !(event.target as Element).closest('.file-options-container')) {
        setShowFileOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showFileOptions])

  // Initialize with welcome message when no active chat
  useEffect(() => {
    if (!activeChatId && messages.length === 0) {
      setMessages([{
        id: '1',
        content: `Welcome to RAGAR! I'm your AI gaming companion, ready to help you dominate any game. Ask me about builds, strategies, meta analysis, or anything gaming-related. What would you like to know?`,
        sender: 'assistant',
        timestamp: new Date(),
        gameContext: 'general'
      }])
    }
  }, [activeChatId, messages.length])

  // Sidebar handlers
  const handleNewChat = () => {
    setShowGameSelectionModal(true)
  }

  const handleGameSelection = (gameId: string, gameName: string) => {
    // Create new chat session
    const newChatId = `chat-${Date.now()}`
    const newChat: ChatSession = {
      id: newChatId,
      gameId: gameId,
      title: `${gameName} Chat`,
      lastMessage: '',
      updatedAt: new Date().toISOString(),
      isActive: true
    }

    // Add to chat sessions
    setChatSessions(prev => [newChat, ...prev])
    
    // Set as active chat
    setActiveChatId(newChatId)
    
    // Initialize with welcome message
    const game = allGamesData?.allGames?.find((g: DatabaseGame) => g.gameId === gameId)
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Welcome to your ${game?.name || gameName} chat! I'm RAGAR, your AI gaming companion specialized in ${game?.name || gameName}. Ask me about builds, strategies, meta analysis, or anything related to this game. How can I help you dominate?`,
      sender: 'assistant',
      timestamp: new Date(),
      gameContext: gameId
    }
    
    setMessages([welcomeMessage])
    setShowGameSelectionModal(false)
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
    
    // Load chat messages from localStorage
    const savedMessages = localStorage.getItem(`ragar-chat-${chatId}`)
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        if (parsedMessages && parsedMessages.length > 0) {
          setMessages(parsedMessages)
          console.log(`📖 RAGAR: Loaded ${parsedMessages.length} messages for chat ${chatId}`)
        } else {
          // Empty messages array, show welcome message
          loadWelcomeMessage(chatId)
        }
      } catch (error) {
        console.error('❌ RAGAR: Failed to load chat messages:', error)
        // Fallback to welcome message
        loadWelcomeMessage(chatId)
      }
    } else {
      // No saved messages, show welcome message
      loadWelcomeMessage(chatId)
    }
  }

  const loadWelcomeMessage = (chatId: string) => {
    const selectedChat = chatSessions.find(chat => chat.id === chatId)
    if (selectedChat) {
      const game = allGamesData?.allGames?.find((g: DatabaseGame) => g.gameId === selectedChat.gameId)
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Welcome back to your ${game?.name || 'Unknown Game'} chat! I'm RAGAR, ready to help you dominate this game. What would you like to know?`,
        sender: 'assistant',
        timestamp: new Date(),
        gameContext: selectedChat.gameId
      }
      setMessages([welcomeMessage])
    }
  }

  const handleSearchChats = (query: string) => {
    // TODO: Implement chat search functionality
    console.log('Searching chats for:', query)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Get current game context
    const currentChat = activeChatId ? chatSessions.find(chat => chat.id === activeChatId) : null
    const gameContext = currentChat?.gameId || 'general'
    const game = currentChat ? allGamesData?.allGames?.find((g: DatabaseGame) => g.gameId === currentChat.gameId) : null

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      gameContext: gameContext
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage('')
    setIsLoading(true)
    
    // Reset textarea height after clearing input
    setTimeout(adjustTextareaHeight, 0)

    // Save messages to localStorage
    if (activeChatId) {
      localStorage.setItem(`ragar-chat-${activeChatId}`, JSON.stringify(newMessages))
      
      // Update chat session with last message
      setChatSessions(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, lastMessage: inputMessage.slice(0, 50) + (inputMessage.length > 50 ? '...' : ''), updatedAt: new Date().toISOString() }
          : chat
      ))
    }

    try {
      // Simulate AI response for now - replace with actual GraphQL call later
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: game 
            ? `Great question about ${game.name}! I'm analyzing the best strategies for "${inputMessage}". Here's what I recommend based on current meta and community insights...

**Key Points:**
- Consider your current build and playstyle for ${game.name}
- Check the latest patch notes for any changes
- Optimize your gear/skill priorities
- Look into the current meta for ${game.name}

*This is a simulated response - full AI integration coming soon!*`
            : `Great question! I'm analyzing the best strategies for "${inputMessage}". Here's what I recommend based on current meta and community insights...

**Key Points:**
- Consider your current build and playstyle
- Check the latest patch notes for any changes
- Optimize your gear/skill priorities

*This is a simulated response - full AI integration coming soon!*`,
          sender: 'assistant',
          timestamp: new Date(),
          gameContext: gameContext
        }
        
        const finalMessages = [...newMessages, aiResponse]
        setMessages(finalMessages)
        setIsLoading(false)
        
        // Save updated messages to localStorage
        if (activeChatId) {
          localStorage.setItem(`ragar-chat-${activeChatId}`, JSON.stringify(finalMessages))
        }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
    // Adjust height after state update
    setTimeout(adjustTextareaHeight, 0)
  }

  // Copy message content to clipboard
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      console.log('✅ RAGAR: Message copied to clipboard')
      // TODO: Add toast notification for copy success
    } catch (error) {
      console.error('❌ RAGAR: Failed to copy message:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  // Handle like/dislike actions (placeholder for future implementation)
  const handleLikeMessage = (messageId: string) => {
    console.log('👍 RAGAR: Message liked:', messageId)
    // TODO: Implement like functionality
  }

  const handleDislikeMessage = (messageId: string) => {
    console.log('👎 RAGAR: Message disliked:', messageId)
    // TODO: Implement dislike functionality
  }

  // Voice dictation handlers
  const startDictation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        // TODO: Send audioBlob to speech-to-text service
        console.log('🎤 RAGAR: Audio recorded:', audioBlob)
        
        // For now, just add placeholder text
        setInputMessage(prev => prev + '[Voice input recorded - speech-to-text integration needed]')
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
      console.log('🎤 RAGAR: Started recording...')
    } catch (error) {
      console.error('❌ RAGAR: Failed to start recording:', error)
      alert('Microphone access denied or not available')
    }
  }

  const stopDictation = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
      console.log('🎤 RAGAR: Stopped recording')
    }
  }

  const toggleDictation = () => {
    if (isRecording) {
      stopDictation()
    } else {
      startDictation()
    }
  }

  // File upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
    setShowFileOptions(false)
    console.log('📎 RAGAR: Files attached:', files.map(f => f.name))
    
    // Add file names to input as placeholder
    const fileNames = files.map(f => `[File: ${f.name}]`).join(' ')
    setInputMessage(prev => prev + (prev ? ' ' : '') + fileNames)
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (event) => handleFileUpload(event as any)
    input.click()
  }

  const handleGameplayRecording = async () => {
    try {
      // Request screen capture with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      
      console.log('🎮 RAGAR: Started gameplay recording...')
      // TODO: Implement actual recording functionality
      // For now, just show a placeholder
      setInputMessage(prev => prev + (prev ? ' ' : '') + '[Gameplay recording started - implementation needed]')
      setShowFileOptions(false)
      
      // Stop the stream for now (in real implementation, this would be controlled by user)
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop())
        console.log('🎮 RAGAR: Gameplay recording stopped')
      }, 1000)
      
    } catch (error) {
      console.error('❌ RAGAR: Failed to start gameplay recording:', error)
      alert('Screen recording access denied or not available')
    }
  }

  const handleGeneralFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (event) => handleFileUpload(event as any)
    input.click()
  }

  // Chat management functions
  const handleRenameChat = (chatId: string) => {
    const chat = chatSessions.find(c => c.id === chatId)
    if (!chat) return

    const newTitle = prompt('Enter new chat name:', chat.title)
    if (newTitle && newTitle.trim() && newTitle !== chat.title) {
      setChatSessions(prev => prev.map(c => 
        c.id === chatId 
          ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() }
          : c
      ))
      console.log(`✏️ RAGAR: Renamed chat ${chatId} to "${newTitle.trim()}"`)
    }
  }

  const handleDeleteChat = (chatId: string) => {
    const chat = chatSessions.find(c => c.id === chatId)
    if (!chat) return

    if (confirm(`Are you sure you want to delete "${chat.title}"? This action cannot be undone.`)) {
      // Remove from chat sessions
      setChatSessions(prev => prev.filter(c => c.id !== chatId))
      
      // Remove messages from localStorage
      localStorage.removeItem(`ragar-chat-${chatId}`)
      
      // If this was the active chat, clear it
      if (activeChatId === chatId) {
        setActiveChatId(undefined)
        setMessages([])
      }
      
      console.log(`🗑️ RAGAR: Deleted chat ${chatId}`)
    }
  }

  // Get user's collected games
  const collectedGames: GameCollectionEntry[] = (userData?.me as any)?.collectedGames || []
  const allGames: DatabaseGame[] = allGamesData?.allGames || []

  // Show loading state
  if (userLoading || gamesLoading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-lg">Loading RAGAR...</div>
      </div>
    )
  }

  return (
    <div className="fixed top-14 left-0 right-0 bottom-0 bg-black text-white flex overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        collectedGames={collectedGames}
        allGames={allGames}
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onSearchChats={handleSearchChats}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 pb-0 bg-zinc-800">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-zinc-400">
                <div className="text-lg mb-2">Ready when you are.</div>
                <div className="text-sm">Start a new chat or select an existing one</div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 pb-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  {message.sender === 'user' ? (
                    // Incoming User Message - Black bubble for contrast
                    <div className="mb-6">
                      <div className="bg-black text-white text-sm font-medium p-3 rounded-lg inline-block max-w-fit">
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Outgoing AI Response - Information display style with markdown
                    <div className="mb-6">
                      <div className="text-zinc-100 py-2">
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Custom styling for markdown elements
                              h1: ({children}) => <h1 className="text-lg font-bold text-white mb-3">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-bold text-white mb-2">{children}</h3>,
                              p: ({children}) => <p className="text-zinc-100 mb-2 leading-relaxed">{children}</p>,
                              ul: ({children}) => <ul className="list-disc list-inside text-zinc-100 mb-2 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside text-zinc-100 mb-2 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="text-zinc-100">{children}</li>,
                              code: ({children}) => <code className="bg-zinc-700 text-zinc-100 px-1 py-0.5 rounded text-xs">{children}</code>,
                              pre: ({children}) => <pre className="bg-zinc-700 text-zinc-100 p-3 rounded-lg overflow-x-auto mb-2">{children}</pre>,
                              blockquote: ({children}) => <blockquote className="border-l-4 border-zinc-600 pl-4 text-zinc-300 italic mb-2">{children}</blockquote>,
                              strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                              em: ({children}) => <em className="italic text-zinc-200">{children}</em>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className="flex items-center space-x-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                        
                        <button
                          onClick={() => handleLikeMessage(message.id)}
                          className="flex items-center space-x-1 px-2 py-1 text-xs text-zinc-400 hover:text-green-400 hover:bg-zinc-700 rounded transition-colors"
                          title="Like this response"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => handleDislikeMessage(message.id)}
                          className="flex items-center space-x-1 px-2 py-1 text-xs text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
                          title="Dislike this response"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6"
                >
                  <div className="py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-zinc-400 text-sm">RAGAR is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Message Input at Bottom */}
        <div className="flex-shrink-0 border-t border-zinc-800 bg-black p-4">
          <div className="max-w-4xl mx-auto">
            {/* Attached Files Display */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-zinc-700 px-3 py-1 rounded-full text-xs">
                    <span className="text-zinc-300">{file.name}</span>
                    <button
                      onClick={() => removeAttachedFile(index)}
                      className="text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end space-x-2">
              {/* File Upload Button with Dropdown */}
              <div className="relative file-options-container">
                <button
                  onClick={() => setShowFileOptions(!showFileOptions)}
                  className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-md transition-colors"
                  title="Attach files"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                
                {/* File Options Dropdown */}
                {showFileOptions && (
                  <div className="absolute bottom-12 left-0 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-2 min-w-[180px] z-10">
                    <button
                      onClick={handleImageUpload}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors text-left"
                    >
                      <Image className="w-4 h-4 flex-shrink-0" />
                      <span>Upload Images</span>
                    </button>
                    <button
                      onClick={handleGameplayRecording}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors text-left"
                    >
                      <Video className="w-4 h-4 flex-shrink-0" />
                      <span>Record Gameplay</span>
                    </button>
                    <button
                      onClick={handleGeneralFileUpload}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors text-left"
                    >
                      <Paperclip className="w-4 h-4 flex-shrink-0" />
                      <span>All Files</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Voice Dictation Button */}
              <button
                onClick={toggleDictation}
                className={`h-10 w-10 flex items-center justify-center rounded-md transition-colors ${
                  isRecording 
                    ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about gaming..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[40px] max-h-[200px] overflow-y-auto"
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#4a5568 #2d3748'
                }}
              />

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 p-0 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {isRecording && (
              <div className="text-xs text-red-400 mt-1 text-center">
                • Recording...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Selection Modal */}
      <GameSelectionModal
        isOpen={showGameSelectionModal}
        onClose={() => setShowGameSelectionModal(false)}
        onSelectGame={handleGameSelection}
        collectedGames={collectedGames}
        allGames={allGames}
      />
    </div>
  )
}

export default ChatPage 