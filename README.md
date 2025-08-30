# RAGAR Gaming AI Frontend 🎮⚡

Modern React + TypeScript frontend for the RAGAR gaming AI assistant with neural-network powered gaming intelligence.

## 🎯 Project Overview

RAGAR (Relative Augmented Gaming Agent Resource) frontend provides:

- **🧠 Intelligent Gaming Interface**: AI-powered gaming assistance with neural learning
- **🎮 Multi-Game Support**: Seamless integration with major gaming platforms
- **🔐 Secure Authentication**: JWT-based user management with gaming account linking
- **⚡ Real-time Features**: GraphQL subscriptions for live gaming data
- **🎨 Modern UI/UX**: Beautiful, responsive design with advanced theming system

## 🏗️ Tech Stack

- **React 18** + **TypeScript** - Modern component-based architecture
- **Vite** - Lightning-fast development and building
- **Apollo Client** - GraphQL client with caching and real-time features
- **Tailwind CSS** - Utility-first styling framework
- **Lucide React** - Beautiful, customizable icons
- **Framer Motion** - Smooth animations and transitions

## 📋 Repository Information

- **Directory**: `/client`
- **GitHub Repository**: `git@github.com:dougie84mo/ragar-gamer-ai-client.git`
- **Production Domain**: `ai-gamer.pro`
- **Backend API**: Connects to `api.ai-gamer.pro` (production) or `localhost:4000` (development)

## 🚀 Development Setup

### 1. **Install Dependencies**
```bash
cd client
npm install
```

### 2. **Environment Configuration**

The frontend automatically loads environment variables based on the mode:

#### Development (`.env.development`)
```env
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=RAGAR Gaming AI
VITE_APP_VERSION=2.0.0
```

#### Production (`.env.production`)
```env
VITE_API_URL=https://api.ai-gamer.pro
VITE_APP_NAME=RAGAR Gaming AI
VITE_APP_VERSION=2.0.0
```

### 3. **Start Development Server**
```bash
npm run dev
```

This starts the frontend on `http://localhost:5173` and connects to the backend at `http://localhost:4000`.

### 4. **Build for Production**
```bash
npm run build
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
```

## 📁 Project Structure

```
client/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (buttons, modals, etc.)
│   │   ├── GameAuthModal.tsx # Gaming authentication modal
│   │   └── Navigation.tsx    # Main navigation component
│   ├── pages/               # Main application pages
│   │   ├── auth/            # Authentication pages
│   │   ├── ChatPage.tsx     # AI chat interface
│   │   ├── DashboardPage.tsx # User dashboard
│   │   ├── GamesPage.tsx    # Game management
│   │   └── HomePage.tsx     # Landing page
│   ├── lib/
│   │   ├── apollo.ts        # GraphQL client configuration
│   │   └── utils.ts         # Utility functions
│   ├── assets/              # Static assets
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── .env.development         # Development environment variables
├── .env.production          # Production environment variables
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── vite.config.ts           # Vite build configuration
```

## 🌐 API Integration

### GraphQL Client (Apollo)

The frontend uses Apollo Client for GraphQL communication:

```typescript
// Automatic authentication headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('ragar-auth-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
})
```

### REST API Endpoints

Some features use REST endpoints for better compatibility:

```typescript
// Game authentication initiation
const response = await fetch(`${backendUrl}/api/auth/gaming/${game.id}/initiate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## 🎨 UI Features & Theme System

### Light/Dark Mode Theme System

The RAGAR frontend features a comprehensive theming system that provides optimal user experience across different environments and preferences.

#### **Theme Options**
- **🌞 Light Mode**: Clean, professional appearance with white backgrounds and dark text
- **🌙 Dark Mode**: Eye-friendly design with black backgrounds and light text  
- **💻 System Mode**: Automatically follows your operating system's theme preference

#### **Technical Implementation**
- **Modern CSS**: Uses the latest `light-dark()` CSS function for efficient theme switching
- **React Context**: `ThemeContext` manages theme state with localStorage persistence
- **Performance Optimized**: CSS-based switching without component re-renders
- **Accessibility**: WCAG-compliant color contrast ratios in both themes

#### **Theme Persistence**
- User preference automatically saved to localStorage
- Theme setting preserved across browser sessions
- System mode dynamically responds to OS preference changes

#### **Visual Consistency**
- **Page Backgrounds**: All pages (Dashboard, Home, Chat, Games, Admin, Auth) follow theme rules
- **Component Theming**: Cards, modals, dropdowns, buttons, and error messages are theme-aware
- **Navigation**: Search bar and settings dropdown adapt to current theme
- **Special Cases**: Admin page maintains readability with dark text inputs in all themes

#### **How to Use**
1. Click your profile in the top-right navigation
2. Open the Settings dropdown
3. Choose from Light/Dark/System theme options
4. Changes apply instantly across the entire application

#### **Developer Notes**
- Theme variables defined in `client/src/index.css` using CSS custom properties
- Theme context located in `client/src/contexts/ThemeContext.tsx`
- All components use semantic CSS classes for consistent theming
- Easy to extend with additional themes or color schemes

### 🎨 Theme Design Standards

> **For Future Developers**: Follow these standards to maintain consistent theming across all RAGAR components

#### **📋 Core Principles**

1. **Always Use Semantic Classes**: Use theme-aware classes, never hardcode colors
2. **Test Both Themes**: Verify functionality in light, dark, and system modes
3. **Maintain Contrast**: Ensure WCAG-compliant accessibility in both themes
4. **Component Consistency**: All new components must follow established patterns

#### **🎯 Color Class Standards**


```css
/* Primary text - main content, headings */
.text-primary { color: var(--text-primary); }    /* Black in light, White in dark */

/* Secondary text - descriptions, labels */
.text-secondary { color: var(--text-secondary); } /* Gray-600 in light, Gray-400 in dark */

/* Muted text - placeholders, disabled states */
.text-muted-foreground { color: var(--text-muted); } /* Gray-400 in light, Gray-600 in dark */
```

##### **Background Colors** *(Standardized)*
```css
/* Page backgrounds */
.page-background { background: var(--bg-primary); } /* Pure white/black */

/* Card and modal backgrounds */
.bg-card { background: var(--bg-card); }           /* White/Dark-card */

/* Hover states and input backgrounds */
.bg-card-hover { background: var(--bg-card-hover); } /* Light-gray/Darker-card */
```

##### **Border Colors** *(Consistent)*
```css
/* Standard borders for cards, inputs, modals */
.border-border { border-color: var(--border-border); }

/* Hover state borders */
.border-border-hover { border-color: var(--border-border-hover); }
```

#### **🚫 What NOT to Use**

**❌ Hardcoded Colors** *(These break theming)*
```css
/* DON'T DO THIS */
className="bg-white text-black"           /* Only works in light mode */
className="bg-zinc-900 text-white"       /* Only works in dark mode */
className="border-gray-300"              /* Doesn't adapt to themes */
```

**❌ Manual Dark Mode Classes** *(Avoid when possible)*
```css
/* AVOID - Use semantic classes instead */
className="text-gray-900 dark:text-white"
className="bg-white dark:bg-gray-800"
```

#### **✅ Correct Usage Patterns**

##### **Modal Components**
```tsx
// ✅ CORRECT - Theme-aware modal
<Modal className="bg-card border-border">
  <h2 className="text-primary">Title</h2>
  <p className="text-secondary">Description</p>
</Modal>
```

##### **Card Components**
```tsx
// ✅ CORRECT - Adaptive card styling
<Card className="bg-card border-border hover:border-border-hover">
  <CardTitle className="text-primary">Game Name</CardTitle>
  <CardDescription className="text-secondary">Game details</CardDescription>
</Card>
```

##### **Button Components**
```tsx
// ✅ CORRECT - Use button variants, not custom colors
<Button variant="default">Primary Action</Button>     {/* Blue in both themes */}
<Button variant="outline">Secondary Action</Button>   {/* Themed outline */}
```

##### **Input Components**
```tsx
// ✅ CORRECT - Theme-aware inputs
<Input 
  className="bg-card-hover border-border text-primary placeholder-muted-foreground"
  placeholder="Search games..."
/>
```

#### **🎨 Status Colors** *(Use Sparingly)*

For status indicators that need specific colors across themes:

