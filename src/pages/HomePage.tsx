import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, ArrowRight, Play, Users, BarChart3, Shield, Trophy, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usePageTitle } from '../hooks/usePageTitle'

const HomePage: React.FC = () => {
  usePageTitle('Welcome to RAGAR')
  
  const gameLogos = [
    { name: 'Destiny 2', icon: '🚀', color: 'from-orange-500 to-red-500' },
    { name: 'Path of Exile', icon: '⚔️', color: 'from-yellow-500 to-orange-500' },
    { name: 'Diablo IV', icon: '🔥', color: 'from-red-600 to-red-800' },
    { name: 'World of Warcraft', icon: '🛡️', color: 'from-blue-500 to-blue-700' },
    { name: 'POE 2', icon: '⚡', color: 'from-purple-500 to-purple-700' },
    { name: 'Diablo II', icon: '💀', color: 'from-gray-600 to-gray-800' }
  ]

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      title: 'Neural Intelligence',
      description: 'Advanced AI that learns from millions of gaming scenarios and provides personalized insights for optimal gameplay.',
      gradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      title: 'Real-Time Analysis',
      description: 'Get instant build optimization, meta tracking, and strategy guides tailored to your playstyle.',
      gradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-600" />,
      title: 'Advanced Analytics',
      description: 'Stay ahead with comprehensive patch analysis, meta tracking, and predictive gaming trends.',
      gradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-orange-600" />,
      title: 'Cross-Game Learning',
      description: 'Unique pattern recognition across multiple games enhances your overall gaming intelligence.',
      gradient: 'from-orange-50 to-yellow-50',
      borderColor: 'border-orange-200'
    }
  ]

  const stats = [
    { label: 'Neural Indexes', value: '7', icon: <Brain className="w-5 h-5" /> },
    { label: 'Gaming Insights', value: '50K+', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Uptime', value: '99.9%', icon: <Shield className="w-5 h-5" /> },
    { label: 'Active Users', value: '10K+', icon: <Users className="w-5 h-5" /> }
  ]

  return (
    <div className="page-background">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30" />
        
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-6 gap-2">
              <Sparkles className="w-4 h-4" />
              Introducing RAGAR v2.0
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              Gaming Intelligence
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate neural-network powered gaming AI companion. Master multiple games with 
              personalized builds, strategies, and real-time optimization powered by advanced machine learning.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
          >
            <Button asChild size="lg" className="group">
              <Link to="/auth/register">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/demo">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          {/* Game Support Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="pb-4">
                <CardDescription className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Supporting 6 Major Gaming Titles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {gameLogos.map((game, index) => (
                    <motion.div
                      key={game.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Card className="group relative overflow-hidden cursor-pointer hover:shadow-md transition-all">
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        <CardContent className="relative text-center p-4">
                          <div className="text-2xl mb-2">{game.icon}</div>
                          <p className="text-xs font-medium text-gray-600">{game.name}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience gaming intelligence like never before with our advanced AI systems
              designed for the modern gamer.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`group relative overflow-hidden border ${feature.borderColor} hover:shadow-md transition-all h-full`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-50 transition-opacity`} />
                  <CardContent className="relative p-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg mb-3">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Gamers Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of players already using RAGAR to enhance their gaming experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-sm transition-all">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Level Up?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of gamers already using RAGAR to dominate their favorite games
              with AI-powered intelligence and optimization.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="group">
                <Link to="/auth/register">
                  <Trophy className="w-5 h-5 mr-2" />
                  Start Gaming Smarter
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800">
                <Link to="/auth/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">R</span>
                </div>
                <h3 className="font-semibold text-gray-900">RAGAR</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Neural-powered gaming intelligence for the modern gamer.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><Link to="/features" className="hover:text-gray-900 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><Link to="/api" className="hover:text-gray-900 transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><Link to="/docs" className="hover:text-gray-900 transition-colors">Documentation</Link></li>
                <li><Link to="/support" className="hover:text-gray-900 transition-colors">Help Center</Link></li>
                <li><Link to="/status" className="hover:text-gray-900 transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-gray-900 transition-colors">Terms</Link></li>
                <li><Link to="/security" className="hover:text-gray-900 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2024 RAGAR Neural Gaming AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage 