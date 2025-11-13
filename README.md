# Netflix Clone

A full-stack Netflix clone implementation featuring user authentication, profile management, video streaming with progress tracking, and an interactive content feed.

**Authors:** Yahav Dahan & Nadav Idelsohn

## Features

### Core Functionality
- **User Authentication**: Secure sign-up and login with bcrypt password hashing
- **Profile Management**: Multiple profiles per user account with custom avatars
- **Video Player**: Custom HTML5 video player with:
  - Episode navigation for series
  - Watch progress tracking and synchronization
  - Resume playback from last position
  - Quality selection and source management
  - Custom video controls
- **Content Catalog**: Browse movies and TV series with detailed metadata
- **Saved Content**: Like/save content to user profiles
- **Watch History**: Track viewing history and statistics per profile
- **Session Management**: Cookie-based authentication with secure sessions

### Technical Features
- RESTful API architecture
- MongoDB database with Mongoose ODM
- Real-time progress synchronization
- External video source integration
- Admin tools for content import
- CORS-enabled for frontend-backend separation

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** (comes with Node.js)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ex_1_web_dev
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
The project includes a `.env` file with default settings:
```env
MONGO_ADDRESS=mongodb://127.0.0.1:27017
MONGO_DB_NAME=netflix
SERVER_PORT=3000
```

Modify these values if needed for your environment.

### 4. Start MongoDB
Ensure MongoDB is running on your system:
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Run the Server
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured port).

### 6. Access the Application
Open your browser and navigate to the frontend files:
- **Login**: `view/auth/login.html`
- **Sign Up**: `view/auth/sign-up.html`
- **Feed**: `view/feed/feed.html` (requires authentication)
- **Video Player**: `view/video-player/video-player.html`

**Note**: Use a local development server (like Live Server in VS Code) to serve the frontend files on `http://localhost:5500` for proper CORS functionality.

## Project Structure

```
ex_1_web_dev/
├── server.js                      # Express server entry point
├── package.json                   # Project dependencies and scripts
├── .env                          # Environment configuration
│
├── controllers/                   # Request handlers
│   ├── user_controller.js        # User authentication logic
│   ├── profile_controller.js     # Profile management
│   ├── video_controller.js       # Video playback & progress
│   ├── saved_content_controller.js
│   ├── content_catalog_controller.js
│   └── log_controller.js
│
├── models/                        # Data layer
│   ├── data.js                   # Sample video content data
│   ├── schemas/                  # MongoDB schemas
│   │   ├── user_schema.js
│   │   ├── profile_schema.js
│   │   ├── video_sources_schema.js
│   │   ├── watch_progress_schema.js
│   │   ├── saved_content_schema.js
│   │   ├── content_catalog_schema.js
│   │   ├── session_schema.js
│   │   └── log_schema.js
│   └── services/                 # Business logic
│       ├── user_service.js
│       ├── profile_service.js
│       ├── video_service.js
│       ├── saved_content_service.js
│       ├── content_catalog_service.js
│       ├── session_service.js
│       └── log_service.js
│
├── routes/                        # API endpoints
│   └── api/
│       ├── user_routes.js        # /api/users
│       ├── profile_routes.js     # /api/profiles
│       ├── video_routes.js       # /api/video
│       ├── saved_content_routes.js
│       ├── content_catalog_routes.js
│       └── log_routes.js
│
├── view/                          # Frontend files
│   ├── auth/                     # Authentication pages
│   │   ├── login.html
│   │   ├── sign-up.html
│   │   └── auth.js
│   ├── feed/                     # Content feed
│   │   ├── feed.html
│   │   └── feed.js
│   ├── profiles/                 # Profile selection
│   │   ├── profiles.html
│   │   ├── profiles-edit.html
│   │   └── profiles.js
│   ├── video-player/             # Video player components
│   │   ├── video-player.html
│   │   ├── video-player.js       # Main player logic
│   │   ├── video-player.css
│   │   ├── video-controls.js     # Custom controls
│   │   ├── episode-manager.js    # Episode navigation
│   │   └── progress-sync.js      # Progress tracking
│   ├── styles.css                # Global styles
│   ├── utils.js                  # Frontend utilities
│   └── APIUsage.js               # API client wrapper
│
├── admin/                         # Admin tools
│   ├── populate-videos.js        # Database seeding
│   ├── video-import.html         # Import interface
│   └── video-import.js
│
└── images/                        # Static assets
    ├── icons/
    ├── profile_pictures/
    └── titles_images/
```

## Main Functions & Features

### Backend (Node.js/Express)

#### [`server.js`](server.js:1)
- Initializes Express application
- Configures middleware (CORS, JSON parsing, cookie parser)
- Connects to MongoDB database
- Registers API routes
- Serves static video files from `/videos` directory