```css
/* Success states */
.text-green-600.dark\:text-green-400 { /* Green in both themes */ }

/* Warning states */
.text-yellow-600.dark\:text-yellow-400 { /* Yellow in both themes */ }

/* Error states */
.text-red-600.dark\:text-red-400 { /* Red in both themes */ }

/* Info states */
.text-blue-600.dark\:text-blue-400 { /* Blue in both themes */ }
```

#### **📱 Component Testing Checklist**

Before committing any UI component, verify:

- [ ] **Light Mode**: Component looks professional and readable
- [ ] **Dark Mode**: Component maintains eye comfort and contrast
- [ ] **System Mode**: Switches correctly with OS preference
- [ ] **Hover States**: Interactive elements provide clear feedback
- [ ] **Accessibility**: Text contrast meets WCAG guidelines
- [ ] **Semantic Classes**: No hardcoded color values used

#### **🔧 Adding New Theme Variables**

When extending the theme system:

1. **Define in CSS** (`src/index.css`):
```css
:root {
  --new-semantic-color: light-dark(#lightValue, #darkValue);
}
```

2. **Create CSS Class**:
```css
.new-semantic-class {
  color: var(--new-semantic-color);
}
```

3. **Document Usage**: Update this README with the new class and its purpose

#### **🎮 Gaming-Specific Theming**

For gaming-related UI elements:

- **Connection Status**: Use green for active, yellow for warnings, red for errors
- **Game Icons**: Maintain visibility in both themes with proper contrast
- **Gaming Metrics**: Use consistent number styling across light/dark modes
- **Achievement Badges**: Ensure colors remain vibrant but accessible

#### **📚 Theme Testing Tools**

```bash
# Test theme switching during development
# 1. Toggle theme using navigation settings
# 2. Use browser dev tools to simulate system preference changes
# 3. Test with accessibility tools for contrast ratios
```

#### **🐛 Common Theme Issues & Solutions**

**Issue**: Text invisible in one theme
**Solution**: Replace hardcoded colors with `.text-primary` or `.text-secondary`

**Issue**: Borders don't show in dark mode
**Solution**: Use `.border-border` instead of `.border-gray-*`

**Issue**: Hover states break theme consistency
**Solution**: Use `.bg-card-hover` and themed hover classes

**Issue**: Modal appears wrong in light mode
**Solution**: Ensure modal uses `.bg-card` and semantic text classes

## 🎯 UX/UI Design Patterns & Standards

> **For Future Developers**: These patterns ensure consistent, user-friendly interactions across all RAGAR interfaces

### **📋 Modal Design Standards**

#### **✅ Modal Header Structure**
Every modal should include a Cancel button at the top for easy escape:

```tsx
// ✅ CORRECT - Modal with top-level Cancel button
<div className="flex justify-between items-center mb-6">
  <h2 className="text-xl font-bold text-primary">
    {isEditing ? '✏️ Edit Item' : '➕ Add New Item'}
  </h2>
  <button
    type="button"
    onClick={onClose}
    className="text-secondary hover:text-primary font-medium px-3 py-1 rounded-md hover:bg-card-hover"
  >
    Cancel
  </button>
</div>
```

#### **🎯 Modal UX Requirements**
- **Instant Exit**: Cancel button always visible at top-right
- **Consistent Styling**: Use theme-aware colors and hover states
- **Visual Hierarchy**: Title on left, Cancel on right
- **Accessibility**: Clear focus states and keyboard navigation

### **🔍 Autocomplete Search Standards**

#### **✅ Enhanced Click-Outside Behavior**
All autocomplete fields must close when focus is lost:

```tsx
// ✅ CORRECT - Proper focus and blur handling
<div id="search-container">
  <Input
    onFocus={() => setShowDropdown(true)}
    onBlur={handleSearchBlur}  // Delayed close for click handling
    onChange={(e) => {
      setSearchValue(e.target.value)
      setShowDropdown(true)
    }}
  />
  {showDropdown && (
    <div className="dropdown-content">
      {/* Search results */}
    </div>
  )}
</div>

// Enhanced blur handler with delay for dropdown clicks
const handleSearchBlur = () => {
  setTimeout(() => setShowDropdown(false), 150)
}

// Click-outside handler for immediate close
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const container = event.target.closest('#search-container')
    if (!container) {
      setShowDropdown(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
```

