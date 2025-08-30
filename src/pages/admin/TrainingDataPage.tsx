import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

interface TrainingDataset {
  id: string
  game: string
  name: string
  data_type: string
  category: string
  version: string
  size_bytes: number
  status: string
  created_at: string
  description: string
  tags: string[]
  download_count: number
  usage_count: number
}

interface TrainingPipeline {
  id: string
  name: string
  game: string
  pipeline_type: string
  status: string
  last_run?: string
  run_count: number
  success_count: number
  created_at: string
}

interface Analytics {
  datasets: {
    total: number
    by_game: Record<string, number>
    by_type: Record<string, number>
    by_category: Record<string, number>
  }
  pipelines: {
    total: number
    by_status: Record<string, number>
  }
  storage: {
    total_size_bytes: number
    total_size_mb: number
    total_files: number
    by_game: Record<string, any>
  }
  recent_activity: Array<{
    id: string
    action: string
    resource_type: string
    resource_name: string
    timestamp: string
    details: Record<string, any>
  }>
}

const TrainingDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datasets' | 'pipelines' | 'analytics' | 'games' | 'providers'>('datasets')
  const [datasets, setDatasets] = useState<TrainingDataset[]>([])
  const [pipelines, setPipelines] = useState<TrainingPipeline[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  
  // Games management state
  const [games, setGames] = useState<any[]>([])
  const [gameModalOpen, setGameModalOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<any>(null)
  
  // Game Providers management state
  const [providers, setProviders] = useState<any[]>([])
  const [providerConnections, setProviderConnections] = useState<any[]>([])
  const [providerModalOpen, setProviderModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<any>(null)
  
  // Filters
  const [selectedGame, setSelectedGame] = useState<string>('all')
  const [selectedDataType, setSelectedDataType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')


  const dataTypes = ['VISUAL', 'DATASET', 'CODE', 'DOCUMENTATION', 'MODEL', 'EMBEDDING', 'EVALUATION']
  const categories = ['auth', 'inventory', 'gameplay', 'character', 'ui', 'endgame', 'api', 'mechanics']
  const statuses = ['active', 'archived', 'processing']

  useEffect(() => {
    if (activeTab === 'datasets') {
      fetchDatasets()
    } else if (activeTab === 'pipelines') {
      fetchPipelines()
    } else if (activeTab === 'analytics') {
      fetchAnalytics()
    } else if (activeTab === 'games') {
      fetchGames()
    } else if (activeTab === 'providers') {
      fetchProviders()
      fetchProviderConnections()
    }
  }, [activeTab, selectedGame, selectedDataType, selectedCategory, selectedStatus])

  const fetchDatasets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedGame !== 'all') params.append('game', selectedGame)
      if (selectedDataType !== 'all') params.append('data_type', selectedDataType)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/training/datasets?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        }
      })
      
      const result = await response.json()
      if (result.success) {
        setDatasets(result.datasets)
      } else {
        console.error('Failed to fetch datasets:', result.error)
      }
    } catch (error) {
      console.error('Error fetching datasets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPipelines = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedGame !== 'all') params.append('game', selectedGame)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/training/pipelines?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        }
      })
      
      const result = await response.json()
      if (result.success) {
        setPipelines(result.pipelines)
      } else {
        console.error('Failed to fetch pipelines:', result.error)
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        }
      })
      
      const result = await response.json()
      if (result.success) {
        setAnalytics(result.analytics)
      } else {
        console.error('Failed to fetch analytics:', result.error)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGames = async () => {
    setLoading(true)
    try {
      // Use GraphQL to fetch supported games
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: JSON.stringify({
          query: `
            query {
              allGames {
                id
                gameId
                slug
                name
                shortName
                description
                status
                franchise
                seriesNumber
                gameCompanyProviderId
                platformProviderIds
                developer
                publisher
                platforms
                releaseDate
                officialSiteUrl
                createdAt
                updatedAt
              }
            }
          `
        })
      })
      
      const result = await response.json()
      if (result.data?.allGames) {
        setGames(result.data.allGames)
      } else {
        console.error('Failed to fetch games:', result.errors)
      }
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }



  const fetchProviders = async () => {
    setLoading(true)
    try {
      // Use GraphQL to fetch game providers
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: JSON.stringify({
          query: `
            query {
              gameProviders {
                id
                providerId
                name
                slug
                displayName
                providerType
                companyName
                websiteUrl
                connectionType
                isActive
                requiresApproval
                supportedPlatforms
                regions
                description
                logoUrl
                iconUrl
                testStatus
                lastTested
                createdAt
                updatedAt
              }
            }
          `
        })
      })
      
      const result = await response.json()
      if (result.data?.gameProviders) {
        setProviders(result.data.gameProviders)
      } else {
        console.error('Failed to fetch providers:', result.errors)
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviderConnections = async () => {
    try {
      // Use GraphQL to fetch provider connections
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: JSON.stringify({
          query: `
            query {
              providerConnections {
                id
                providerId
                connectionName
                connectionType
                isActive
                lastSuccessfulCall
                lastError
                errorCount
                requestsToday
                dailyLimit
                environment
                createdAt
                updatedAt
              }
            }
          `
        })
      })
      
      const result = await response.json()
      if (result.data?.providerConnections) {
        setProviderConnections(result.data.providerConnections)
      }
    } catch (error) {
      console.error('Error fetching provider connections:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'archived': 'bg-gray-100 text-gray-800',
      'processing': 'bg-blue-100 text-blue-800',
      'running': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'draft': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="page-background">
      <div className="container mx-auto p-6 admin-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">🎮 Training Data Management</h1>
        <p className="text-secondary mt-2">Manage AI training datasets and pipelines across all supported games</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('datasets')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'datasets'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📊 Datasets
        </button>
        <button
          onClick={() => setActiveTab('pipelines')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'pipelines'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ⚙️ Pipelines
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📈 Analytics
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'games'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🎮 Games
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-6 py-3 font-medium text-sm border-b-2 ${
            activeTab === 'providers'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🏢 Game Providers
        </button>
      </div>

      {/* Datasets Tab */}
      {activeTab === 'datasets' && (
        <>
          {/* Filters & Actions */}
          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <select 
                value={selectedGame} 
                onChange={(e) => setSelectedGame(e.target.value)}
                className="border border-theme rounded px-3 py-2 bg-card text-input min-w-[150px]"
              >
                <option value="all">All Games</option>
                {games.filter(game => game && game.id).map(game => (
                  <option key={game.id} value={game.slug?.toUpperCase() || game.name?.toUpperCase()}>
                    {game.name} ({game.slug?.toUpperCase()})
                  </option>
                ))}
              </select>

              <select 
                value={selectedDataType} 
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="border border-theme rounded px-3 py-2 bg-card text-input min-w-[150px]"
              >
                <option value="all">All Types</option>
                {dataTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-theme rounded px-3 py-2 bg-card text-input min-w-[150px]"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-theme rounded px-3 py-2 bg-card text-input min-w-[150px]"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => setUploadModalOpen(true)}>
                📁 Upload Dataset
              </Button>
              <Button variant="outline">
                🔄 Refresh
              </Button>
            </div>
          </div>

          {/* Datasets Grid */}
          {loading ? (
            <div className="text-center py-8">Loading datasets...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map((dataset) => (
                <Card key={dataset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{dataset.name}</CardTitle>
                      <Badge className={getStatusColor(dataset.status)}>
                        {dataset.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {dataset.game} • {dataset.category} • v{dataset.version}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">{dataset.description}</p>
                      
                      <div className="flex justify-between text-sm">
                        <span>Type:</span>
                        <Badge variant="outline">{dataset.data_type}</Badge>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Size:</span>
                        <span>{formatFileSize(dataset.size_bytes)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Usage:</span>
                        <span>{dataset.usage_count} times</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>{formatDate(dataset.created_at)}</span>
                      </div>

                      {dataset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dataset.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          👁️ View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          ✏️ Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          🗑️ Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {datasets.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No datasets found. Upload your first dataset to get started!
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pipelines Tab */}
      {activeTab === 'pipelines' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <select 
                value={selectedGame} 
                onChange={(e) => setSelectedGame(e.target.value)}
                className="border border-theme rounded px-3 py-2 bg-card text-input min-w-[150px]"
              >
                <option value="all">All Games</option>
                {games.filter(game => game && game.id).map(game => (
                  <option key={game.id} value={game.slug?.toUpperCase() || game.name?.toUpperCase()}>
                    {game.name} ({game.slug?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            
            <Button>
              ➕ New Pipeline
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading pipelines...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pipelines.map((pipeline) => (
                <Card key={pipeline.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                      <Badge className={getStatusColor(pipeline.status)}>
                        {pipeline.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {pipeline.game} • {pipeline.pipeline_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Runs:</span>
                        <span>{pipeline.run_count} total</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span>
                          {pipeline.run_count > 0 
                            ? `${Math.round((pipeline.success_count / pipeline.run_count) * 100)}%`
                            : 'N/A'
                          }
                        </span>
                      </div>
                      
                      {pipeline.last_run && (
                        <div className="flex justify-between text-sm">
                          <span>Last Run:</span>
                          <span>{formatDate(pipeline.last_run)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>{formatDate(pipeline.created_at)}</span>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          ▶️ Run
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          ⚙️ Configure
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          📊 Logs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pipelines.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No pipelines found. Create your first pipeline to get started!
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          {loading ? (
            <div className="text-center py-8">Loading analytics...</div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-blue-600">{analytics.datasets.total}</div>
                    <div className="text-sm text-gray-600">Total Datasets</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-green-600">{analytics.pipelines.total}</div>
                    <div className="text-sm text-gray-600">Total Pipelines</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-purple-600">{analytics.storage.total_files}</div>
                    <div className="text-sm text-gray-600">Total Files</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-orange-600">{analytics.storage.total_size_mb} MB</div>
                    <div className="text-sm text-gray-600">Storage Used</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Datasets by Game</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(analytics.datasets.by_game).map(([game, count]) => (
                        <div key={game} className="flex justify-between">
                          <span>{game}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Datasets by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(analytics.datasets.by_type).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span>{type}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recent_activity.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-semibold">{activity.action}</span>
                          <span className="text-gray-600 ml-2">{activity.resource_type}</span>
                          {activity.resource_name && (
                            <span className="text-gray-800 ml-1">"{activity.resource_name}"</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Unable to load analytics data.
            </div>
          )}
        </>
      )}

      {/* Games Management Tab */}
      {activeTab === 'games' && (
        <>
          <div className="space-y-6">
            {/* Games Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">{games.length}</div>
                  <div className="text-sm text-gray-600">Supported Games</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">
                    {games.filter(g => g && g.gameCompanyProviderId).length}
                  </div>
                  <div className="text-sm text-gray-600">Have Game Company</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {games.filter(g => g && g.status === 'released').length}
                  </div>
                  <div className="text-sm text-gray-600">Released</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-purple-600">
                    {games.filter(g => g && g.platformProviderIds && g.platformProviderIds.length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Multi-Platform Games</div>
                </CardContent>
              </Card>
            </div>

            {/* Games Management Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary">Game Configuration</h2>
              <Button onClick={() => setGameModalOpen(true)}>
                ➕ Add New Game
              </Button>
            </div>

            {/* Games Table */}
            {loading ? (
              <div className="text-center py-8">Loading games...</div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Game
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Game Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Platforms
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {games.filter(game => game && game.id).map((game) => {
                          // Add safety checks for game properties
                          if (!game || !game.id) return null;
                          
                          return (
                            <tr key={game.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm mr-3">
                                    {game.name?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-primary">{game.name || 'Unknown Game'}</div>
                                    <div className="text-sm text-secondary">{game.slug || 'no-slug'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline" className="capitalize">
                                  {game.gameCompanyProviderId || 'None'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline" className="capitalize">
                                  {game.status || 'unknown'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {game.platformProviderIds && game.platformProviderIds.length > 0 ? (
                                    game.platformProviderIds.map((platform: string, index: number) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {platform}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-sm">No platforms</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingGame(game)
                                      setGameModalOpen(true)
                                    }}
                                  >
                                    ✏️ Edit
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
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
                    
                    {games.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No games configured. Add your first game to get started!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Provider Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Game Provider Analytics</CardTitle>
                <CardDescription>Overview of game companies and platform coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-primary mb-2">Game Companies</h4>
                    <div className="space-y-1 text-sm">
                      {games.filter(game => game && game.gameCompanyProviderId).slice(0, 5).map(game => (
                        <div key={game.id} className="flex justify-between">
                          <span>{game.name}:</span>
                          <span className="font-semibold text-blue-600">{game.gameCompanyProviderId}</span>
                        </div>
                      ))}
                      {games.filter(game => game && game.gameCompanyProviderId).length === 0 && (
                        <div className="text-gray-400">No game companies assigned</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-primary mb-2">Platform Coverage</h4>
                    <div className="space-y-1 text-sm">
                      {games.filter(game => game && game.platformProviderIds && game.platformProviderIds.length > 0).slice(0, 5).map(game => (
                        <div key={game.id} className="flex justify-between">
                          <span>{game.name}:</span>
                          <span className="font-semibold">{game.platformProviderIds.length} platforms</span>
                        </div>
                      ))}
                      {games.filter(game => game && game.platformProviderIds && game.platformProviderIds.length > 0).length === 0 && (
                        <div className="text-gray-400">No platform assignments</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-primary mb-2">Game Status</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Released:</span>
                        <span className="font-semibold text-green-600">
                          {games.filter(g => g && g.status === 'released').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Beta:</span>
                        <span className="font-semibold text-yellow-600">
                          {games.filter(g => g && g.status === 'beta').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alpha:</span>
                        <span className="font-semibold text-orange-600">
                          {games.filter(g => g && g.status === 'alpha').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Game Providers Management Tab */}
      {activeTab === 'providers' && (
        <>
          <div className="space-y-6">
            {/* Providers Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">{providers.length}</div>
                  <div className="text-sm text-gray-600">Total Providers</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">
                    {providers.filter(p => p && p.isActive && p.connectionType !== 'disabled').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Integrations</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {providers.filter(p => p && p.apiAvailable).length}
                  </div>
                  <div className="text-sm text-gray-600">APIs Available</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-purple-600">
                    {providers.filter(p => p && p.providerType === 'platform').length}
                  </div>
                  <div className="text-sm text-gray-600">Gaming Platforms</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">
                    {providers.filter(p => p && p.providerType === 'game_company').length}
                  </div>
                  <div className="text-sm text-gray-600">Game Companies</div>
                </CardContent>
              </Card>
            </div>

            {/* Provider Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary">Provider Configuration</h2>
              <div className="flex space-x-3">
                <Button onClick={() => setProviderModalOpen(true)}>
                  ➕ Add Provider
                </Button>
                <Button variant="outline">
                  🧪 Test All Connections
                </Button>
              </div>
            </div>

            {/* Providers Table */}
            {loading ? (
              <div className="text-center py-8">Loading providers...</div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Provider
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Connection
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Tested
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {providers.filter(provider => provider && provider.id).map((provider) => {
                          if (!provider || !provider.id) return null;
                          
                          return (
                            <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm mr-3">
                                    {provider.name?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-primary">{provider.name || 'Unknown Provider'}</div>
                                    <div className="text-sm text-secondary">{provider.slug || 'no-slug'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline" className="capitalize">
                                  {provider.providerType?.replace('_', ' ') || 'unknown'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline" className="capitalize">
                                  {provider.connectionType || 'unknown'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={provider.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {provider.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                {provider.lastTested ? formatDate(provider.lastTested) : 'Never'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingProvider(provider)
                                      setProviderModalOpen(true)
                                    }}
                                  >
                                    ✏️ Edit
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    🧪 Test
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
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
                    
                    {providers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No providers configured. Add your first provider to get started!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connection Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Connection Analytics</CardTitle>
                <CardDescription>Overview of provider integrations and health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-primary mb-2">Connection Health</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Healthy:</span>
                        <span className="font-semibold text-green-600">
                          {providerConnections.filter(c => c && c.isActive && !c.lastError).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Issues:</span>
                        <span className="font-semibold text-yellow-600">
                          {providerConnections.filter(c => c && c.isActive && c.lastError).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inactive:</span>
                        <span className="font-semibold text-gray-600">
                          {providerConnections.filter(c => c && !c.isActive).length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-primary mb-2">By Environment</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Production:</span>
                        <span className="font-semibold">
                          {providerConnections.filter(c => c && c.environment === 'production').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Staging:</span>
                        <span className="font-semibold">
                          {providerConnections.filter(c => c && c.environment === 'staging').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Development:</span>
                        <span className="font-semibold">
                          {providerConnections.filter(c => c && c.environment === 'development').length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-primary mb-2">API Usage Today</h4>
                    <div className="space-y-1 text-sm text-secondary">
                      {providerConnections
                        .filter(conn => conn && conn.requestsToday > 0)
                        .slice(0, 3)
                        .map(conn => {
                          const provider = providers.find(p => p?.providerId === conn.providerId);
                          return (
                            <div key={conn.id} className="flex justify-between">
                              <span>{provider?.name || 'Unknown'}:</span>
                              <span className="font-semibold">{conn.requestsToday}</span>
                            </div>
                          )
                        })
                      }
                      {providerConnections.filter(c => c && c.requestsToday > 0).length === 0 && (
                        <div>No API usage today</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <UploadDatasetModal 
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={() => {
            setUploadModalOpen(false)
            fetchDatasets()
          }}
          games={games}
        />
      )}

      {/* Game Management Modal */}
      {gameModalOpen && (
        <GameManagementModal 
          isOpen={gameModalOpen}
          onClose={() => {
            setGameModalOpen(false)
            setEditingGame(null)
          }}
          onSave={() => {
            setGameModalOpen(false)
            setEditingGame(null)
            fetchGames()
          }}
          game={editingGame}
        />
      )}

      {/* Provider Management Modal */}
      {providerModalOpen && (
        <ProviderManagementModal 
          isOpen={providerModalOpen}
          onClose={() => {
            setProviderModalOpen(false)
            setEditingProvider(null)
          }}
          onSave={() => {
            setProviderModalOpen(false)
            setEditingProvider(null)
            fetchProviders()
          }}
          provider={editingProvider}
        />
      )}
      </div>
    </div>
  )
}

// Upload Modal Component
interface UploadDatasetModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: () => void
  games: any[]
}

const UploadDatasetModal: React.FC<UploadDatasetModalProps> = ({ isOpen, onClose, onUpload, games }) => {
  const [formData, setFormData] = useState({
    name: '',
    game: 'DESTINY2',
    data_type: 'DATASET',
    category: 'gameplay',
    description: '',
    version: '1.0.0',
    tags: '',
    metadata: '{}'
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)


  const dataTypes = ['VISUAL', 'DATASET', 'CODE', 'DOCUMENTATION', 'MODEL', 'EMBEDDING', 'EVALUATION']
  const categories = ['auth', 'inventory', 'gameplay', 'character', 'ui', 'endgame', 'api', 'mechanics']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('name', formData.name)
      formDataObj.append('game', formData.game)
      formDataObj.append('data_type', formData.data_type)
      formDataObj.append('category', formData.category)
      formDataObj.append('description', formData.description)
      formDataObj.append('version', formData.version)
      formDataObj.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)))
      formDataObj.append('metadata', formData.metadata)
      formDataObj.append('file', file)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/training/datasets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: formDataObj
      })

      const result = await response.json()
      if (result.success) {
        onUpload()
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">📁 Upload Training Dataset</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-medium px-3 py-1 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Dataset Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="game">Game</Label>
            <select
              id="game"
              value={formData.game}
              onChange={(e) => setFormData({...formData, game: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {games.filter(game => game && game.id).map(game => (
                <option key={game.id} value={game.slug?.toUpperCase() || game.name?.toUpperCase()}>
                  {game.name} ({game.slug?.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="data_type">Data Type</Label>
            <select
              id="data_type"
              value={formData.data_type}
              onChange={(e) => setFormData({...formData, data_type: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {dataTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              required
            />
          </div>

          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({...formData, version: e.target.value})}
              placeholder="1.0.0"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="training, example, v1"
            />
          </div>

          <div>
            <Label htmlFor="file">File</Label>
            <input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={uploading || !file}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload Dataset'}
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

// Game Management Modal Component
interface GameManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  game?: any | null
}

const GameManagementModal: React.FC<GameManagementModalProps> = ({ isOpen, onClose, onSave, game }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortName: '',
    description: '',
    status: 'released',
    franchise: '',
    seriesNumber: '',
    gameCompanyProviderId: '',
    platformProviderIds: [] as string[],
    publisher: '',
    officialSiteUrl: '',
    genre: '',
    categoryIds: [] as string[]  // msasf - Multiple categories
  })
  const [saving, setSaving] = useState(false)
  
  // Provider search states
  const [gameCompanyProviders, setGameCompanyProviders] = useState<any[]>([])
  const [platformProviders, setPlatformProviders] = useState<any[]>([])
  const [gameCompanySearch, setGameCompanySearch] = useState('')
  const [platformSearch, setPlatformSearch] = useState('')
  const [showGameCompanyDropdown, setShowGameCompanyDropdown] = useState(false)
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false)
  
  // Genre and Categories state (sasf + msasf)
  const [gameGenres, setGameGenres] = useState<any[]>([])
  const [gameCategories, setGameCategories] = useState<any[]>([])
  const [genreSearch, setGenreSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const statusOptions = ['announced', 'alpha', 'beta', 'released', 'sunset']

  // Fetch providers and tags on modal open
  React.useEffect(() => {
    if (isOpen) {
      fetchGameCompanyProviders()
      fetchPlatformProviders()
      fetchGameGenres()
      fetchGameCategories()
    }
  }, [isOpen])

  const fetchGameCompanyProviders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: JSON.stringify({
          query: `
            query {
              gameProviders(type: "game_company") {
                id
                providerId
                name
                displayName
                slug
              }
            }
          `
        })
      })
      
      const result = await response.json()
      if (result.data?.gameProviders) {
        setGameCompanyProviders(result.data.gameProviders)
      }
    } catch (error) {
      console.error('Error fetching game company providers:', error)
    }
  }

  const fetchPlatformProviders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: JSON.stringify({
          query: `
            query {
              gameProviders(type: "platform") {
                id
                providerId
                name
                displayName
                slug
              }
            }
          `
        })
      })
      
      const result = await response.json()
      if (result.data?.gameProviders) {
        setPlatformProviders(result.data.gameProviders)
      }
    } catch (error) {
      console.error('Error fetching platform providers:', error)
    }
  }

  const fetchGameGenres = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: JSON.stringify({
          query: `
            query {
              gameTags(type: "Genre") {
                id
                name
                slug
                type
              }
            }
          `
        })
      })
      
      const result = await response.json()
      if (result.data?.gameTags) {
        setGameGenres(result.data.gameTags)
      }
    } catch (error) {
      console.error('Error fetching game genres:', error)
    }
  }

  const fetchGameCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ragar-auth-token')}`
        },
        body: JSON.stringify({
          query: `
            query {
              gameTags(type: "Category") {
                id
                name
                slug
                type
              }
            }
          `
        })
      })
      
      const result = await response.json()
      if (result.data?.gameTags) {
        setGameCategories(result.data.gameTags)
      }
    } catch (error) {
      console.error('Error fetching game categories:', error)
    }
  }

  // Populate form when editing
  React.useEffect(() => {
    if (game) {
      setFormData({
        name: game.name || '',
        slug: game.slug || '',
        shortName: game.shortName || '',
        description: game.description || '',
        status: game.status || 'released',
        franchise: game.franchise || '',
        seriesNumber: game.seriesNumber ? String(game.seriesNumber) : '',
        gameCompanyProviderId: game.gameCompanyProviderId || '',
        platformProviderIds: game.platformProviderIds || [],
        publisher: game.publisher || '',
        officialSiteUrl: game.officialSiteUrl || '',
        genre: game.genre || '',
        categoryIds: game.categoryIds || []
      })
      
      // Set search fields for display
      if (game.gameCompanyProviderId) {
        const provider = gameCompanyProviders.find(p => p.providerId === game.gameCompanyProviderId)
        setGameCompanySearch(provider ? provider.displayName : game.gameCompanyProviderId)
      }
      
      if (game.platformProviderIds && game.platformProviderIds.length > 0) {
        const selectedPlatforms = platformProviders.filter(p => 
          game.platformProviderIds.includes(p.providerId)
        )
        setPlatformSearch(selectedPlatforms.map(p => p.displayName).join(', '))
      }
      
      // Set genre search field (sasf)
      setGenreSearch(game.genre || '')
      
      // Clear category search since it's now msasf
      setCategorySearch('')
    } else {
      // Reset form for new game
      setFormData({
        name: '',
        slug: '',
        shortName: '',
        description: '',
        status: 'released',
        franchise: '',
        seriesNumber: '',
        gameCompanyProviderId: '',
        platformProviderIds: [],
        publisher: '',
        officialSiteUrl: '',
        genre: '',
        categoryIds: []
      })
      setGameCompanySearch('')
      setPlatformSearch('')
      setGenreSearch('')
      setCategorySearch('')
    }
  }, [game, gameCompanyProviders, platformProviders])

  // Enhanced click outside handlers for autocomplete dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Handle game company dropdown
      const gameCompanyContainer = target.closest('#game-company-container')
      if (!gameCompanyContainer) {
        setShowGameCompanyDropdown(false)
      }
      
      // Handle platform dropdown
      const platformContainer = target.closest('#platform-container')
      if (!platformContainer) {
        setShowPlatformDropdown(false)
      }
      
      // Handle genre dropdown
      const genreContainer = target.closest('#genre-container')
      if (!genreContainer) {
        setShowGenreDropdown(false)
      }
      
      // Handle category dropdown
      const categoryContainer = target.closest('#category-container')
      if (!categoryContainer) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Enhanced focus handlers for better UX
  const handleGameCompanyBlur = () => {
    // Small delay to allow for dropdown clicks
    setTimeout(() => setShowGameCompanyDropdown(false), 150)
  }

  const handlePlatformBlur = () => {
    // Small delay to allow for dropdown clicks
    setTimeout(() => setShowPlatformDropdown(false), 150)
  }

  const handleGenreBlur = () => {
    // Small delay to allow for dropdown clicks
    setTimeout(() => setShowGenreDropdown(false), 150)
  }

  const handleCategoryBlur = () => {
    // Small delay to allow for dropdown clicks
    setTimeout(() => setShowCategoryDropdown(false), 150)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // For now, just show a message since we need backend mutations
      alert(`${game ? 'Update' : 'Create'} game functionality requires backend implementation. \n\nGame Data:\n${JSON.stringify(formData, null, 2)}`)
      onSave()
    } catch (error) {
      console.error('Game management error:', error)
      alert('Operation failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">
            {game ? '✏️ Edit Game' : '➕ Add New Game'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-primary font-medium px-3 py-1 rounded-md hover:bg-card-hover"
          >
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-primary font-medium mb-2 block">Game Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Destiny 2"
                required
                className="bg-input text-input border-border"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="text-primary font-medium mb-2 block">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="e.g., destiny2"
                required
                className="bg-input text-input border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shortName" className="text-primary font-medium mb-2 block">Short Name</Label>
              <Input
                id="shortName"
                value={formData.shortName}
                onChange={(e) => setFormData({...formData, shortName: e.target.value})}
                placeholder="e.g., D2"
                className="bg-input text-input border-border"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-primary font-medium mb-2 block">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border border-border rounded px-3 py-2 bg-input text-input"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status} className="capitalize">{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="franchise" className="text-primary font-medium mb-2 block">Franchise</Label>
              <Input
                id="franchise"
                value={formData.franchise}
                onChange={(e) => setFormData({...formData, franchise: e.target.value})}
                placeholder="e.g., Destiny"
                className="bg-input text-input border-border"
              />
            </div>

            <div>
              <Label htmlFor="seriesNumber" className="text-primary font-medium mb-2 block">Series Number</Label>
              <Input
                id="seriesNumber"
                type="number"
                value={formData.seriesNumber}
                onChange={(e) => setFormData({...formData, seriesNumber: e.target.value})}
                placeholder="e.g., 2"
                className="bg-input text-input border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div id="game-company-container">
              <Label htmlFor="gameCompany" className="text-primary font-medium mb-2 block">Game Company</Label>
              <div className="relative">
                <Input
                  id="gameCompany"
                  value={gameCompanySearch}
                  onChange={(e) => {
                    setGameCompanySearch(e.target.value)
                    setShowGameCompanyDropdown(true)
                  }}
                  onFocus={() => setShowGameCompanyDropdown(true)}
                  onBlur={handleGameCompanyBlur}
                  placeholder="Search for game company..."
                  className="bg-input text-input border-border"
                />
                {showGameCompanyDropdown && gameCompanyProviders.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {gameCompanyProviders
                      .filter(provider => 
                        provider.displayName.toLowerCase().includes(gameCompanySearch.toLowerCase()) ||
                        provider.name.toLowerCase().includes(gameCompanySearch.toLowerCase())
                      )
                      .map(provider => (
                        <div
                          key={provider.id}
                          className="px-3 py-2 hover:bg-card-hover cursor-pointer text-primary"
                          onClick={() => {
                            setFormData({...formData, gameCompanyProviderId: provider.providerId})
                            setGameCompanySearch(provider.displayName)
                            setShowGameCompanyDropdown(false)
                          }}
                        >
                          <div className="font-medium">{provider.displayName}</div>
                          <div className="text-sm text-secondary">{provider.name}</div>
                        </div>
                      ))
                    }
                    {gameCompanyProviders.filter(provider => 
                      provider.displayName.toLowerCase().includes(gameCompanySearch.toLowerCase()) ||
                      provider.name.toLowerCase().includes(gameCompanySearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-secondary">No game companies found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div id="platform-container">
              <Label htmlFor="platforms" className="text-primary font-medium mb-2 block">
                Platforms
                {formData.platformProviderIds.length > 0 && (
                  <span className="ml-2 text-sm text-secondary">
                    ({formData.platformProviderIds.length} selected)
                  </span>
                )}
              </Label>
              
              {/* Selected Platforms Display */}
              {formData.platformProviderIds.length > 0 && (
                <div className="mb-3 p-3 bg-card border border-border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary">Selected Platforms:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, platformProviderIds: []})
                        setPlatformSearch('')
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.platformProviderIds.map(platformId => {
                      const platform = platformProviders.find(p => p.providerId === platformId)
                      return platform ? (
                        <Badge 
                          key={platformId} 
                          variant="default" 
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1"
                        >
                          <span className="mr-2">{platform.displayName}</span>
                          <button
                            type="button"
                            className="ml-1 hover:text-red-600 font-bold text-sm"
                            onClick={() => {
                              const newPlatformIds = formData.platformProviderIds.filter(id => id !== platformId)
                              setFormData({...formData, platformProviderIds: newPlatformIds})
                              // Clear search field when removing items
                              setPlatformSearch('')
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="relative">
                <Input
                  id="platforms"
                  value={platformSearch}
                  onChange={(e) => {
                    setPlatformSearch(e.target.value)
                    setShowPlatformDropdown(true)
                  }}
                  onFocus={() => setShowPlatformDropdown(true)}
                  onBlur={handlePlatformBlur}
                  placeholder={
                    formData.platformProviderIds.length > 0 
                      ? "Search to add more platforms..." 
                      : "Search and select platforms..."
                  }
                  className="bg-input text-input border-border"
                />
                
                {/* Search Results Dropdown */}
                {showPlatformDropdown && platformProviders.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {/* Show available platforms (not already selected) */}
                    {platformProviders
                      .filter(provider => 
                        !formData.platformProviderIds.includes(provider.providerId) &&
                        (provider.displayName.toLowerCase().includes(platformSearch.toLowerCase()) ||
                         provider.name.toLowerCase().includes(platformSearch.toLowerCase()))
                      )
                      .map(provider => (
                        <div
                          key={provider.id}
                          className="px-3 py-3 hover:bg-card-hover cursor-pointer text-primary border-b border-border last:border-b-0"
                          onClick={() => {
                            // Add platform
                            const newPlatformIds = [...formData.platformProviderIds, provider.providerId]
                            setFormData({...formData, platformProviderIds: newPlatformIds})
                            
                            // Clear search field after selection
                            setPlatformSearch('')
                            setShowPlatformDropdown(false)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-primary">{provider.displayName}</div>
                              <div className="text-sm text-secondary">{provider.name}</div>
                            </div>
                            <div className="text-green-600 font-bold">+</div>
                          </div>
                        </div>
                      ))
                    }
                    
                    {/* Show already selected platforms with different styling */}
                    {formData.platformProviderIds.length > 0 && platformProviders
                      .filter(provider => 
                        formData.platformProviderIds.includes(provider.providerId) &&
                        (provider.displayName.toLowerCase().includes(platformSearch.toLowerCase()) ||
                         provider.name.toLowerCase().includes(platformSearch.toLowerCase()))
                      )
                      .map(provider => (
                        <div
                          key={provider.id}
                          className="px-3 py-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-b border-border last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{provider.displayName}</div>
                              <div className="text-sm opacity-75">{provider.name}</div>
                            </div>
                            <div className="text-blue-600 font-bold">✓ Selected</div>
                          </div>
                        </div>
                      ))
                    }
                    
                    {/* No results message */}
                    {platformProviders.filter(provider => 
                      provider.displayName.toLowerCase().includes(platformSearch.toLowerCase()) ||
                      provider.name.toLowerCase().includes(platformSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-3 text-secondary text-center">
                        No platforms found matching "{platformSearch}"
                      </div>
                    )}
                    
                    {/* All platforms selected message */}
                    {formData.platformProviderIds.length === platformProviders.length && (
                      <div className="px-3 py-3 text-secondary text-center bg-green-50 dark:bg-green-900">
                        🎉 All available platforms selected!
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Help text */}
              <div className="mt-2 text-xs text-secondary">
                {formData.platformProviderIds.length === 0 && "Select the platforms where this game is available"}
                {formData.platformProviderIds.length > 0 && "Add more platforms or remove existing ones from the badges above"}
              </div>
            </div>

            <div>
              <Label htmlFor="publisher" className="text-primary font-medium mb-2 block">Publisher</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                placeholder="e.g., Bungie"
                className="bg-input text-input border-border"
              />
            </div>

            <div id="genre-container">
              <Label htmlFor="genre" className="text-primary font-medium mb-2 block">Genre</Label>
              <div className="relative">
                <Input
                  id="genre"
                  value={genreSearch}
                  onChange={(e) => {
                    setGenreSearch(e.target.value)
                    setShowGenreDropdown(true)
                  }}
                  onFocus={() => setShowGenreDropdown(true)}
                  onBlur={handleGenreBlur}
                  placeholder="Search for game genre..."
                  className="bg-input text-input border-border"
                />
                {showGenreDropdown && gameGenres.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {gameGenres
                      .filter(genre => 
                        genre.name.toLowerCase().includes(genreSearch.toLowerCase())
                      )
                      .map(genre => (
                        <div
                          key={genre.id}
                          className="px-3 py-2 hover:bg-card-hover cursor-pointer text-primary"
                          onClick={() => {
                            setFormData({...formData, genre: genre.name})
                            setGenreSearch(genre.name)
                            setShowGenreDropdown(false)
                          }}
                        >
                          <div className="font-medium">{genre.name}</div>
                        </div>
                      ))
                    }
                    {gameGenres.filter(genre => 
                      genre.name.toLowerCase().includes(genreSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-secondary">No genres found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div id="category-container">
              <Label htmlFor="categories" className="text-primary font-medium mb-2 block">
                Categories (msasf)
                {formData.categoryIds.length > 0 && (
                  <span className="ml-2 text-sm text-secondary">
                    ({formData.categoryIds.length} selected)
                  </span>
                )}
              </Label>
              
              {/* Selected Categories Display */}
              {formData.categoryIds.length > 0 && (
                <div className="mb-3 p-3 bg-card border border-border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary">Selected Categories:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({...formData, categoryIds: []})
                        setCategorySearch('')
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.categoryIds.map(categoryId => {
                      const category = gameCategories.find(c => c.slug === categoryId)
                      return category ? (
                        <Badge 
                          key={categoryId} 
                          variant="default" 
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1"
                        >
                          <span className="mr-2">{category.name}</span>
                          <button
                            type="button"
                            className="ml-1 hover:text-red-600 font-bold text-sm"
                            onClick={() => {
                              const newCategoryIds = formData.categoryIds.filter(id => id !== categoryId)
                              setFormData({...formData, categoryIds: newCategoryIds})
                              setCategorySearch('')
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="relative">
                <Input
                  id="categories"
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value)
                    setShowCategoryDropdown(true)
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onBlur={handleCategoryBlur}
                  placeholder={
                    formData.categoryIds.length > 0 
                      ? "Search to add more categories..." 
                      : "Search and select categories..."
                  }
                  className="bg-input text-input border-border"
                />
                
                {/* Search Results Dropdown */}
                {showCategoryDropdown && gameCategories.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {/* Show available categories (not already selected) */}
                    {gameCategories
                      .filter(category => 
                        !formData.categoryIds.includes(category.slug) &&
                        category.name.toLowerCase().includes(categorySearch.toLowerCase())
                      )
                      .map(category => (
                        <div
                          key={category.id}
                          className="px-3 py-3 hover:bg-card-hover cursor-pointer text-primary border-b border-border last:border-b-0"
                          onClick={() => {
                            // Add category
                            const newCategoryIds = [...formData.categoryIds, category.slug]
                            setFormData({...formData, categoryIds: newCategoryIds})
                            
                            // Clear search field after selection
                            setCategorySearch('')
                            setShowCategoryDropdown(false)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-primary">{category.name}</div>
                              <div className="text-sm text-secondary">{category.slug}</div>
                            </div>
                            <div className="text-green-600 font-bold">+</div>
                          </div>
                        </div>
                      ))
                    }
                    
                    {/* Show already selected categories with different styling */}
                    {formData.categoryIds.length > 0 && gameCategories
                      .filter(category => 
                        formData.categoryIds.includes(category.slug) &&
                        category.name.toLowerCase().includes(categorySearch.toLowerCase())
                      )
                      .map(category => (
                        <div
                          key={category.id}
                          className="px-3 py-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 border-b border-border last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm opacity-75">{category.slug}</div>
                            </div>
                            <div className="text-green-600 font-bold">✓ Selected</div>
                          </div>
                        </div>
                      ))
                    }
                    
                    {/* No results message */}
                    {gameCategories.filter(category => 
                      category.name.toLowerCase().includes(categorySearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-3 text-secondary text-center">
                        No categories found matching "{categorySearch}"
                      </div>
                    )}
                    
                    {/* All categories selected message */}
                    {formData.categoryIds.length === gameCategories.length && (
                      <div className="px-3 py-3 text-secondary text-center bg-green-50 dark:bg-green-900">
                        🎉 All available categories selected!
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Help text */}
              <div className="mt-2 text-xs text-secondary">
                {formData.categoryIds.length === 0 && "Select categories that describe this game's features and gameplay"}
                {formData.categoryIds.length > 0 && "Add more categories or remove existing ones from the badges above"}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-primary font-medium mb-2 block">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-border rounded px-3 py-2 h-20 bg-input text-input"
              placeholder="Brief description of the game"
            />
          </div>

          <div>
            <Label htmlFor="officialSiteUrl" className="text-primary font-medium mb-2 block">Official Website</Label>
            <Input
              id="officialSiteUrl"
              value={formData.officialSiteUrl}
              onChange={(e) => setFormData({...formData, officialSiteUrl: e.target.value})}
              placeholder="https://www.bungie.net"
              className="bg-input text-input border-border"
            />
          </div>



          <div className="flex space-x-3 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : (game ? 'Update Game' : 'Add Game')}
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

// Provider Management Modal Component
interface ProviderManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  provider?: any | null
}

const ProviderManagementModal: React.FC<ProviderManagementModalProps> = ({ isOpen, onClose, onSave, provider }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    displayName: '',
    providerType: 'platform',
    connectionType: 'oauth21_pkce',
    isActive: true,
    description: '',
    notes: '',
    // API Configuration
    apiAvailable: false,
    apiDocsUrl: '',
    apiBaseUrl: '',
    apiKey: '',
    defaultScopes: '',
    rateLimitPerHour: '',
    rateLimitPerMinute: '',
    // OAuth Endpoints
    authUrl: '',
    tokenUrl: '',
    userInfoUrl: '',
    redirectUris: '',
    // Business Info
    companyName: '',
    websiteUrl: '',
    supportUrl: ''
  })
  const [saving, setSaving] = useState(false)

  const providerTypes = ['platform', 'game_company', 'api_service']
  const connectionTypes = ['oauth2', 'oauth21_pkce', 'openid', 'api_key', 'manual', 'disabled']

  // Populate form when editing
  React.useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        slug: provider.slug || '',
        displayName: provider.displayName || '',
        providerType: provider.providerType || 'platform',
        connectionType: provider.connectionType || 'oauth21_pkce',
        isActive: provider.isActive !== undefined ? provider.isActive : true,
        description: provider.description || '',
        notes: provider.notes || '',
        // API Configuration
        apiAvailable: provider.apiAvailable || false,
        apiDocsUrl: provider.apiDocsUrl || '',
        apiBaseUrl: provider.apiBaseUrl || '',
        apiKey: provider.apiKey || '',
        defaultScopes: Array.isArray(provider.defaultScopes) ? provider.defaultScopes.join(', ') : (provider.defaultScopes || ''),
        rateLimitPerHour: provider.rateLimitPerHour ? String(provider.rateLimitPerHour) : '',
        rateLimitPerMinute: provider.rateLimitPerMinute ? String(provider.rateLimitPerMinute) : '',
        // OAuth Endpoints
        authUrl: provider.authUrl || '',
        tokenUrl: provider.tokenUrl || '',
        userInfoUrl: provider.userInfoUrl || '',
        redirectUris: Array.isArray(provider.redirectUris) ? provider.redirectUris.join(', ') : (provider.redirectUris || ''),
        // Business Info
        companyName: provider.companyName || '',
        websiteUrl: provider.websiteUrl || '',
        supportUrl: provider.supportUrl || ''
      })
    } else {
      // Reset form for new provider
      setFormData({
        name: '',
        slug: '',
        displayName: '',
        providerType: 'platform',
        connectionType: 'oauth21_pkce',
        isActive: true,
        description: '',
        notes: '',
        // API Configuration
        apiAvailable: false,
        apiDocsUrl: '',
        apiBaseUrl: '',
        apiKey: '',
        defaultScopes: '',
        rateLimitPerHour: '',
        rateLimitPerMinute: '',
        // OAuth Endpoints
        authUrl: '',
        tokenUrl: '',
        userInfoUrl: '',
        redirectUris: '',
        // Business Info
        companyName: '',
        websiteUrl: '',
        supportUrl: ''
      })
    }
  }, [provider])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // For now, just show a message since we need backend mutations
      alert(`${provider ? 'Update' : 'Create'} provider functionality requires backend implementation. \n\nProvider Data:\n${JSON.stringify(formData, null, 2)}`)
      onSave()
    } catch (error) {
      console.error('Provider management error:', error)
      alert('Operation failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">
            {provider ? '✏️ Edit Game Provider' : '➕ Add New Game Provider'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-primary font-medium px-3 py-1 rounded-md hover:bg-card-hover"
          >
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Provider Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-primary font-medium mb-2 block">Provider Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Steam"
                required
                className="bg-input text-input border-border"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="text-primary font-medium mb-2 block">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="e.g., steam"
                required
                className="bg-input text-input border-border"
              />
            </div>

            <div>
              <Label htmlFor="displayName" className="text-primary font-medium mb-2 block">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                placeholder="e.g., Steam Platform"
                required
                className="bg-input text-input border-border"
              />
            </div>

            <div>
              <Label htmlFor="providerType" className="text-primary font-medium mb-2 block">Provider Type</Label>
              <select
                id="providerType"
                value={formData.providerType}
                onChange={(e) => setFormData({...formData, providerType: e.target.value})}
                className="w-full border border-border rounded px-3 py-2 bg-input text-input"
              >
                {providerTypes.map(type => (
                  <option key={type} value={type} className="capitalize">{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="connectionType" className="text-primary font-medium mb-2 block">Connection Type</Label>
              <select
                id="connectionType"
                value={formData.connectionType}
                onChange={(e) => setFormData({...formData, connectionType: e.target.value})}
                className="w-full border border-border rounded px-3 py-2 bg-input text-input"
              >
                {connectionTypes.map(type => (
                  <option key={type} value={type} className="capitalize">{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="companyName" className="text-primary font-medium mb-2 block">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                placeholder="e.g., Valve Corporation"
                className="bg-input text-input border-border"
              />
            </div>
          </div>

          {/* Business URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="websiteUrl" className="text-primary font-medium mb-2 block">Website URL</Label>
              <Input
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                placeholder="https://store.steampowered.com"
                className="bg-input text-input border-border"
              />
            </div>

            <div>
              <Label htmlFor="supportUrl" className="text-primary font-medium mb-2 block">Support URL</Label>
              <Input
                id="supportUrl"
                value={formData.supportUrl}
                onChange={(e) => setFormData({...formData, supportUrl: e.target.value})}
                placeholder="https://help.steampowered.com"
                className="bg-input text-input border-border"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-primary font-medium mb-2 block">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-border rounded px-3 py-2 h-20 bg-input text-input"
              placeholder="Brief description of the provider"
            />
          </div>

          {/* API Configuration Section */}
          <div className="border-t border-border pt-4">
            <h3 className="font-medium text-primary mb-3">API Configuration</h3>
            
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="apiAvailable"
                checked={formData.apiAvailable}
                onChange={(e) => setFormData({...formData, apiAvailable: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="apiAvailable" className="text-primary font-medium">API Available</Label>
            </div>

            {formData.apiAvailable && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiBaseUrl" className="text-primary font-medium mb-2 block">API Base URL</Label>
                    <Input
                      id="apiBaseUrl"
                      value={formData.apiBaseUrl}
                      onChange={(e) => setFormData({...formData, apiBaseUrl: e.target.value})}
                      placeholder="https://api.bungie.net"
                      className="bg-input text-input border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="apiDocsUrl" className="text-primary font-medium mb-2 block">API Documentation URL</Label>
                    <Input
                      id="apiDocsUrl"
                      value={formData.apiDocsUrl}
                      onChange={(e) => setFormData({...formData, apiDocsUrl: e.target.value})}
                      placeholder="https://bungie-net.github.io/multi/"
                      className="bg-input text-input border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rateLimitPerHour" className="text-primary font-medium mb-2 block">Rate Limit (per hour)</Label>
                    <Input
                      id="rateLimitPerHour"
                      type="number"
                      value={formData.rateLimitPerHour}
                      onChange={(e) => setFormData({...formData, rateLimitPerHour: e.target.value})}
                      placeholder="1000"
                      className="bg-input text-input border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rateLimitPerMinute" className="text-primary font-medium mb-2 block">Rate Limit (per minute)</Label>
                    <Input
                      id="rateLimitPerMinute"
                      type="number"
                      value={formData.rateLimitPerMinute}
                      onChange={(e) => setFormData({...formData, rateLimitPerMinute: e.target.value})}
                      placeholder="25"
                      className="bg-input text-input border-border"
                    />
                  </div>
                </div>

                {formData.connectionType !== 'api_key' && formData.connectionType !== 'disabled' && (
                  <>
                    <div>
                      <Label htmlFor="defaultScopes" className="text-primary font-medium mb-2 block">Default OAuth Scopes (comma-separated)</Label>
                      <Input
                        id="defaultScopes"
                        value={formData.defaultScopes}
                        onChange={(e) => setFormData({...formData, defaultScopes: e.target.value})}
                        placeholder="account:profile, account:characters"
                        className="bg-input text-input border-border"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="authUrl" className="text-primary font-medium mb-2 block">Authorization URL</Label>
                        <Input
                          id="authUrl"
                          value={formData.authUrl}
                          onChange={(e) => setFormData({...formData, authUrl: e.target.value})}
                          placeholder="https://www.bungie.net/en/OAuth/Authorize"
                          className="bg-input text-input border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tokenUrl" className="text-primary font-medium mb-2 block">Token URL</Label>
                        <Input
                          id="tokenUrl"
                          value={formData.tokenUrl}
                          onChange={(e) => setFormData({...formData, tokenUrl: e.target.value})}
                          placeholder="https://www.bungie.net/platform/app/oauth/token/"
                          className="bg-input text-input border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="userInfoUrl" className="text-primary font-medium mb-2 block">User Info URL</Label>
                        <Input
                          id="userInfoUrl"
                          value={formData.userInfoUrl}
                          onChange={(e) => setFormData({...formData, userInfoUrl: e.target.value})}
                          placeholder="https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/"
                          className="bg-input text-input border-border"
                        />
                      </div>

                      <div>
                        <Label htmlFor="redirectUris" className="text-primary font-medium mb-2 block">Redirect URIs (comma-separated)</Label>
                        <Input
                          id="redirectUris"
                          value={formData.redirectUris}
                          onChange={(e) => setFormData({...formData, redirectUris: e.target.value})}
                          placeholder="https://ai-gamer.pro/auth/callback"
                          className="bg-input text-input border-border"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.connectionType === 'api_key' && (
                  <div>
                    <Label htmlFor="apiKey" className="text-primary font-medium mb-2 block">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                      placeholder="Enter API Key"
                      className="bg-input text-input border-border"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Section */}
          <div className="border-t border-border pt-4">
            <h3 className="font-medium text-primary mb-3">Admin Configuration</h3>
            
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="isActive" className="text-primary font-medium">Active</Label>
            </div>

            <div>
              <Label htmlFor="notes" className="text-primary font-medium mb-2 block">Admin Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full border border-border rounded px-3 py-2 h-20 bg-input text-input"
                placeholder="Internal notes about this provider"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-6 border-t border-border">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : (provider ? 'Update Provider' : 'Add Provider')}
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

export default TrainingDataPage