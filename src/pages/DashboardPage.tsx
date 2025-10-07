import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  MessageCircle, 
  Gamepad2, 
  TrendingUp, 
  Zap, 
  Users, 
  Brain,
  ChevronRight,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { usePageTitle } from '../hooks/usePageTitle'
import { Badge } from '../components/ui/badge'

const DashboardPage: React.FC = () => {
  usePageTitle('Dashboard')
  
  return (
    <div className="page-background text-primary">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Welcome to RAGAR
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Your AI-powered gaming companion for builds, strategies, and dominating the meta across all your favorite games.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Chatting
                </Button>
              </Link>
              <Link to="/games">
                <Button className="btn-light-themed px-6 py-3">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Browse Games
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/chat">
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-blue-400" />
                      </div>
                      <span>AI Gaming Chat</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                  </CardTitle>
                  <CardDescription>
                    Get instant help with builds, strategies, and gameplay tips from our AI gaming expert.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 text-sm text-zinc-400">
                    <div className="flex items-center space-x-1">
                      <Brain className="w-4 h-4" />
                      <span>7 Game Modes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span>Online</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/games">
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Gamepad2 className="w-5 h-5 text-purple-400" />
                      </div>
                      <span>Game Connections</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                  </CardTitle>
                  <CardDescription>
                    Connect your gaming accounts and customize AI responses for each game you play.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 text-sm text-zinc-400">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>3/7 Connected</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* RAGAR Neural-Net Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>RAGAR Neural-Net Status</span>
              </CardTitle>
              <CardDescription>
                Advanced AI gaming intelligence powered by machine learning across multiple game databases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">7/7</div>
                  <div className="text-sm text-zinc-400">Active Indexes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">147K+</div>
                  <div className="text-sm text-zinc-400">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">12</div>
                  <div className="text-sm text-zinc-400">Cron Jobs Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    <Activity className="w-6 h-6 mx-auto animate-pulse" />
                  </div>
                  <div className="text-sm text-zinc-400">Real-time Learning</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity / Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">Supported Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Destiny 2</span>
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Path of Exile</span>
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Diablo IV</span>
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">+ 4 more games</span>
                    <Link to="/games" className="text-blue-400 hover:text-blue-300 text-xs">
                      View All
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">AI Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Build Optimization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Meta Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Strategy Recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Cross-game Insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to="/chat">
                    <Button variant="outline" size="sm" className="w-full justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask RAGAR
                    </Button>
                  </Link>
                  <Link to="/games">
                    <Button variant="outline" size="sm" className="w-full justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Connect Game
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button variant="outline" size="sm" className="w-full justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Stats
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage 