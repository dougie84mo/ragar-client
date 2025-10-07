import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { gql } from '@apollo/client'

// HTTP link to GraphQL server
const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/graphql/`,
})

// Auth link to include JWT token in headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('ragar-auth-token')
  console.log('🔐 RAGAR Client: Auth link - token exists:', !!token)
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
})

// Error link for handling GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `🧠 RAGAR GraphQL Error: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
      
      // Handle authentication errors
      if (message.includes('Not authenticated') || message.includes('Invalid or expired token') || message.includes('jwt expired')) {
        console.error('🔐 RAGAR: Authentication error detected:', message)
        console.error('🔐 RAGAR: Current token:', localStorage.getItem('ragar-auth-token') ? 'exists' : 'missing')
        console.warn('🔐 RAGAR: Clearing token and redirecting to login')
        localStorage.removeItem('ragar-auth-token')
        // Add a small delay to allow any pending UI updates to complete
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 100)
      }
    })
  }

  if (networkError) {
    console.error(`🧠 RAGAR Network Error: ${networkError}`)
    
    // Handle different network error types
    if (networkError.message.includes('Failed to fetch')) {
      console.error('🧠 RAGAR: Backend server appears to be offline')
    }
  }
})

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          gameProgress: {
            merge(_, incoming) {
              return incoming
            }
          }
        }
      },
      Query: {
        fields: {
          chatSessions: {
            merge(_, incoming) {
              return incoming
            }
          },
          builds: {
            merge(_, incoming) {
              return incoming
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})

// Helper functions for token management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('ragar-auth-token')
}

export const setAuthToken = (token: string): void => {
  console.log('🔐 RAGAR Client: Setting auth token, length:', token.length)
  localStorage.setItem('ragar-auth-token', token)
  console.log('🔐 RAGAR Client: Token stored successfully')
}

export const removeAuthToken = (): void => {
  console.log('🔐 RAGAR Client: Removing auth token')
  localStorage.removeItem('ragar-auth-token')
  // Clear Apollo cache on logout
  apolloClient.resetStore()
}

export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  return !!token
}

// GraphQL type definitions for TypeScript
export interface AuthPayload {
  token: string
  refreshToken: string
  user: User
}

export interface User {
  id: string
  username: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl?: string
  preferredGames: string[]
  gamingProfiles?: any // JSON field from backend
  isVerified: boolean // Changed from emailVerified
  lastLogin?: string // Changed from lastLoginAt
  isActive: boolean
  createdAt: string
  linkedGames?: Record<string, string>
}

export interface AuthResponse {
  success: boolean
  message: string
}

// Export the client as default
export default apolloClient

// GraphQL Mutations
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      token
      refreshToken
      user {
        id
        username
        email
        firstName
        lastName
        avatarUrl
        preferredGames
        isVerified
        isActive
        createdAt
        lastLogin
      }
      error
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      token
      refreshToken
      user {
        id
        username
        email
        firstName
        lastName
        avatarUrl
        preferredGames
        isVerified
        isActive
        createdAt
      }
      error
    }
  }
`

export const GOOGLE_AUTH_MUTATION = gql`
  mutation GoogleAuth($input: GoogleAuthInput!) {
    googleAuth(input: $input) {
      success
      token
      refreshToken
      user {
        id
        username
        email
        firstName
        lastName
        avatarUrl
        preferredGames
        isVerified
        isActive
        createdAt
      }
      error
      isNewUser
      generatedUsername
    }
  }
`

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
      user {
        id
        username
        email
        isVerified
      }
    }
  }
`

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`

// User Data Queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      firstName
      lastName
      avatarUrl
      preferredGames
      collectedGames {
        gameId
        dateAdded
        personalNotes
        userPromptName
        isActive
        priority
      }
      linkedGames
      gamingProfiles
      isVerified
      isActive
      createdAt
      lastLogin
    }
  }
`

export const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      username
      email
      firstName
      lastName
      avatarUrl
      preferredGames
      linkedGames
      gamingProfiles
      isVerified
      isActive
      createdAt
      lastLogin
    }
  }