#### Video Controller ([`controllers/video_controller.js`](controllers/video_controller.js:1))
Key functions:
- [`getWatchProgress()`](controllers/video_controller.js:24) - Retrieves user's watch progress for content
- [`saveWatchProgress()`](controllers/video_controller.js:63) - Saves current playback position
- [`markAsCompleted()`](controllers/video_controller.js:101) - Marks episode/movie as watched
- [`getVideoSources()`](controllers/video_controller.js:133) - Fetches available video sources
- [`getBestVideoSource()`](controllers/video_controller.js:172) - Returns highest quality source
- [`getContentEpisodes()`](controllers/video_controller.js:207) - Lists all episodes for series
- [`getRecentWatchHistory()`](controllers/video_controller.js:221) - User's viewing history
- [`getWatchStatistics()`](controllers/video_controller.js:302) - Viewing analytics per profile

#### User Controller ([`controllers/user_controller.js`](controllers/user_controller.js:1))
- User registration with password hashing
- Login with session creation
- Logout and session management
- Profile-based authentication

### Frontend (Vanilla JavaScript)

#### Video Player ([`view/video-player/video-player.js`](view/video-player/video-player.js:1))
- Custom HTML5 video player implementation
- Integrates with backend API for progress tracking
- Handles video source loading and quality switching
- Manages playback state and user interactions

#### Episode Manager ([`view/video-player/episode-manager.js`](view/video-player/episode-manager.js:1))
- Episode list rendering for TV series
- Next/previous episode navigation
- Season selection
- Episode metadata display

#### Progress Sync ([`view/video-player/progress-sync.js`](view/video-player/progress-sync.js:1))
- Automatic progress saving at intervals
- Resume playback from last position
- Sync across devices using same profile
- Completion detection (90% threshold)

#### Video Controls ([`view/video-player/video-controls.js`](view/video-player/video-controls.js:1))
- Custom play/pause controls
- Volume management
- Fullscreen toggle
- Progress bar with seek functionality
- Time display

#### Authentication ([`view/auth/auth.js`](view/auth/auth.js:1))
- Login form handling
- Sign-up form validation
- Session cookie management
- Redirect logic after authentication

#### Feed ([`view/feed/feed.js`](view/feed/feed.js:1))
- Content catalog display
- Like/save functionality
- Content filtering and search
- Navigation to video player

## API Endpoints

### User Routes (`/api/users`)
- `POST /signup` - Create new user account
- `POST /login` - Authenticate user
- `POST /logout` - End session
- `GET /current` - Get current user info

### Profile Routes (`/api/profiles`)
- `GET /` - List user profiles
- `POST /` - Create new profile
- `PUT /:id` - Update profile
- `DELETE /:id` - Delete profile

### Video Routes (`/api/video`)
- `GET /progress/:contentId/:episodeId` - Get watch progress
- `POST /progress` - Save watch progress
- `POST /complete` - Mark as completed
- `GET /sources/:contentId/:episodeId` - Get video sources
- `GET /episodes/:contentId` - Get all episodes
- `GET /history` - Get watch history
- `GET /statistics` - Get viewing statistics

### Content Catalog Routes (`/api/content-catalog`)
- `GET /` - List all content
- `GET /:id` - Get content details
- `POST /` - Add new content (admin)

### Saved Content Routes (`/api/saved-content`)
- `GET /` - Get saved content for profile
- `POST /` - Save content to profile
- `DELETE /:contentId` - Remove saved content

## Database Schema

### Collections
- **users** - User accounts with hashed passwords
- **profiles** - User profiles with avatars and preferences
- **sessions** - Active user sessions
- **video_sources** - Video URLs and metadata
- **watch_progress** - Playback positions per user/profile
- **saved_content** - Liked/saved content per profile
- **content_catalog** - Movies and series metadata
- **logs** - System activity logs

## Development

### Running in Development Mode
The project uses `nodemon` for auto-reloading:
```bash
npm start
```

### Adding Video Content
Use the admin import tool at [`admin/video-import.html`](admin/video-import.html:1) or run the population script:
```bash
node admin/populate-videos.js
```

## Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcrypt** - Password hashing
- **cookie-parser** - Session management
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript** - No frameworks
- **HTML5 Video API** - Video playback
- **CSS3** - Styling and animations
- **Fetch API** - HTTP requests

## License

ISC

## Support

For issues or questions, please refer to the documentation files:
- [`QUICK_START.md`](QUICK_START.md:1) - Quick setup guide
- [`VIDEO_SETUP_GUIDE.md`](VIDEO_SETUP_GUIDE.md:1) - Video player setup
- [`COMPLETE_VIDEO_SETUP_STEPS.md`](COMPLETE_VIDEO_SETUP_STEPS.md:1) - Detailed video implementation
- [`CONTENT_IMPORT_README.md`](CONTENT_IMPORT_README.md:1) - Content import instructions