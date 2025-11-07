# Netflix Clone - Assignment 2

A client-side Netflix clone implementation featuring user authentication, profile selection, and interactive content feed with like functionality.

## Project Structure

```
ex_1_web_dev/
├── index.html          # Login page
├── profiles.html       # Profile selection page  
├── menu.html          # Feed page (main content)
├── styles.css         # All styling
├── js/
│   ├── data.js        # Content catalog and profiles data
│   ├── utils.js       # Utility functions and localStorage management
│   ├── auth.js        # Authentication and user management
│   └── feed.js        # Feed functionality (likes, search, sorting)
├── images/            # Profile pictures and assets
└── README.md          # This file
```

## Features Implementation

### ✅ Login Page (index.html)
- **Email validation**: Proper email format required
- **Password validation**: Minimum 6 characters
- **Error messages**: Display under relevant fields
- **localStorage**: Saves authentication state
- **Relative redirect**: Navigate to profiles.html

### ✅ Profiles Page (profiles.html)
- **Predefined profiles**: JavaScript array with 5 profiles
- **Profile selection**: Click to select and save to localStorage
- **Navigation**: Redirect to feed page (menu.html)
- **Visual feedback**: Hover effects and selection confirmation

### ✅ Feed Page (menu.html)
- **Dynamic content**: Built from JavaScript catalog
- **Personalized greeting**: "Hello, [Profile Name]"
- **Content catalog**: Movies and series with dummy data

#### Like Functionality
- **Like button**: Toggle like state with visual feedback
- **Heart animation**: Pulse effect on like
- **Like counter**: Real-time count updates
- **localStorage persistence**: Maintains likes across sessions

#### Search Functionality
- **Real-time search**: Filter content as you type
- **Search categories**: Name, genre, type
- **Search feedback**: Display result count
- **Clear search**: Reset to show all content

#### Alphabetical Sorting
- **Sort toggle**: Switch between normal and A-Z order
- **Visual indicator**: Button state shows current sort
- **Combined with search**: Sorting works with filtered results

### ✅ User Experience
- **Modern UI**: Toast notifications instead of alert()
- **Animations**: Smooth transitions and effects
- **Responsive design**: Mobile-friendly layout
- **Logout functionality**: Clear data and return to login

## Technical Implementation

### Data Structure
```javascript
// Content catalog
const contentCatalog = [
  {
    id: 1,
    name: "Stranger Things",
    year: 2016,
    genre: "Sci-Fi", 
    likes: 1250,
    type: "series"
  }
  // ... more content
];

// Profiles data
const profiles = [
  { id: 1, name: "Yahav", image: "images/profile picture 1.jfif" }
  // ... more profiles
];
```

### localStorage Management
- **Authentication state**: User login status and email
- **Selected profile**: Current profile ID and name
- **Liked content**: Array of liked content IDs
- **Like counts**: Updated like counts per content

### Validation Rules
- **Email**: Must match regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Password**: Minimum 6 characters required
- **Error display**: Real-time validation with clear error messages

## Usage Instructions

1. **Login**: 
   - Open `index.html`
   - Enter valid email and password (min 6 chars)
   - Click "Sign In"

2. **Select Profile**:
   - Choose from 5 available profiles
   - Click on profile card to select

3. **Browse Content**:
   - View content catalog in grid layout
   - Use search bar to filter content
   - Toggle alphabetical sorting
   - Like/unlike content items
   - Logout when finished

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Styling, animations, responsive design
- **Bootstrap 5.3.0**: CSS framework for responsive layout
- **Vanilla JavaScript**: Client-side functionality only
- **localStorage**: Data persistence without backend

## Assignment Compliance

### ✅ Required Features
- [x] Email validation with proper format
- [x] Password validation (6+ characters)
- [x] Error messages under input fields
- [x] localStorage for authentication state
- [x] Relative redirect to feed page
- [x] Predefined profiles array
- [x] Profile selection with localStorage
- [x] Dynamic feed from JavaScript catalog
- [x] Like functionality with counter and persistence
- [x] Visual effects on like (heart animation)
- [x] Search functionality
- [x] Alphabetical sorting
- [x] Personalized greeting display
- [x] Logout with localStorage cleanup

### ✅ Technical Requirements
- [x] Client-side JavaScript only (no backend)
- [x] HTML, CSS, Bootstrap, JavaScript only
- [x] No external libraries beyond allowed ones
- [x] DOM manipulation and event handling
- [x] localStorage data persistence

### 🔄 Git Workflow (To be implemented)
- [ ] Private repository setup
- [ ] Feature branch strategy
- [ ] Pull request workflow
- [ ] Team collaboration with different PR approvers

## Testing Checklist

- [x] Login validation with various email formats
- [x] Password validation edge cases
- [x] Profile selection and navigation flow
- [x] Feed content loading and display
- [x] Like functionality and persistence
- [x] Search accuracy and real-time filtering
- [x] Alphabetical sorting correctness
- [x] localStorage data integrity
- [x] Logout functionality
- [x] Responsive design verification

## Known Features

1. **Modern UX**: Uses toast notifications instead of alert()
2. **Smooth animations**: CSS transitions and JavaScript animations
3. **Responsive design**: Works on mobile and desktop
4. **Data persistence**: Maintains user state across sessions
5. **Real-time feedback**: Immediate response to user actions

## Next Steps for Git Workflow

1. Initialize Git repository (private)
2. Create feature branches:
   - `feature/login-validation`
   - `feature/profile-selection`
   - `feature/feed-implementation`
   - `feature/like-system`
   - `feature/search-functionality`
3. Implement pull request workflow
4. Document Git strategy in PDF as required

This implementation meets all minimum requirements and includes additional features for a high-quality user experience.