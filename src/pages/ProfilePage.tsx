import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Camera, 
  Mail, 
  Calendar, 
  MapPin, 
  Globe, 
  Save, 
  Upload,
  Edit2,
  Trophy,
  Gamepad2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { usePageTitle } from '../hooks/usePageTitle'

interface ProfileData {
  profilePicture: string
  username: string
  displayName: string
  email: string
  biography: string
  location: string
  website: string
  joinDate: string
  favoriteGame: string
  gamingPlatforms: string[]
  timezone: string
}

const ProfilePage: React.FC = () => {
  usePageTitle('Profile')

  const [profileData, setProfileData] = useState<ProfileData>({
    profilePicture: '',
    username: 'guardian_user',
    displayName: 'Guardian',
    email: 'guardian@example.com',
    biography: 'Passionate gamer and AI enthusiast. Always looking for the next challenge and ways to optimize my gameplay.',
    location: 'Earth',
    website: '',
    joinDate: '2024-01-15',
    favoriteGame: 'Destiny 2',
    gamingPlatforms: ['PC', 'PlayStation'],
    timezone: 'UTC-5'
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfilePictureUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          handleInputChange('profilePicture', result)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    setIsEditing(false)
    console.log('✅ RAGAR: Profile updated:', profileData)
    // TODO: Implement actual API call to update profile
  }

  const handleCancel = () => {
    setIsEditing(false)
    // TODO: Reset form to original values
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-zinc-400">Manage your personal information and gaming preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
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
                onClick={() => setIsEditing(true)}
                className="bg-zinc-800 hover:bg-zinc-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture & Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
                    {isEditing && (
                      <button
                        onClick={handleProfilePictureUpload}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    )}
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

                {isEditing && (
                  <Button
                    onClick={handleProfilePictureUpload}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Picture
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-zinc-900 border-zinc-800 mt-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Gaming Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Favorite Game</span>
                  <span className="text-white font-medium">{profileData.favoriteGame}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Platforms</span>
                  <div className="flex space-x-1">
                    {profileData.gamingPlatforms.map((platform, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Member Since</span>
                  <span className="text-white font-medium">
                    {new Date(profileData.joinDate).getFullYear()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username" className="text-zinc-300">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={!isEditing}
                      className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName" className="text-zinc-300">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                      placeholder="Enter display name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-zinc-300 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="biography" className="text-zinc-300">Biography</Label>
                  <textarea
                    id="biography"
                    value={profileData.biography}
                    onChange={(e) => handleInputChange('biography', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location & Contact */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location & Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location" className="text-zinc-300 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                      placeholder="Enter your location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone" className="text-zinc-300">Timezone</Label>
                    <Input
                      id="timezone"
                      value={profileData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      disabled={!isEditing}
                      className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                      placeholder="e.g., UTC-5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website" className="text-zinc-300 flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                    placeholder="https://your-website.com"
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
                <div>
                  <Label htmlFor="favoriteGame" className="text-zinc-300">Favorite Game</Label>
                  <Input
                    id="favoriteGame"
                    value={profileData.favoriteGame}
                    onChange={(e) => handleInputChange('favoriteGame', e.target.value)}
                    disabled={!isEditing}
                    className="bg-zinc-800 border-zinc-700 text-white disabled:opacity-60"
                    placeholder="Enter your favorite game"
                  />
                </div>

                <div>
                  <Label className="text-zinc-300">Gaming Platforms</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => {
                          if (!isEditing) return
                          const platforms = profileData.gamingPlatforms.includes(platform)
                            ? profileData.gamingPlatforms.filter(p => p !== platform)
                            : [...profileData.gamingPlatforms, platform]
                          handleInputChange('gamingPlatforms', platforms)
                        }}
                        disabled={!isEditing}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          profileData.gamingPlatforms.includes(platform)
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
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