#### **🔍 Single-Select Autocomplete Pattern**
For selecting one item (e.g., Game Company):

```tsx
// ✅ CORRECT - Simple autocomplete with clear selection
<div id="game-company-container">
  <Input
    value={searchValue}
    placeholder="Search for game company..."
    onFocus={() => setShowDropdown(true)}
    onBlur={handleBlur}
  />
  {showDropdown && (
    <div className="dropdown">
      {providers.map(provider => (
        <div
          onClick={() => {
            setSelectedValue(provider.id)
            setSearchValue(provider.displayName)
            setShowDropdown(false)
          }}
        >
          {provider.displayName}
        </div>
      ))}
    </div>
  )}
</div>
```

#### **🏷️ Multi-Select Autocomplete Pattern**
For selecting multiple items (e.g., Platforms):

```tsx
// ✅ CORRECT - Multi-select with badge management
<div id="platform-container">
  {/* Selected Items Display */}
  {selectedItems.length > 0 && (
    <div className="mb-3 p-3 bg-card border border-border rounded-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-primary">
          Selected Platforms: ({selectedItems.length} selected)
        </span>
        <button
          onClick={() => setSelectedItems([])}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedItems.map(item => (
          <Badge 
            key={item.id}
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1"
          >
            <span className="mr-2">{item.displayName}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="ml-1 hover:text-red-600 font-bold text-sm"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )}

  {/* Search Input */}
  <Input
    value={searchValue}
    placeholder={
      selectedItems.length > 0 
        ? "Search to add more platforms..." 
        : "Search and select platforms..."
    }
    onFocus={() => setShowDropdown(true)}
    onBlur={handleBlur}
  />

  {/* Dropdown Results */}
  {showDropdown && (
    <div className="dropdown">
      {/* Available items (not selected) */}
      {availableItems.map(item => (
        <div
          onClick={() => addItem(item)}
          className="cursor-pointer hover:bg-card-hover"
        >
          <div className="flex justify-between">
            <span>{item.displayName}</span>
            <span className="text-green-600 font-bold">+</span>
          </div>
        </div>
      ))}
      
      {/* Already selected items (visual feedback) */}
      {selectedItems.map(item => (
        <div className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
          <div className="flex justify-between">
            <span>{item.displayName}</span>
            <span className="text-blue-600 font-bold">✓ Selected</span>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

### **🎨 Badge System Standards**

#### **✅ Multi-Select Badge Requirements**
- **Clear Visual Hierarchy**: Selected items in dedicated container above search
- **Individual Removal**: Each badge has × button for removal
- **Bulk Operations**: "Clear All" button for reset
- **Status Indicators**: Different colors for different states
- **Theme Compatibility**: Proper light/dark mode support

```css
/* Standard badge styling */
.badge-selected {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1;
}

.badge-remove-button {
  @apply ml-1 hover:text-red-600 font-bold text-sm cursor-pointer;
}
```

### **📝 Form Design Standards**

#### **✅ Label and Input Spacing**
Proper spacing between labels and inputs for better readability:

```tsx
// ✅ CORRECT - Proper spacing and styling
<div>
  <Label className="text-primary font-medium mb-2 block">
    Field Name
  </Label>
  <Input 
    className="bg-input text-input border-border"
    placeholder="Enter value..."
  />
</div>
```

#### **🎯 Form Field Requirements**
- **Labels**: Always use `mb-2` spacing, `text-primary`, and `font-medium`
- **Inputs**: Use theme-aware classes (`bg-input`, `text-input`, `border-border`)
- **Help Text**: Include contextual guidance below complex fields
- **Validation**: Consistent error styling across all forms

### **🔧 Interactive Element Standards**

#### **✅ Click-Outside Behavior Requirements**
All interactive dropdowns and modals must:

1. **Close on Outside Click**: Use proper event handling
2. **Delayed Blur**: Allow time for dropdown interactions
3. **Container-Based Detection**: Use ID-based targeting for accuracy
4. **Keyboard Support**: ESC key should close dropdowns/modals

#### **✅ Hover State Standards**
All interactive elements must provide clear feedback:

```css
/* Button hover states */
.interactive-button {
  @apply hover:bg-card-hover transition-colors duration-200;
}

