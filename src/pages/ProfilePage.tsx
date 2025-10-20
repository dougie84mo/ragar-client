import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Camera, 
  Calendar, 
  Save, 
  Edit2,
  Gamepad2,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { usePageTitle } from '../hooks/usePageTitle'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { GET_CURRENT_USER, UPDATE_USER_PROFILE, CHECK_USERNAME_AVAILABILITY, GET_ALL_GAMES } from '../lib/apollo'
import type { UpdateUserInput } from '../lib/apollo'

interface ProfileData {
  profilePicture: string
  username: string
  displayName: string
  firstName: string
  lastName: string
  biography: string
  joinDate: string
  favoriteGame: string
  gamingPlatforms: string[]
}

const ProfilePage: React.FC = () => {
  usePageTitle('Profile')

  const { data, loading, error, refetch } = useQuery(GET_CURRENT_USER)
  const { data: gamesData } = useQuery(GET_ALL_GAMES)
  const [updateProfile] = useMutation(UPDATE_USER_PROFILE)
  const [checkUsername] = useLazyQuery(CHECK_USERNAME_AVAILABILITY, {
    onCompleted: (data) => {
      setUsernameStatus({
        checking: false,
        available: data.checkUsernameAvailability.available,
        valid: data.checkUsernameAvailability.valid,
        message: data.checkUsernameAvailability.message,
        suggestions: data.checkUsernameAvailability.suggestions
      })
    },
    onError: (error) => {
      console.error('Username check error:', error)
      setUsernameStatus({
        checking: false,
        available: false,
        valid: false,
        message: 'Unable to check username availability'
      })
    }
  })

  const [profileData, setProfileData] = useState<ProfileData>({
    profilePicture: '',
    username: '',
    displayName: '',
    firstName: '',
    lastName: '',
    biography: '',
    joinDate: '',
    favoriteGame: '',
    gamingPlatforms: []
  })

  const [originalUsername, setOriginalUsername] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null)
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false)
  const [usernameSaveError, setUsernameSaveError] = useState<string | null>(null)
  const [usernameSaveSuccess, setUsernameSaveSuccess] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean
    available?: boolean
    valid?: boolean
    message?: string
    suggestions?: string[]
  }>({ checking: false })
  const [gameSearchQuery, setGameSearchQuery] = useState('')
  const [showGameDropdown, setShowGameDropdown] = useState(false)

  // Load user data from API
  useEffect(() => {
    if (data?.me) {
      const user = data.me
      // Use full URL for avatar if it starts with /uploads/, otherwise use as-is
      const avatarUrl = user.profile?.avatar 
        ? (user.profile.avatar.startsWith('/uploads/') 
            ? `http://localhost:4000${user.profile.avatar}` 
            : user.profile.avatar)
        : ''
      
      const userData = {
        profilePicture: avatarUrl,
        username: user.username || '',
        displayName: user.profile?.displayName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        biography: user.profile?.biography || '',
        joinDate: user.createdAt || '',
        favoriteGame: user.gamingProfile?.favoriteGame || '',
        gamingPlatforms: user.gamingProfile?.platforms || []
      }
      setProfileData(userData)
      setOriginalUsername(user.username || '')
      setGameSearchQuery(user.gamingProfile?.favoriteGame || '')
    }
  }, [data])

  // Debounced username checking
  const debouncedUsernameCheck = useCallback(
    (username: string) => {
      // Don't check if it's the same as original username
      if (username === originalUsername || username.length === 0) {
        setUsernameStatus({ checking: false })
        return
      }

      setUsernameStatus({ checking: true })
      
      const timeoutId = setTimeout(() => {
        checkUsername({ variables: { username } })
      }, 400)

      return () => clearTimeout(timeoutId)
    },
    [checkUsername, originalUsername]
  )

  useEffect(() => {
    const cleanup = debouncedUsernameCheck(profileData.username)
    return cleanup
  }, [profileData.username, debouncedUsernameCheck])

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfilePictureUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/avif'
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setProfileSaveError('Image too large. Maximum size is 5MB')
          return
        }

        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          handleInputChange('profilePicture', result)
        }
        reader.readAsDataURL(file)

        // Upload to server
        await uploadAvatarToServer(file)
      }
    }
    input.click()
  }

  const uploadAvatarToServer = async (file: File) => {
    try {
      setIsSavingProfile(true)
      setProfileSaveError(null)

      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('ragar-auth-token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('http://localhost:4000/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data = await response.json()
      
      // Update profile picture with server URL
      if (data.urls?.medium) {
        handleInputChange('profilePicture', `http://localhost:4000${data.urls.medium}`)
      }

      // Refetch user data to sync
      await refetch()
      
      setProfileSaveSuccess(true)
      setTimeout(() => setProfileSaveSuccess(false), 3000)
      
      console.log('✅ RAGAR: Avatar uploaded successfully', data.urls)
    } catch (error: any) {
      console.error('❌ RAGAR: Avatar upload error:', error)
      setProfileSaveError(error.message || 'Failed to upload avatar')
      
      // Revert to original avatar on error
      if (data?.me?.profile?.avatar) {
        handleInputChange('profilePicture', data.me.profile.avatar)
      }
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveUsername = async () => {
    // Check if username is valid and available if it was changed
    if (profileData.username !== originalUsername) {
      if (usernameStatus.checking || !usernameStatus.available) {
        setUsernameSaveError('Please choose a valid and available username')
        return
      }
    } else {
      setUsernameSaveError('Username unchanged')
      return
    }

    setIsSavingUsername(true)
    setUsernameSaveError(null)
    setUsernameSaveSuccess(false)

    try {
      const input: UpdateUserInput = {
        username: profileData.username
      }

      await updateProfile({
        variables: { input }
      })

      // Refetch user data to ensure sync
      await refetch()
      
      // Update the original username
      setOriginalUsername(profileData.username)
      setUsernameStatus({ checking: false })
      
      setUsernameSaveSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => setUsernameSaveSuccess(false), 3000)
      
      console.log('✅ RAGAR: Username updated successfully')
    } catch (err: any) {
      console.error('❌ RAGAR: Error updating username:', err)
      setUsernameSaveError(err.message || 'Failed to update username')
    } finally {
      setIsSavingUsername(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    setProfileSaveError(null)
    setProfileSaveSuccess(false)

    try {
      const input: UpdateUserInput = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        profile: {
          displayName: profileData.displayName,
          avatar: profileData.profilePicture,
          biography: profileData.biography
        },
        gamingProfile: {
          favoriteGame: profileData.favoriteGame,
          platforms: profileData.gamingPlatforms
        }
      }

      await updateProfile({
        variables: { input }
      })

      // Refetch user data to ensure sync
      await refetch()
      
      setProfileSaveSuccess(true)
      setIsEditingProfile(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setProfileSaveSuccess(false), 3000)
      
      console.log('✅ RAGAR: Profile updated successfully')
    } catch (err: any) {
      console.error('❌ RAGAR: Error updating profile:', err)
      setProfileSaveError(err.message || 'Failed to update profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleCancelProfile = () => {
    setIsEditingProfile(false)
    setProfileSaveError(null)
    setProfileSaveSuccess(false)
    setShowGameDropdown(false)
    // Reset form to original values from API
    if (data?.me) {
      const user = data.me
      const avatarUrl = user.profile?.avatar 
        ? (user.profile.avatar.startsWith('/uploads/') 
            ? `http://localhost:4000${user.profile.avatar}` 
            : user.profile.avatar)
        : ''
      
      setProfileData(prev => ({
        ...prev,
        profilePicture: avatarUrl,
        displayName: user.profile?.displayName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        biography: user.profile?.biography || '',
        favoriteGame: user.gamingProfile?.favoriteGame || '',
        gamingPlatforms: user.gamingProfile?.platforms || []
      }))
      setGameSearchQuery(user.gamingProfile?.favoriteGame || '')
    }
  }

  const handleCancelUsername = () => {
    setUsernameSaveError(null)
    setUsernameSaveSuccess(false)
    setUsernameStatus({ checking: false })
    // Reset username to original
    if (data?.me) {
      setProfileData(prev => ({
        ...prev,
        username: data.me.username || ''
      }))
    }
  }

  const handleGameSelect = (gameName: string) => {
    setGameSearchQuery(gameName)
    handleInputChange('favoriteGame', gameName)
    setShowGameDropdown(false)
  }

  // Filter games based on search query
  const filteredGamesForDropdown = (gamesData?.allGames || []).filter((game: any) =>
    gameSearchQuery && game.name.toLowerCase().includes(gameSearchQuery.toLowerCase())
  ).slice(0, 10) // Limit to 10 results

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 mb-4">Error loading profile: {error.message}</p>
            <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-zinc-400">Manage your personal information and gaming preferences</p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Picture & Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {profileData.profilePicture ? (
                      <img
                        src={profileData.profilePicture}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-zinc-700"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                      <button
                        onClick={handleProfilePictureUpload}
                      disabled={isSavingProfile}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                      {isSavingProfile ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                      </button>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">{profileData.displayName}</h3>
                    <p className="text-sm text-zinc-400">@{profileData.username}</p>
                    <div className="flex items-center justify-center mt-2 text-xs text-zinc-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      Joined {new Date(profileData.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Username Section */}
            <Card className="bg-zinc-900 border-zinc-800 mt-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Username
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username-edit" className="text-zinc-300 pb-[5px]">Username</Label>
                  <div className="relative">
                    <Input
                      id="username-edit"
                      value={profileData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white pr-10"
                      placeholder="Enter username"
                      maxLength={64}
                    />
                    {/* Username status indicator */}
                    {profileData.username !== originalUsername && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {usernameStatus.checking && (
                          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        )}
                        {!usernameStatus.checking && usernameStatus.available === true && (
                          <Check className="w-4 h-4 text-green-400" />
                        )}
                        {!usernameStatus.checking && usernameStatus.available === false && usernameStatus.valid === true && (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        {!usernameStatus.checking && usernameStatus.valid === false && (
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        )}
                </div>
                    )}
                  </div>
                  
                  {/* Username status message */}
                  {profileData.username && profileData.username !== originalUsername && !usernameStatus.checking && usernameStatus.message && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className={`flex items-center space-x-2 text-xs ${
                        usernameStatus.available === true ? 'text-green-400' : 
                        usernameStatus.valid === false ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        <span>{usernameStatus.message}</span>
                      </div>
                      {usernameStatus.suggestions && usernameStatus.suggestions.length > 0 && (
                        <div className="mt-1 text-xs text-zinc-500">
                          Suggestions: {usernameStatus.suggestions.join(', ')}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Username save messages */}
                  {usernameSaveSuccess && (
                    <p className="text-green-400 text-sm mt-2">✓ Username updated successfully!</p>
                  )}
                  {usernameSaveError && (
                    <p className="text-red-400 text-sm mt-2">✗ {usernameSaveError}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {profileData.username !== originalUsername && (
                    <Button
                      onClick={handleCancelUsername}
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveUsername}
                    disabled={isSavingUsername || profileData.username === originalUsername}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSavingUsername ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Username
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Profile Edit Controls */}
            <div className="flex items-center justify-between mb-4">
              <div>
                {profileSaveSuccess && (
                  <p className="text-green-400 text-sm">✓ Profile updated successfully!</p>
                )}
                {profileSaveError && (
                  <p className="text-red-400 text-sm">✗ {profileSaveError}</p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {isEditingProfile ? (
                  <>
                    <Button
                      onClick={handleCancelProfile}
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSavingProfile ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-zinc-800 hover:bg-zinc-700"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
            {/* Personal Information */}
            <Card className="bg-zinc-900 border-zinc-800 pb-6 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-zinc-300 pb-[5px]">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditingProfile}
                      className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-zinc-300 pb-[5px]">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditingProfile}
                      className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="displayName" className="text-zinc-300 pb-[5px]">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    disabled={!isEditingProfile}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                    placeholder="Enter display name"
                  />
                </div>

                <div>
                  <Label htmlFor="biography" className="text-zinc-300 pb-[5px]">Biography</Label>
                  <textarea
                    id="biography"
                    value={profileData.biography}
                    onChange={(e) => handleInputChange('biography', e.target.value)}
                    disabled={!isEditingProfile}
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gaming Preferences */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Gaming Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Label htmlFor="favoriteGame" className="text-zinc-300 pb-[5px]">Favorite Game</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <Input
                    id="favoriteGame"
                      value={gameSearchQuery}
                      onChange={(e) => {
                        setGameSearchQuery(e.target.value)
                        handleInputChange('favoriteGame', e.target.value)
                        setShowGameDropdown(true)
                      }}
                      onFocus={() => isEditingProfile && setShowGameDropdown(true)}
                      onBlur={() => setTimeout(() => setShowGameDropdown(false), 200)}
                      disabled={!isEditingProfile}
                      className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60 pl-10"
                      placeholder="Search for a game..."
                    />
                  </div>
                  
                  {/* Game dropdown */}
                  <AnimatePresence>
                    {isEditingProfile && showGameDropdown && filteredGamesForDropdown.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
                      >
                        {filteredGamesForDropdown.map((game: any) => (
                          <button
                            key={game.id}
                            type="button"
                            onClick={() => handleGameSelect(game.name)}
                            className="w-full text-left px-4 py-2 hover:bg-zinc-700 text-white text-sm transition-colors flex items-center space-x-2"
                          >
                            <Gamepad2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{game.name}</div>
                              {game.developer && (
                                <div className="text-xs text-zinc-400 truncate">{game.developer}</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <Label className="text-zinc-300">Gaming Platforms</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => {
                          if (!isEditingProfile) return
                          const platforms = profileData.gamingPlatforms.includes(platform)
                            ? profileData.gamingPlatforms.filter(p => p !== platform)
                            : [...profileData.gamingPlatforms, platform]
                          handleInputChange('gamingPlatforms', platforms)
                        }}
                        disabled={!isEditingProfile}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          profileData.gamingPlatforms.includes(platform)
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        } ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
