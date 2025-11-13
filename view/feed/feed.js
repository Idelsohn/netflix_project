// Feed page functionality - likes, search, sorting, content display
import { APIUsage } from '../APIUsage.js';

class FeedManager {
    constructor() {
        this.apiUsage = new APIUsage();
        this.isAlphabeticalSort = false;
        this.activeCategory = 'home';
        this.init();
    }

    async init() {
        // Only initialize if we're on the feed page (feed.html)
        if (!window.location.pathname.includes('feed.html')) {
            return;
        }

        this.currentContent = await this.apiUsage.getContentCatalog();
        this.setupFeedPage();
        this.setupNavbarFiltering();
        this.loadUserDataFromMongoDB(); // Load user data from MongoDB first
        this.loadContent();
        this.setupEventListeners();
        this.showUserGreeting();
    }

    setupFeedPage() {
        // Update profile picture in navbar
        this.updateProfilePicture();
        
        // Add profile dropdown functionality
        this.setupProfileDropdown();
        
        // Add search icon functionality
        this.setupSearchIcon();
        
        // Find the body and add our feed content structure
        const body = document.querySelector('body');
        
        // Create main content container with Netflix-style layout
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        mainContent.innerHTML = `
            <div class="hero-section" id="heroSection">
                <!-- Random featured content will be loaded here -->
            </div>
            <div class="feed-header">
                <div class="user-greeting" id="userGreeting"></div>
                <div class="feed-controls">
                    <button class="alphabetical-sort-btn" id="sortAlphabetical">
                        <span>A-Z</span> Alphabetical Sort
                    </button>
                </div>
            </div>
            <div class="content-section" id="contentCategories">
                <!-- Dynamic category rows will be loaded here -->
            </div>
        `;

        // Insert after navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.parentNode.insertBefore(mainContent, navbar.nextSibling);
        } else {
            body.appendChild(mainContent);
        }
    }

    async updateProfilePicture() {
        const selectedProfileId = localStorage.getItem('selectedProfileId');
        const profileIcon = document.querySelector('.profile-icon');
        
        if (selectedProfileId && profileIcon) {
            const profile = await this.apiUsage.getProfileByID(selectedProfileId);
            if (profile) {
                profileIcon.src = "../../" + profile.image;
                profileIcon.alt = `${profile.profile_name} Profile`;
            }
        }
    }

    setupProfileDropdown() {
        const profileIcon = document.querySelector('.profile-icon');
        if (!profileIcon) return;

        // Create dropdown arrow
        const dropdownArrow = document.createElement('span');
        dropdownArrow.innerHTML = '▼';
        dropdownArrow.style.cssText = `
            color: white;
            font-size: 12px;
            margin-left: 5px;
            cursor: pointer;
        `;
        
        // Insert dropdown arrow after profile icon
        profileIcon.parentNode.insertBefore(dropdownArrow, profileIcon.nextSibling);

        // Create profile container for both icon and arrow
        const profileContainer = document.createElement('div');
        profileContainer.style.cssText = `
            display: flex;
            align-items: center;
            cursor: pointer;
            position: relative;
        `;
        
        // Wrap profile icon and arrow in container
        const parent = profileIcon.parentNode;
        parent.insertBefore(profileContainer, profileIcon);
        profileContainer.appendChild(profileIcon);
        profileContainer.appendChild(dropdownArrow);

        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: #141414;
            border: 1px solid #333;
            border-radius: 4px;
            min-width: 120px;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        
        dropdown.innerHTML = `
            <div class="dropdown-item change-profile-option" style="
                padding: 6px 10px;
                cursor: pointer;
                color: white;
                font-size: 12px;
                font-weight: 400;
                text-align: center;
                border-bottom: 1px solid #333;
                transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='#333'" onmouseout="this.style.backgroundColor='transparent'">
                switch profile
            </div>
            <div class="dropdown-item logout-option" style="
                padding: 6px 10px;
                cursor: pointer;
                color: #e50914;
                font-size: 12px;
                font-weight: 400;
                text-align: center;
                transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='#333'" onmouseout="this.style.backgroundColor='transparent'">
                logout
            </div>
        `;

        // Append dropdown to profile container
        profileContainer.appendChild(dropdown);

        // Toggle dropdown on profile container click
        profileContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
            // Rotate arrow when dropdown is open
            dropdownArrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
            dropdownArrow.style.transform = 'rotate(0deg)';
        });

        // Change Profile functionality
        const changeProfileOption = dropdown.querySelector('.change-profile-option');
        changeProfileOption.addEventListener('click', async () => {
            // Clear profile-specific data but keep authentication state
            localStorage.removeItem('selectedProfileId');
            localStorage.removeItem('selectedProfileName');
            localStorage.removeItem('likedContent');
            localStorage.removeItem('contentLikes');
            localStorage.removeItem('userList');
            
            // Clear hero content for all categories
            ['home', 'movies', 'tv shows'].forEach(category => {
                localStorage.removeItem(`heroContent_${category}`);
            });
            
            // Show notification that data is being cleared
            this.showNotification('Switching profiles...', 'info');
            
            // Redirect to profiles page to select a new profile
            window.location.href = '../profiles/profiles.html';
        });

        // Logout functionality
        const logoutOption = dropdown.querySelector('.logout-option');
        logoutOption.addEventListener('click', () => {
            window.authManager.logout();
            authManager.showNotification('Successfully logged out', 'info'); // Show logout message
        });
    }

    setupSearchIcon() {
        const searchIcon = document.querySelector('img[alt="Search"]');
        if (!searchIcon) return;

        searchIcon.style.cursor = 'pointer';
        
        // Create search input that will replace the search icon
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search titles...';
        searchInput.className = 'navbar-search-input';
        searchInput.style.cssText = `
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid #333;
            border-radius: 4px;
            color: white;
            padding: 8px 12px;
            font-size: 14px;
            width: 250px;
            outline: none;
            display: none;
        `;

        // Insert search input next to search icon
        searchIcon.parentNode.insertBefore(searchInput, searchIcon);

        // Click on search icon shows the input
        searchIcon.addEventListener('click', () => {
            searchIcon.style.display = 'none';
            searchInput.style.display = 'inline-block';
            searchInput.focus();
        });

        // Handle search input events
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Hide search input when clicking outside or pressing Escape
        searchInput.addEventListener('blur', () => {
            if (!searchInput.value.trim()) {
                searchInput.style.display = 'none';
                searchIcon.style.display = 'inline-block';
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                this.handleSearch('');
                searchInput.style.display = 'none';
                searchIcon.style.display = 'inline-block';
            }
        });
    }

    setupNavbarFiltering() {
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Get the category from the link text
                const category = link.textContent.trim().toLowerCase();
                this.filterByCategory(category);
            });
        });
    }

    filterByCategory(category) {
        this.activeCategory = category;
        
        // Clear any search input
        this.clearSearch();
        
        // Reload content with new category filtering
        this.loadContent();
        this.updateCategoryFeedback(category);
    }

    updateCategoryFeedback(category) {
        // Remove existing feedback
        const existingFeedback = document.querySelector('.category-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        // No longer showing category feedback bar
    }

    showUserGreeting() {
        const profileName = localStorage.getItem('selectedProfileName');
        const greetingElement = document.getElementById('userGreeting');
        
        if (profileName && greetingElement) {
            greetingElement.textContent = `Hello, ${profileName}, choose your next watch`;
        }
    }

    async loadContent() {
        const contentSection = document.getElementById('contentCategories');
        if (!contentSection) return;

        contentSection.innerHTML = '';

        // Create hero section with random featured content
        this.createHeroSection();

        // Create category rows
        await this.createCategoryRows(contentSection);
    }

    async createCategoryRows(container) {
        // Special handling for "My List" - show only one section with all user's content
        if (this.activeCategory.toLowerCase() === 'my list') {
            const userList = JSON.parse(localStorage.getItem('userList') || '[]');
            if (userList.length === 0) {
                // Show empty state message for My List
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-category-message';
                emptyMessage.style.cssText = `
                    text-align: center;
                    padding: 60px 20px;
                    color: #b3b3b3;
                `;
                emptyMessage.innerHTML = `
                    <h2 style="font-size: 32px; margin-bottom: 15px; color: white;">
                        My List is Empty
                    </h2>
                    <p style="font-size: 18px; color: #999;">
                        Use the + button when hovering over titles to add them to your list
                    </p>
                `;
                container.appendChild(emptyMessage);
                return;
            } else {
                // Show user's list content in a special grid layout that can handle multiple rows
                let userContent = this.currentContent.filter(content => userList.includes(content.id));
                
                // Apply alphabetical sorting if enabled for My List
                if (this.isAlphabeticalSort) {
                    userContent = userContent.sort((a, b) => a.name.localeCompare(b.name));
                }
                
                const myListSection = this.createMyListSection(userContent);
                container.appendChild(myListSection);
                return;
            }
        } else if (this.activeCategory.toLowerCase() === 'browse by languages') {
            // Show empty state message for Browse by Languages
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-category-message';
            emptyMessage.style.cssText = `
                text-align: center;
                padding: 60px 20px;
                color: #b3b3b3;
            `;
            emptyMessage.innerHTML = `
                <h2 style="font-size: 32px; margin-bottom: 15px; color: white;">
                    No Content Available
                </h2>
                <p style="font-size: 18px; color: #999;">
                    Content will be added in the future
                </p>
            `;
            container.appendChild(emptyMessage);
            return;
        }

        // Get content based on active category (navbar filtering)
        const activeContent = await this.getContentByCategory(this.activeCategory);
        
        // Check if this is a page that should show genre-based categories
        const genreBasedPages = ['home', 'movies', 'tv shows'];
        const shouldUseGenres = genreBasedPages.includes(this.activeCategory.toLowerCase());
        
        if (shouldUseGenres) {
            // Define genre-based categories for Home, Movies, and TV Shows
            // Now using the new genres array to support multiple genres per title
            // Only showing main 6 categories in display (Romance, Fantasy, Mystery, Horror still available for search)
            const genreCategories = [
                { name: 'Drama', filter: (content) => content.genres?.includes('Drama') || content.genre === 'Drama' },
                { name: 'Sci-Fi', filter: (content) => content.genres?.includes('Sci-Fi') || content.genre === 'Sci-Fi' },
                { name: 'Crime', filter: (content) => content.genres?.includes('Crime') || content.genre === 'Crime' },
                { name: 'Action', filter: (content) => content.genres?.includes('Action') || content.genre === 'Action' },
                { name: 'Comedy', filter: (content) => content.genres?.includes('Comedy') || content.genre === 'Comedy' },
                { name: 'Thriller', filter: (content) => content.genres?.includes('Thriller') || content.genre === 'Thriller' }
            ];

            // Add Top 10 category for Home, Movies and TV Shows pages
            if (this.activeCategory.toLowerCase() === 'home') {
                // Top 10 Overall (all content) for Home page
                const topOverall = activeContent
                    .sort((a, b) => b.likes - a.likes)
                    .slice(0, 10);
                if (topOverall.length >= 5) {
                    const topOverallRow = this.createCategoryRow('Top 10', topOverall);
                    container.appendChild(topOverallRow);
                }
            } else if (this.activeCategory.toLowerCase() === 'movies') {
                const topMovies = activeContent
                    .sort((a, b) => b.likes - a.likes)
                    .slice(0, 10);
                if (topMovies.length >= 5) {
                    const topMoviesRow = this.createCategoryRow('Top 10 Movies', topMovies);
                    container.appendChild(topMoviesRow);
                }
            } else if (this.activeCategory.toLowerCase() === 'tv shows') {
                const topTVShows = activeContent
                    .sort((a, b) => b.likes - a.likes)
                    .slice(0, 10);
                if (topTVShows.length >= 5) {
                    const topTVShowsRow = this.createCategoryRow('Top 10 TV Shows', topTVShows);
                    container.appendChild(topTVShowsRow);
                }
            }

            // Only show genre categories that have at least 5 titles
            genreCategories.forEach(category => {
                let categoryContent = activeContent.filter(category.filter);
                
                // Apply alphabetical sorting if enabled
                if (this.isAlphabeticalSort) {
                    categoryContent = categoryContent.sort((a, b) => a.name.localeCompare(b.name));
                }
                
                if (categoryContent.length >= 5) {
                    const categoryRow = this.createCategoryRow(category.name, categoryContent);
                    container.appendChild(categoryRow);
                }
            });
        } else if (this.activeCategory.toLowerCase() === 'new & popular') {
            // Special categories for "New & Popular" page
            const newPopularCategories = [
                {
                    name: 'Popular',
                    filter: (content) => content.likes > 800,
                    sort: (a, b) => b.likes - a.likes
                },
                {
                    name: 'Recently Added',
                    filter: (content) => true, // Include all content, then sort and limit
                    sort: (a, b) => b.year - a.year,
                    limit: 10
                },
                {
                    name: 'Top 5 Movies',
                    filter: (content) => content.type === 'movie',
                    sort: (a, b) => b.likes - a.likes,
                    limit: 5
                },
                {
                    name: 'Top 5 TV Shows',
                    filter: (content) => content.type === 'series',
                    sort: (a, b) => b.likes - a.likes,
                    limit: 5
                }
            ];

            newPopularCategories.forEach(category => {
                let categoryContent = activeContent.filter(category.filter);
                
                // Sort the content according to the category's sorting logic
                if (category.sort) {
                    categoryContent = categoryContent.sort(category.sort);
                }
                
                // Apply alphabetical sorting if enabled (but after other sorting)
                if (this.isAlphabeticalSort && !category.sort) {
                    categoryContent = categoryContent.sort((a, b) => a.name.localeCompare(b.name));
                }
                
                // Apply limit if specified
                if (category.limit) {
                    categoryContent = categoryContent.slice(0, category.limit);
                }
                
                if (categoryContent.length > 0) {
                    const categoryRow = this.createCategoryRow(category.name, categoryContent);
                    container.appendChild(categoryRow);
                }
            });
        } else {
            // Use original popularity-based categories for other pages (Games, etc.)
            const categories = [
                { name: 'Popular', filter: (content) => content.likes > 1000 },
                { name: 'Recently Added', filter: (content) => content.year >= 2020 },
                { name: 'Trending Now', filter: (content) => content.likes > 800 }
            ];

            categories.forEach(category => {
                let categoryContent = activeContent.filter(category.filter);
                
                // Apply alphabetical sorting if enabled
                if (this.isAlphabeticalSort) {
                    categoryContent = categoryContent.sort((a, b) => a.name.localeCompare(b.name));
                }
                
                if (categoryContent.length > 0) {
                    const categoryRow = this.createCategoryRow(category.name, categoryContent);
                    container.appendChild(categoryRow);
                }
            });

            // Always show "All" category with all active content for non-genre pages
            if (activeContent.length > 0) {
                let allContent = [...activeContent];
                
                // Apply alphabetical sorting if enabled
                if (this.isAlphabeticalSort) {
                    allContent = allContent.sort((a, b) => a.name.localeCompare(b.name));
                }
                
                const allRow = this.createCategoryRow('All', allContent);
                container.appendChild(allRow);
            }
        
        }
    }

    createMyListSection(userContent) {
        const myListSection = document.createElement('div');
        myListSection.className = 'my-list-section';
        
        myListSection.innerHTML = `
            <h2 class="category-title">My List</h2>
            <div class="my-list-grid">
                ${userContent.map(item => this.createContentCardHTML(item, 'my-list')).join('')}
            </div>
        `;
        
        return myListSection;
    }

    createHeroSection() {
        const heroSection = document.getElementById('heroSection');
        if (!heroSection) return;

        // Only show hero section for specific categories
        const allowedCategories = ['home', 'movies', 'tv shows'];
        if (!allowedCategories.includes(this.activeCategory.toLowerCase())) {
            heroSection.innerHTML = ''; // Clear hero section for other categories
            heroSection.style.display = 'none';
            return;
        }

        // Show hero section and create content
        heroSection.style.display = 'block';
        
        // Get random content from the catalog
        const randomContent = this.getRandomFeaturedContent();
        
        // Check if content is in user's list
        const userList = JSON.parse(localStorage.getItem('userList') || '[]');
        const isInList = userList.includes(randomContent.id);

        heroSection.innerHTML = `
            <div class="hero-background" style="background-image: url('${randomContent.image}')">
                <div class="hero-overlay">
                    <div class="hero-content">
                        <h1 class="hero-title">${randomContent.name}</h1>
                        <p class="hero-description">${randomContent.year} | ${randomContent.genre}</p>
                        <div class="hero-buttons">
                            <button class="hero-play-btn">
                                <span>▶</span> Play
                            </button>
                            <button class="hero-info-btn" data-card-id="${randomContent.id}">
                                <span>ℹ️</span> More Info
                            </button>
                            <button class="hero-add-to-list-btn ${isInList ? 'in-list' : ''}" data-content-id="${randomContent.id}" data-in-list="${isInList}">
                                <span class="list-icon">${isInList ? '✓' : '+'}</span> ${isInList ? 'Remove from My List' : 'Add to My List'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getRandomFeaturedContent() {
        // Check if we already have a hero content for this category in localStorage
        const heroKey = `heroContent_${this.activeCategory}`;
        const storedHeroId = localStorage.getItem(heroKey);
        
        // Get content based on active category
        const activeContent = this.getContentByCategory(this.activeCategory);
        
        // If no content in active category, use all content
        const contentPool = activeContent.length > 0 ? activeContent : this.currentContent;
        
        // If we have stored hero content, try to find it
        if (storedHeroId) {
            const storedContent = contentPool.find(content => content.id === parseInt(storedHeroId));
            if (storedContent) {
                return storedContent;
            }
        }
        
        // Pick random content and store it for this category
        const randomIndex = Math.floor(Math.random() * contentPool.length);
        const selectedContent = contentPool[randomIndex];
        localStorage.setItem(heroKey, selectedContent.id.toString());
        return selectedContent;
    }

    createCategoryRow(categoryName, content) {
        const categoryRow = document.createElement('div');
        categoryRow.className = 'category-row';
        
        // Create unique instance identifier for this category
        const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        categoryRow.innerHTML = `
            <h2 class="category-title">${categoryName}</h2>
            <div class="content-carousel">
                <button class="carousel-btn carousel-btn-left" disabled>‹</button>
                <div class="content-slider">
                    <div class="content-track" style="transform: translateX(0px)">
                        ${content.map(item => this.createContentCardHTML(item, categoryId)).join('')}
                    </div>
                </div>
                <button class="carousel-btn carousel-btn-right">›</button>
            </div>
        `;

        // Add carousel functionality
        this.setupCarousel(categoryRow, content.length);
        
        return categoryRow;
    }

    createContentCardHTML(content, categoryId = 'default') {
        const likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]');
        const isLiked = likedContent.includes(content.id);
        
        const contentLikes = JSON.parse(localStorage.getItem('contentLikes') || '{}');
        const currentLikes = contentLikes[content.id] || content.likes;

        // Check if content is in user's list
        const userList = JSON.parse(localStorage.getItem('userList') || '[]');
        const isInList = userList.includes(content.id);

        // Create unique instance ID combining content ID and category
        const instanceId = `${content.id}-${categoryId}`;

        return `
            <div class="content-card-netflix" data-content-id="${content.id}" id="card-${instanceId}">
                <div class="content-image">
                    <img src="${content.image}" alt="${content.name}" />
                    <div class="content-overlay">
                        <button class="play-btn" data-content-id="${content.id}">▶</button>
                        <button class="info-btn" data-card-id="${instanceId}" title="More Info">ℹ️</button>
                        <button class="add-to-list-btn ${isInList ? 'in-list' : ''}" data-content-id="${content.id}" data-in-list="${isInList}" title="${isInList ? 'Remove from List' : 'Add to List'}">
                            <span class="list-icon">${isInList ? '✓' : '+'}</span>
                        </button>
                        <button class="like-btn ${isLiked ? 'liked' : ''}" data-content-id="${content.id}" data-liked="${isLiked}">
                            <span class="heart-icon">${isLiked ? '❤️' : '🤍'}</span>
                        </button>
                    </div>
                    <div class="content-details-overlay" id="details-${instanceId}" style="display: none;">
                        <div class="details-content">
                            <button class="close-details" data-card-id="${instanceId}">×</button>
                            <h3 class="content-title-expanded">${content.name}</h3>
                            <p class="show-details">${content.year} | ${content.genre}</p>
                            <span class="like-count">${currentLikes} likes</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupCarousel(categoryRow, totalItems) {
        const leftBtn = categoryRow.querySelector('.carousel-btn-left');
        const rightBtn = categoryRow.querySelector('.carousel-btn-right');
        const track = categoryRow.querySelector('.content-track');
        
        let currentPosition = 0;
        const itemsPerPage = 5;
        const itemWidth = 20; // 20% width per item
        
        // For circular carousel, we don't disable buttons
        leftBtn.disabled = false;
        rightBtn.disabled = false;

        leftBtn.addEventListener('click', () => {
            if (currentPosition > 0) {
                currentPosition--;
            } else {
                // Circular: go to end
                currentPosition = Math.max(0, totalItems - itemsPerPage);
            }
            track.style.transform = `translateX(-${currentPosition * itemWidth}%)`;
        });

        rightBtn.addEventListener('click', () => {
            const maxPosition = Math.max(0, totalItems - itemsPerPage);
            if (currentPosition < maxPosition) {
                currentPosition++;
            } else {
                // Circular: go to start
                currentPosition = 0;
            }
            track.style.transform = `translateX(-${currentPosition * itemWidth}%)`;
        });
    }

    createContentCard(content) {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.setAttribute('data-content-id', content.id);

        const likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]');
        const isLiked = likedContent.includes(content.id);
        
        const contentLikes = JSON.parse(localStorage.getItem('contentLikes') || '{}');
        const currentLikes = contentLikes[content.id] || content.likes;

        card.innerHTML = `
            <div class="content-image">
                <img src="${content.image}" alt="${content.name}" />
                <div class="content-overlay">
                    <button class="play-btn" data-content-id="${content.id}">▶</button>
                </div>
            </div>
            <div class="content-info">
                <h3 class="content-title">${content.name}</h3>
                <p class="content-details">${content.year} | ${content.genre} | ${content.type}</p>
                <div class="like-section">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" data-content-id="${content.id}" data-liked="${isLiked}">
                        <span class="heart-icon">${isLiked ? '❤️' : '🤍'}</span>
                        <span class="like-count">${currentLikes}</span>
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    setupEventListeners() {
        // Like functionality and content interaction - use event delegation for new Netflix-style layout
        const contentSection = document.getElementById('contentCategories');
        if (contentSection) {
            contentSection.addEventListener('click', (e) => {
                if (e.target.closest('.like-btn')) {
                    e.stopPropagation(); // Prevent triggering content click
                    this.handleLike(e.target.closest('.like-btn'));
                } else if (e.target.closest('.add-to-list-btn')) {
                    e.stopPropagation();
                    this.handleAddToList(e.target.closest('.add-to-list-btn'));
                } else if (e.target.closest('.info-btn')) {
                    e.stopPropagation();
                    const infoBtn = e.target.closest('.info-btn');
                    const instanceId = infoBtn.getAttribute('data-card-id');
                    this.toggleContentDetails(instanceId);
                } else if (e.target.closest('.close-details')) {
                    e.stopPropagation();
                    const closeBtn = e.target.closest('.close-details');
                    const instanceId = closeBtn.getAttribute('data-card-id');
                    this.hideContentDetails(instanceId);
                } else if (e.target.closest('.play-btn')) {
                    e.stopPropagation();
                    const playBtn = e.target.closest('.play-btn');
                    const contentId = parseInt(playBtn.getAttribute('data-content-id'));
                    this.playContent(contentId);
                } else if (e.target.closest('.content-image img')) {
                    // Handle click on the show image itself to show details
                    e.stopPropagation();
                    const contentCard = e.target.closest('.content-card-netflix');
                    if (contentCard) {
                        const cardId = contentCard.getAttribute('id');
                        // Extract instance ID from card ID (format: "card-{instanceId}")
                        const instanceId = cardId.replace('card-', '');
                        this.toggleContentDetails(instanceId);
                    }
                }
            });
        }

        // Alphabetical sort button event listener
        const sortBtn = document.getElementById('sortAlphabetical');
        if (sortBtn) {
            sortBtn.addEventListener('click', () => {
                this.toggleAlphabeticalSort();
            });
        }

        // Hero section event listeners
        this.setupHeroEventListeners();
    }

    setupHeroEventListeners() {
        const heroSection = document.getElementById('heroSection');
        if (heroSection) {
            heroSection.addEventListener('click', (e) => {
                if (e.target.closest('.hero-info-btn')) {
                    e.stopPropagation();
                    const infoBtn = e.target.closest('.hero-info-btn');
                    const cardId = infoBtn.getAttribute('data-card-id');
                    this.showHeroContentDetails(cardId);
                } else if (e.target.closest('.hero-play-btn')) {
                    e.stopPropagation();
                    const heroContent = this.getRandomFeaturedContent();
                    this.playContent(heroContent.id);
                } else if (e.target.closest('.hero-add-to-list-btn')) {
                    e.stopPropagation();
                    this.handleHeroAddToList(e.target.closest('.hero-add-to-list-btn'));
                }
            });
        }
    }

    showHeroContentDetails(contentId) {
        // Find the content in the catalog
        const content = this.currentContent.find(c => c.id == contentId);
        if (!content) return;

        // Get current like count
        const contentLikes = JSON.parse(localStorage.getItem('contentLikes') || '{}');
        const currentLikes = contentLikes[content.id] || content.likes;

        // Create and show a hero-specific details popup
        const existingPopup = document.getElementById('hero-details-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const heroPopup = document.createElement('div');
        heroPopup.id = 'hero-details-popup';
        heroPopup.innerHTML = `
            <div class="hero-popup-overlay">
                <div class="hero-popup-content">
                    <button class="hero-popup-close">×</button>
                    <h2>${content.name}</h2>
                    <p class="hero-popup-details">${content.year} | ${content.genre}</p>
                    <p class="hero-popup-likes">${currentLikes} likes</p>
                    <div class="hero-popup-buttons">
                        <button class="hero-popup-play">▶ Play</button>
                        <button class="hero-popup-like ${this.isContentLiked(content.id) ? 'liked' : ''}" data-content-id="${content.id}" data-liked="${this.isContentLiked(content.id)}">
                            <span class="heart-icon">${this.isContentLiked(content.id) ? '❤️' : '🤍'}</span> Like
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(heroPopup);

        // Add event listeners for the popup
        heroPopup.querySelector('.hero-popup-close').addEventListener('click', () => {
            heroPopup.remove();
        });

        heroPopup.querySelector('.hero-popup-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('hero-popup-overlay')) {
                heroPopup.remove();
            }
        });

        heroPopup.querySelector('.hero-popup-like').addEventListener('click', (e) => {
            this.handleLike(e.target);
            // Update the popup like count after like action
            setTimeout(() => {
                const updatedLikes = JSON.parse(localStorage.getItem('contentLikes') || '{}');
                const newCount = updatedLikes[content.id] || content.likes;
                heroPopup.querySelector('.hero-popup-likes').textContent = `${newCount} likes`;
            }, 100);
        });

        heroPopup.querySelector('.hero-popup-play').addEventListener('click', () => {
            this.playContent(content.id);
            heroPopup.remove();
        });
    }

    isContentLiked(contentId) {
        const likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]');
        return likedContent.includes(parseInt(contentId));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            font-weight: 600;
            z-index: 10000;
            background: ${type === 'info' ? '#17a2b8' : '#28a745'};
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    toggleContentDetails(instanceId) {
        // Hide all other details overlays first
        document.querySelectorAll('.content-details-overlay').forEach(overlay => {
            if (overlay.id !== `details-${instanceId}`) {
                overlay.style.display = 'none';
            }
        });

        // Toggle the clicked content's details overlay
        const detailsOverlay = document.getElementById(`details-${instanceId}`);
        if (detailsOverlay) {
            if (detailsOverlay.style.display === 'none' || detailsOverlay.style.display === '') {
                detailsOverlay.style.display = 'block';
            } else {
                detailsOverlay.style.display = 'none';
            }
        }
    }

    hideContentDetails(instanceId) {
        const detailsOverlay = document.getElementById(`details-${instanceId}`);
        if (detailsOverlay) {
            detailsOverlay.style.display = 'none';
        }
    }

    async handleSearch(searchTerm) {
        const contentSection = document.getElementById('contentCategories');
        const heroSection = document.getElementById('heroSection');
        if (!contentSection) return;

        if (!searchTerm.trim()) {
            // No search term - show normal category layout with hero section
            this.loadContent();
            return;
        }

        // Hide hero section during search
        if (heroSection) {
            heroSection.style.display = 'none';
        }

        // Search across all content regardless of category
        const allContent = await this.apiUsage.getContentCatalog();
        const filteredContent = allContent.filter(content => {
            const searchLower = searchTerm.toLowerCase();
            
            // Check name and year
            const nameMatch = content.name.toLowerCase().includes(searchLower);
            const yearMatch = content.year.toString().includes(searchTerm);
            
            // Check primary genre (backward compatibility)
            const primaryGenreMatch = content.genre.toLowerCase().includes(searchLower);
            
            // Check all genres in the genres array
            const genresMatch = content.genres?.some(genre =>
                genre.toLowerCase().includes(searchLower)
            ) || false;
            
            return nameMatch || yearMatch || primaryGenreMatch || genresMatch;
        });

        // Clear content section and show search results in simple grid
        contentSection.innerHTML = '';
        
        if (filteredContent.length === 0) {
            contentSection.innerHTML = `
                <div class="search-no-results">
                    <h2>No results found for "${searchTerm}"</h2>
                    <p>Try searching with different keywords</p>
                </div>
            `;
            return;
        }

        // Apply alphabetical sorting if enabled
        if (this.isAlphabeticalSort) {
            filteredContent.sort((a, b) => a.name.localeCompare(b.name));
        }

        // Create search results header
        const searchHeader = document.createElement('div');
        searchHeader.className = 'search-results-header';
        searchHeader.innerHTML = `
            <h2>Search results for "${searchTerm}" (${filteredContent.length} results)${this.isAlphabeticalSort ? ' - Alphabetical Order' : ''}</h2>
        `;
        contentSection.appendChild(searchHeader);

        // Create search results grid using the same grid styling as defined in CSS
        const searchGrid = document.createElement('div');
        searchGrid.className = 'search-results-grid';

        filteredContent.forEach(content => {
            const cardHTML = this.createContentCardHTML(content, 'search');
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHTML;
            const card = tempDiv.firstElementChild;
            searchGrid.appendChild(card);
        });

        contentSection.appendChild(searchGrid);
    }

    async getContentByCategory(category) {
        switch(category) {
            case 'home':
                return await this.apiUsage.getContentCatalog();
            case 'movies':
                return this.currentContent.filter(content => content.type === 'movie');
            case 'tv shows':
                return this.currentContent.filter(content => content.type === 'series');
            case 'games':
                return [];
            case 'new & popular':
                return this.currentContent
                    .filter(content => content.year >= 2018)
                    .sort((a, b) => b.likes - a.likes);
            case 'my list':
                const userList = JSON.parse(localStorage.getItem('userList') || '[]');
                return this.currentContent.filter(content => userList.includes(content.id));
            case 'browse by languages':
                return await this.apiUsage.getContentCatalog();
            default:
                return await this.apiUsage.getContentCatalog();
        }
    }

    updateSearchFeedback(searchTerm) {
        // Remove existing feedback
        const existingFeedback = document.querySelector('.search-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        // Search feedback is now handled within the category rows
    }

    clearSearch() {
        const navbarSearchInput = document.querySelector('.navbar-search-input');
        if (navbarSearchInput) {
            navbarSearchInput.value = '';
            this.loadContent();
            // Hide search input and show search icon
            navbarSearchInput.style.display = 'none';
            const searchIcon = document.querySelector('img[alt="Search"]');
            if (searchIcon) {
                searchIcon.style.display = 'inline-block';
            }
        }
    }

    toggleAlphabeticalSort() {
        this.isAlphabeticalSort = !this.isAlphabeticalSort;
        const sortBtn = document.getElementById('sortAlphabetical');
        
        if (this.isAlphabeticalSort) {
            sortBtn.innerHTML = '<span>↓</span> Normal Sort';
            sortBtn.classList.add('active');
            
            // Show notification
            this.showNotification('Content sorted alphabetically', 'info');
        } else {
            sortBtn.innerHTML = '<span>A-Z</span> Alphabetical Sort';
            sortBtn.classList.remove('active');
            
            // Show notification
            this.showNotification('Content sorted by category', 'info');
        }
        
        // Re-apply current view (search or categories)
        const navbarSearchInput = document.querySelector('.navbar-search-input');
        if (navbarSearchInput && navbarSearchInput.value.trim()) {
            // If searching, re-run search with new sorting
            this.handleSearch(navbarSearchInput.value);
        } else {
            // If not searching, reload category content with new sorting
            this.loadContent();
        }
    }

    sortContentAlphabetically() {
        this.currentContent.sort((a, b) => a.name.localeCompare(b.name));
    }

    async handleLike(likeBtn) {
        const contentId = parseInt(likeBtn.getAttribute('data-content-id'));
        const isCurrentlyLiked = likeBtn.getAttribute('data-liked') === 'true';
        const heartIcon = likeBtn.querySelector('.heart-icon');
        
        // Get the current like count from localStorage or original data
        const contentLikes = JSON.parse(localStorage.getItem('contentLikes') || '{}');
        const originalContent = this.currentContent.find(c => c.id === contentId);
        let currentCount = contentLikes[contentId] || (originalContent ? originalContent.likes : 0);

        // Sync with MongoDB using toggle endpoint
        const syncResult = await this.syncLikedContentToMongoDB(contentId);
        
        // Determine new state based on MongoDB response or fallback to local toggle
        let newIsLiked;
        if (syncResult.success) {
            // Use MongoDB result
            newIsLiked = syncResult.saved;
            
            // Update localStorage to match MongoDB
            let likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]');
            if (newIsLiked) {
                if (!likedContent.includes(contentId)) {
                    likedContent.push(contentId);
                    currentCount++;
                }
            } else {
                likedContent = likedContent.filter(id => id !== contentId);
                currentCount--;
            }
            localStorage.setItem('likedContent', JSON.stringify(likedContent));
        } else {
            // Fallback to local toggle if MongoDB fails
            console.warn('MongoDB sync failed, using localStorage fallback');
            newIsLiked = !isCurrentlyLiked;
            let likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]');
            if (newIsLiked) {
                if (!likedContent.includes(contentId)) {
                    likedContent.push(contentId);
                    currentCount++;
                }
            } else {
                likedContent = likedContent.filter(id => id !== contentId);
                currentCount--;
            }
            localStorage.setItem('likedContent', JSON.stringify(likedContent));
        }
        
        // Update UI based on new state
        if (newIsLiked) {
            heartIcon.textContent = '❤️';
            likeBtn.classList.add('liked');
            likeBtn.setAttribute('data-liked', 'true');
            
            // Add simple animation effect
            heartIcon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                heartIcon.style.transform = 'scale(1)';
            }, 300);
        } else {
            heartIcon.textContent = '🤍';
            likeBtn.classList.remove('liked');
            likeBtn.setAttribute('data-liked', 'false');
        }
        
        if (!syncResult.success) {
            console.warn('Failed to sync with MongoDB:', syncResult.error);
        }

        // Update like count in localStorage
        contentLikes[contentId] = currentCount;
        localStorage.setItem('contentLikes', JSON.stringify(contentLikes));

        // Update ALL instances of this content across all categories
        this.updateAllInstancesOfContent(contentId, currentCount, newIsLiked);

        // Show feedback
        const action = newIsLiked ? 'Like added' : 'Like removed';
        
        // Simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-success`;
        notification.textContent = action;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            font-weight: 600;
            z-index: 10000;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    updateAllInstancesOfContent(contentId, newLikeCount, isNowLiked) {
        // Find all content cards with this content ID across all categories
        const allContentCards = document.querySelectorAll(`[data-content-id="${contentId}"]`);
        
        allContentCards.forEach(card => {
            // Update like button state
            const likeBtn = card.querySelector('.like-btn');
            const heartIcon = card.querySelector('.heart-icon');
            
            if (likeBtn && heartIcon) {
                if (isNowLiked) {
                    heartIcon.textContent = '❤️';
                    likeBtn.classList.add('liked');
                    likeBtn.setAttribute('data-liked', 'true');
                } else {
                    heartIcon.textContent = '🤍';
                    likeBtn.classList.remove('liked');
                    likeBtn.setAttribute('data-liked', 'false');
                }
            }
            
            // Update like count in details overlay if visible
            const likeCountSpan = card.querySelector('.like-count');
            if (likeCountSpan) {
                likeCountSpan.textContent = `${newLikeCount} likes`;
            }
        });
    }

    async handleAddToList(addToListBtn) {
        const contentId = parseInt(addToListBtn.getAttribute('data-content-id'));
        const isCurrentlyInList = addToListBtn.getAttribute('data-in-list') === 'true';
        const listIcon = addToListBtn.querySelector('.list-icon');
        
        // Sync with MongoDB using toggle endpoint
        const syncResult = await this.syncWatchlistToMongoDB(contentId);
        
        // Determine new state based on MongoDB response or fallback to local toggle
        let newIsInList;
        if (syncResult.success) {
            // Use MongoDB result
            newIsInList = syncResult.saved;
            
            // Update localStorage to match MongoDB
            let userList = JSON.parse(localStorage.getItem('userList') || '[]');
            if (newIsInList) {
                if (!userList.includes(contentId)) {
                    userList.push(contentId);
                }
            } else {
                userList = userList.filter(id => id !== contentId);
            }
            localStorage.setItem('userList', JSON.stringify(userList));
        } else {
            // Fallback to local toggle if MongoDB fails
            console.warn('MongoDB sync failed, using localStorage fallback');
            newIsInList = !isCurrentlyInList;
            let userList = JSON.parse(localStorage.getItem('userList') || '[]');
            if (newIsInList) {
                if (!userList.includes(contentId)) {
                    userList.push(contentId);
                }
            } else {
                userList = userList.filter(id => id !== contentId);
            }
            localStorage.setItem('userList', JSON.stringify(userList));
        }
        
        // Update UI based on new state
        if (newIsInList) {
            listIcon.textContent = '✓';
            addToListBtn.classList.add('in-list');
            addToListBtn.setAttribute('data-in-list', 'true');
            addToListBtn.setAttribute('title', 'Remove from List');
            
            // Add simple animation effect
            listIcon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                listIcon.style.transform = 'scale(1)';
            }, 300);
            
            this.showNotification('Added to My List', 'success');
        } else {
            listIcon.textContent = '+';
            addToListBtn.classList.remove('in-list');
            addToListBtn.setAttribute('data-in-list', 'false');
            addToListBtn.setAttribute('title', 'Add to List');
            
            this.showNotification('Removed from My List', 'info');
        }
        
        if (!syncResult.success) {
            console.warn('Failed to sync with MongoDB:', syncResult.error);
        }

        // Update ALL instances of this content across all categories
        this.updateAllInstancesOfContentList(contentId, newIsInList);
    }

    updateAllInstancesOfContentList(contentId, isNowInList) {
        // Find all content cards with this content ID across all categories
        const allContentCards = document.querySelectorAll(`[data-content-id="${contentId}"]`);
        
        allContentCards.forEach(card => {
            // Update add-to-list button state
            const addToListBtn = card.querySelector('.add-to-list-btn');
            const listIcon = card.querySelector('.list-icon');
            
            if (addToListBtn && listIcon) {
                if (isNowInList) {
                    listIcon.textContent = '✓';
                    addToListBtn.classList.add('in-list');
                    addToListBtn.setAttribute('data-in-list', 'true');
                    addToListBtn.setAttribute('title', 'Remove from List');
                } else {
                    listIcon.textContent = '+';
                    addToListBtn.classList.remove('in-list');
                    addToListBtn.setAttribute('data-in-list', 'false');
                    addToListBtn.setAttribute('title', 'Add to List');
                }
            }
        });
    }

    async handleHeroAddToList(addToListBtn) {
        const contentId = parseInt(addToListBtn.getAttribute('data-content-id'));
        const isCurrentlyInList = addToListBtn.getAttribute('data-in-list') === 'true';
        const listIcon = addToListBtn.querySelector('.list-icon');
        
        // Sync with MongoDB using toggle endpoint
        const syncResult = await this.syncWatchlistToMongoDB(contentId);
        
        // Determine new state based on MongoDB response or fallback to local toggle
        let newIsInList;
        if (syncResult.success) {
            // Use MongoDB result
            newIsInList = syncResult.saved;
            
            // Update localStorage to match MongoDB
            let userList = JSON.parse(localStorage.getItem('userList') || '[]');
            if (newIsInList) {
                if (!userList.includes(contentId)) {
                    userList.push(contentId);
                }
            } else {
                userList = userList.filter(id => id !== contentId);
            }
            localStorage.setItem('userList', JSON.stringify(userList));
        } else {
            // Fallback to local toggle if MongoDB fails
            console.warn('MongoDB sync failed, using localStorage fallback');
            newIsInList = !isCurrentlyInList;
            let userList = JSON.parse(localStorage.getItem('userList') || '[]');
            if (newIsInList) {
                if (!userList.includes(contentId)) {
                    userList.push(contentId);
                }
            } else {
                userList = userList.filter(id => id !== contentId);
            }
            localStorage.setItem('userList', JSON.stringify(userList));
        }
        
        // Update UI based on new state
        if (newIsInList) {
            listIcon.textContent = '✓';
            addToListBtn.classList.add('in-list');
            addToListBtn.setAttribute('data-in-list', 'true');
            addToListBtn.innerHTML = '<span class="list-icon">✓</span> Remove from My List';
            
            // Add simple animation effect
            listIcon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                listIcon.style.transform = 'scale(1)';
            }, 300);
            
            this.showNotification('Added to My List', 'success');
        } else {
            listIcon.textContent = '+';
            addToListBtn.classList.remove('in-list');
            addToListBtn.setAttribute('data-in-list', 'false');
            addToListBtn.innerHTML = '<span class="list-icon">+</span> Add to My List';
            
            this.showNotification('Removed from My List', 'info');
        }
        
        if (!syncResult.success) {
            console.warn('Failed to sync with MongoDB:', syncResult.error);
        }

        // Update ALL instances of this content across all categories
        this.updateAllInstancesOfContentList(contentId, newIsInList);
    }

    playContent(contentId) {
        // Get the selected profile ID
        const selectedProfileId = localStorage.getItem('selectedProfileId');
        if (!selectedProfileId) {
            this.showNotification('Please select a profile first', 'error');
            return;
        }

        // Find the content in the catalog
        const content = this.currentContent.find(c => c.id === contentId);
        if (!content) {
            this.showNotification('Content not found', 'error');
            return;
        }

        // Show loading notification
        this.showNotification('Loading video player...', 'info');

        // Build video player URL with parameters
        const videoPlayerUrl = `../video-player/video-player.html?contentId=${contentId}&episodeId=1&profileId=${selectedProfileId}`;
        
        // Navigate to video player
        window.location.href = videoPlayerUrl;
    }

    // MongoDB Synchronization Functions

    async loadUserDataFromMongoDB() {
        try {
            const selectedProfileId = localStorage.getItem('selectedProfileId');
            if (!selectedProfileId) {
                console.log('No profile selected, skipping MongoDB sync');
                return;
            }

            // Load watchlist (My List) from MongoDB
            await this.loadWatchlistFromMongoDB();
            
            // Load liked content from MongoDB
            await this.loadLikedContentFromMongoDB();
            
            console.log('User data loaded from MongoDB successfully');
        } catch (error) {
            console.error('Failed to load user data from MongoDB:', error);
            // Fallback to localStorage if MongoDB fails
            this.showNotification('Using offline data - sync will resume when connection is restored', 'info');
        }
    }

    async loadWatchlistFromMongoDB() {
        try {
            const selectedProfileId = localStorage.getItem('selectedProfileId');
            if (!selectedProfileId) return;
            
            const response = await this.apiUsage.loadWatchlist(selectedProfileId);
            if (response.ok) {
                const data = await response.json();
                const watchlistIds = data.watchlist.map(item => item.contentId);
                
                // Update localStorage to match MongoDB
                localStorage.setItem('userList', JSON.stringify(watchlistIds));
                
                console.log('Watchlist synced from MongoDB:', watchlistIds.length, 'items');
            } else if (response.status === 404 || response.status === 400) {
                // No watchlist found or profile issue - use empty array
                localStorage.setItem('userList', JSON.stringify([]));
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to load watchlist from MongoDB:', error);
            throw error;
        }
    }

    async loadLikedContentFromMongoDB() {
        try {
            const selectedProfileId = localStorage.getItem('selectedProfileId');
            if (!selectedProfileId) return;

            const response = await this.apiUsage.loadLikedContent(selectedProfileId);

            if (response.ok) {
                const data = await response.json();
                const likedIds = data.likedContent.map(item => item.contentId);
                
                // Update localStorage to match MongoDB
                localStorage.setItem('likedContent', JSON.stringify(likedIds));
                
                console.log('Liked content synced from MongoDB:', likedIds.length, 'items');
            } else if (response.status === 404 || response.status === 400) {
                // No liked content found or profile issue - use empty array
                localStorage.setItem('likedContent', JSON.stringify([]));
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to load liked content from MongoDB:', error);
            throw error;
        }
    }

    async syncWatchlistToMongoDB(contentId) {
        try {
            const selectedProfileId = localStorage.getItem('selectedProfileId');
            if (!selectedProfileId) {
                throw new Error('No profile selected');
            }

            // Use toggle endpoint - it handles add/remove logic automatically
            const response = await this.apiUsage.syncWatchlist(contentId, selectedProfileId);
            if (response.ok) {
                const data = await response.json();
                console.log(`Watchlist synced to MongoDB:`, data.message);
                return { success: true, data, action: data.action, saved: data.saved };
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to sync watchlist');
            }
        } catch (error) {
            console.error('Failed to sync watchlist to MongoDB:', error);
            // Don't throw error to maintain functionality if MongoDB is unavailable
            return { success: false, error: error.message };
        }
    }

    async syncLikedContentToMongoDB(contentId) {
        try {
            const selectedProfileId = localStorage.getItem('selectedProfileId');
            if (!selectedProfileId) {
                throw new Error('No profile selected');
            }

            // Use toggle endpoint - it handles add/remove logic automatically
            const response = await this.apiUsage.syncLikedContent(contentId, selectedProfileId);
            if (response.ok) {
                const data = await response.json();
                console.log(`Liked content synced to MongoDB:`, data.message);
                return { success: true, data, action: data.action, saved: data.saved };
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to sync liked content');
            }
        } catch (error) {
            console.error('Failed to sync liked content to MongoDB:', error);
            // Don't throw error to maintain functionality if MongoDB is unavailable
            return { success: false, error: error.message };
        }
    }
}

// Initialize feed manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.feedManager = new FeedManager();
});