/* Card hover states */
.interactive-card {
  @apply hover:border-border-hover transition-all duration-200;
}
```

### **📱 Responsive Design Patterns**

#### **✅ Admin Interface Standards**
- **Grid Layouts**: Use responsive grid for form fields
- **Mobile Compatibility**: Ensure forms work on smaller screens
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Overflow Handling**: Proper scrolling for long forms

### **🎮 Gaming-Specific UX Patterns**

#### **✅ Connection Status Display**
- **Visual Indicators**: Clear connected/disconnected states
- **Status Colors**: Green (connected), Yellow (warning), Red (error)
- **Real-time Updates**: Live status changes without page refresh
- **Action Buttons**: Clear "Connect", "Disconnect", "Refresh" options

#### **✅ Game Selection Patterns**
- **Autocomplete Search**: Fast filtering of large game libraries
- **Visual Previews**: Game icons or fallback text representations
- **Provider Grouping**: Clear separation between platforms and game companies
- **Multi-Platform Support**: Badge system for games on multiple platforms

### **🧪 UX Testing Checklist**

Before deploying any interactive component:

- [ ] **Modal Navigation**: Can user easily exit with Cancel button?
- [ ] **Autocomplete Behavior**: Dropdowns close properly on focus loss?
- [ ] **Click-Outside Handling**: Interactions don't get stuck open?
- [ ] **Badge Management**: Multi-select items clearly displayed and removable?
- [ ] **Theme Compatibility**: Component works in light and dark modes?
- [ ] **Mobile Responsiveness**: Touch interactions work properly?
- [ ] **Keyboard Navigation**: Tab, Enter, ESC keys work as expected?
- [ ] **Loading States**: Proper feedback during async operations?

### **🚫 UX Anti-Patterns to Avoid**

**❌ Persistent Dropdowns**: Never leave autocomplete dropdowns open when focus is lost
**❌ Missing Cancel Options**: Always provide easy escape routes in modals
**❌ Unclear Multi-Selection**: Don't hide selected items or make removal difficult
**❌ Theme Inconsistency**: Avoid hardcoded colors that break in light/dark modes
**❌ Poor Touch Targets**: Don't make interactive elements too small for mobile
**❌ Confusing Status**: Always provide clear visual feedback for user actions

---

*These UX patterns ensure RAGAR maintains professional, intuitive interfaces that work seamlessly across all devices and themes.*

## 🎮 Gaming Features

### Multi-Platform Authentication
- **Destiny 2** (Bungie API) - Full OAuth integration
- **Battle.net** (Blizzard) - WoW, Diablo, etc.
- **Steam** - OpenID authentication
- **Epic Games** - OAuth integration
- **Path of Exile** - API integration ready

### AI-Powered Features
- **Neural Gaming Intelligence** - Context-aware assistance
- **Cross-Game Insights** - Learn from multiple gaming experiences
- **Real-time Strategy Recommendations** - Dynamic gameplay advice
- **Character Optimization** - AI-driven build suggestions

## 🚀 Deployment

### Production Deployment

Deploy to `ai-gamer.pro`:

```bash
# From project root
./deploy-all.sh frontend

# Or from client directory
./deploy.sh
```

### Environment Variables

Production deployment uses:
- `VITE_API_URL=https://api.ai-gamer.pro`
- Automatic SSL/HTTPS configuration
- CDN optimization for static assets

## 🔍 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Verify backend is running on port 4000
   - Check `VITE_API_URL` environment variable
   - Ensure CORS is configured properly

2. **Authentication Issues**
   - Clear browser localStorage: `localStorage.clear()`
   - Check JWT token expiration
   - Verify backend authentication service

3. **Build Errors**
   - Run `npm install` to update dependencies
   - Check TypeScript errors with `npm run type-check`
   - Clear Vite cache: `rm -rf node_modules/.vite`

### Development Mode

Enable detailed logging:
```typescript
localStorage.setItem('debug', 'ragar:*')
```

## 📞 Support

- **Documentation**: Review this README and backend documentation
- **GraphQL Playground**: `http://localhost:4000/graphql` (development)
- **API Documentation**: `http://localhost:4000/docs` (development)

---

*RAGAR Gaming AI Frontend - The next generation of intelligent gaming interfaces* 🧠🎮