`

export const CHECK_USERNAME_AVAILABILITY = gql`
  query CheckUsernameAvailability($username: String!) {
    checkUsernameAvailability(username: $username) {
      available
      valid
      message
      suggestions
    }
  }
`

// Game Connection Mutations
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUserProfile(input: $input) {
      id
      username
      email
      firstName
      lastName
      avatarUrl
      preferredGames
      gamingProfiles
      isVerified
      isActive
    }
  }
`

export const UPDATE_PREFERRED_GAMES = gql`
  mutation UpdatePreferredGames($gameIds: [String!]!) {
    updatePreferredGames(gameIds: $gameIds) {
      id
      preferredGames
      gamingProfiles
    }
  }
`

// Game Collection Mutations
export const ADD_TO_GAME_COLLECTION = gql`
  mutation AddToGameCollection($input: AddToCollectionInput!) {
    addToGameCollection(input: $input) {
      id
      collectedGames {
        gameId
        dateAdded
        personalNotes
        userPromptName
        isActive
        priority
      }
    }
  }
`

export const UPDATE_GAME_COLLECTION_ENTRY = gql`
  mutation UpdateGameCollectionEntry($input: UpdateCollectionEntryInput!) {
    updateGameCollectionEntry(input: $input) {
      id
      collectedGames {
        gameId
        dateAdded
        personalNotes
        userPromptName
        isActive
        priority
      }
    }
  }
`

export const REMOVE_FROM_GAME_COLLECTION = gql`
  mutation RemoveFromGameCollection($gameId: String!) {
    removeFromGameCollection(gameId: $gameId) {
      id
      collectedGames {
        gameId
        dateAdded
        personalNotes
        userPromptName
        isActive
        priority
      }
    }
  }
`

export const GET_SUPPORTED_GAMES = gql`
  query GetSupportedGames {
    supportedGames {
      id
      name
      provider
      description
      iconUrl
      connectionType
      requiresOAuth
      scopes
      slug
      gameId
    }
  }
`

export const GET_ALL_GAMES = gql`
  query GetAllGames {
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
        genre
        categoryIds
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

export const GET_USER_PROVIDER_CONNECTIONS = gql`
  query GetUserProviderConnections {
    userProviderConnections {
      id
      providerId
      providerName
      providerDisplayName
      connectionType
      isActive
      connectedAt
      lastSuccessfulCall
      endpointBase
      environment
    }
  }
`

export const GET_GAMES_FROM_PROVIDER = gql`
  query GetGamesFromProvider($providerId: String!) {
    gamesFromProvider(providerId: $providerId) {
      slug
      name
      providerId
      providerName
      hasActiveConnection
      lastSyncedAt
      availableEndpoints
      supportedFeatures
    }
  }
`

export const INITIATE_PROVIDER_AUTH = gql`
  mutation InitiateProviderAuth($providerId: String!, $redirectUri: String!, $scopes: [String!]) {
    initiateProviderAuth(input: { providerId: $providerId, redirectUri: $redirectUri, scopes: $scopes }) {
      success
      authUrl
      state
      sessionId
      providerName
      error
    }
  }
`

export const COMPLETE_PROVIDER_AUTH = gql`
  mutation CompleteProviderAuth($providerId: String!, $code: String!, $state: String!) {
    completeProviderAuth(providerId: $providerId, code: $code, state: $state) {
      id
      providerId
      providerName
      isActive
      connectedAt
    }
  }
`

export const DISCONNECT_PROVIDER = gql`
  mutation DisconnectProvider($providerId: String!) {
    disconnectProvider(providerId: $providerId)
  }
`

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

export interface LoginInput {
  emailOrUsername: string
  password: string
}

export interface RegisterInput {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  confirmPassword: string
  agreedToTerms: boolean
}

// Remove old interfaces that don't match backend
export interface GameProgressInput {
  game: string
  level?: number
  playtimeHours?: number
  completedContent?: string[]
  currentGoals?: string[]
} 