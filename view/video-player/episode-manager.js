// Episode Manager Component
import { APIUsage } from '../APIUsage.js';

class EpisodeManager {
    constructor(videoPlayer) {
        this.apiUsage = new APIUsage();
        this.player = videoPlayer;
        this.isDrawerOpen = false;
        this.episodes = [];
        
        this.initializeEpisodeManager();
    }

    initializeEpisodeManager() {
        // Get drawer elements
        this.episodeDrawer = document.getElementById('episodeDrawer');
        this.episodeList = document.getElementById('episodeList');
        this.drawerOverlay = document.querySelector('.drawer-overlay');
        this.closeDrawerBtn = document.getElementById('closeDrawer');
        this.seriesTitle = document.getElementById('seriesTitle');
        this.episodeCounter = document.getElementById('episodeCounter');
        
        // Get current episode info elements
        this.currentEpisodeTitle = document.getElementById('currentEpisodeTitle');
        this.currentEpisodeDescription = document.getElementById('currentEpisodeDescription');
        
        this.setupEpisodeEvents();
    }

    setupEpisodeEvents() {
        // Close drawer button
        this.closeDrawerBtn.addEventListener('click', () => {
            this.closeEpisodeDrawer();
        });

        // Overlay click to close
        this.drawerOverlay.addEventListener('click', () => {
            this.closeEpisodeDrawer();
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.isDrawerOpen) {
                this.closeEpisodeDrawer();
            }
        });

        // Prevent drawer content clicks from closing drawer
        document.querySelector('.drawer-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    async loadEpisodes(contentId) {
        try {
            const response = await this.apiUsage.loadEpisodes(contentId);
            if (response.ok) {
                const data = await response.json();
                this.episodes = data.episodes || [];
                
                // Also load series information
                await this.loadSeriesInfo(contentId);
                
                // Update UI
                this.updateEpisodeList();
                this.updateCurrentEpisodeInfo();
                this.updateEpisodeCounter();
                
                return this.episodes;
            } else {
                console.error('Failed to load episodes');
                return [];
            }
        } catch (error) {
            console.error('Error loading episodes:', error);
            return [];
        }
    }

    async loadSeriesInfo(contentId) {
        try {
            const response = await this.apiUsage.loadSeriesInfo(contentId);
            if (response.ok) {
                const data = await response.json();
                this.seriesInfo = data.series;
                
                if (this.seriesTitle) {
                    this.seriesTitle.textContent = this.seriesInfo.title || 'Series';
                }
            }
        } catch (error) {
            console.error('Error loading series info:', error);
        }
    }

    updateEpisodeList() {
        if (!this.episodeList) return;

        // Clear existing episodes
        this.episodeList.innerHTML = '';

        // Group episodes by season if applicable
        const episodesBySeasons = this.groupEpisodesBySeason();
        
        Object.keys(episodesBySeasons).forEach(seasonNumber => {
            const episodes = episodesBySeasons[seasonNumber];
            
            // Create season header if more than one season
            if (Object.keys(episodesBySeasons).length > 1) {
                const seasonHeader = this.createSeasonHeader(seasonNumber, episodes.length);
                this.episodeList.appendChild(seasonHeader);
            }

            // Create episode items
            episodes.forEach(episode => {
                const episodeItem = this.createEpisodeItem(episode);
                this.episodeList.appendChild(episodeItem);
            });
        });
    }

    groupEpisodesBySeason() {
        const grouped = {};
        
        this.episodes.forEach(episode => {
            const season = episode.seasonNumber || 1;
            if (!grouped[season]) {
                grouped[season] = [];
            }
            grouped[season].push(episode);
        });

        return grouped;
    }

    createSeasonHeader(seasonNumber, episodeCount) {
        const header = document.createElement('div');
        header.className = 'season-header';
        header.innerHTML = `
            <h4>Season ${seasonNumber}</h4>
            <span class="episode-count">${episodeCount} episodes</span>
        `;
        return header;
    }

    createEpisodeItem(episode) {
        const isCurrentEpisode = episode.episodeId === this.player.currentEpisodeId;
        const progress = this.getEpisodeProgress(episode.episodeId);
        
        const episodeItem = document.createElement('div');
        episodeItem.className = `episode-item ${isCurrentEpisode ? 'current' : ''}`;
        episodeItem.dataset.episodeId = episode.episodeId;

        episodeItem.innerHTML = `
            <div class="episode-thumbnail">
                <img src="${episode.thumbnailUrl || '../images/default-episode.jpg'}" alt="Episode ${episode.episodeNumber}">
                <div class="episode-duration">${this.formatDuration(episode.duration)}</div>
                ${progress ? `<div class="episode-progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>` : ''}
                ${isCurrentEpisode ? '<div class="current-indicator">🔊</div>' : ''}
            </div>
            <div class="episode-info">
                <div class="episode-header">
                    <span class="episode-number">${episode.episodeNumber}</span>
                    <span class="episode-title">${episode.title}</span>
                </div>
                <p class="episode-description">${episode.description || ''}</p>
                ${progress && progress.currentTime > 0 ? 
                    `<div class="episode-progress">
                        <span>Continue from ${this.player.formatTime(progress.currentTime)}</span>
                    </div>` : ''
                }
            </div>
            <div class="episode-actions">
                ${!isCurrentEpisode ? `
                    <button class="play-episode-btn" title="Play Episode">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                ` : `
                    <div class="current-badge">Now Playing</div>
                `}
            </div>
        `;

        // Add click event to play episode
        if (!isCurrentEpisode) {
            const playBtn = episodeItem.querySelector('.play-episode-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playEpisode(episode.episodeId);
            });

            // Also allow clicking on the entire item
            episodeItem.addEventListener('click', () => {
                this.playEpisode(episode.episodeId);
            });
        }

        return episodeItem;
    }

    getEpisodeProgress(episodeId) {
        // This would be loaded from the server or stored locally
        // For now, return mock data
        const progressData = this.player.episodeProgressCache?.[episodeId];
        
        if (progressData && progressData.currentTime > 0) {
            return {
                currentTime: progressData.currentTime,
                duration: progressData.duration,
                percentage: (progressData.currentTime / progressData.duration) * 100
            };
        }
        
        return null;
    }

    async playEpisode(episodeId) {
        if (episodeId === this.player.currentEpisodeId) return;

        try {
            // Close drawer
            this.closeEpisodeDrawer();
            
            // Show loading
            this.player.showLoadingScreen();

            // Update URL
            const newUrl = `${window.location.pathname}?contentId=${this.player.currentContentId}&episodeId=${episodeId}&profileId=${this.player.currentProfileId}`;
            window.history.pushState({}, '', newUrl);

            // Update player state
            this.player.currentEpisodeId = episodeId;
            
            // Load new video content
            await this.player.loadVideoContent();
            
            // Check for previous progress
            await this.player.checkPreviousProgress();
            
            // Update episode info
            this.updateCurrentEpisodeInfo();
            this.updateEpisodeCounter();
            
            // Update episode list to show new current episode
            this.updateEpisodeList();

        } catch (error) {
            console.error('Failed to play episode:', error);
            this.player.showError('Playback Error', 'Failed to load episode. Please try again.');
        }
    }

    updateCurrentEpisodeInfo() {
        const currentEpisode = this.episodes.find(ep => ep.episodeId === this.player.currentEpisodeId);
        
        if (currentEpisode && this.currentEpisodeTitle) {
            this.currentEpisodeTitle.textContent = `S${currentEpisode.seasonNumber || 1}:E${currentEpisode.episodeNumber} - ${currentEpisode.title}`;
        }
        
        if (currentEpisode && this.currentEpisodeDescription) {
            this.currentEpisodeDescription.textContent = currentEpisode.description || '';
        }
    }

    updateEpisodeCounter() {
        if (this.episodeCounter) {
            const currentIndex = this.episodes.findIndex(ep => ep.episodeId === this.player.currentEpisodeId);
            if (currentIndex !== -1) {
                this.episodeCounter.textContent = `${currentIndex + 1} of ${this.episodes.length}`;
            }
        }
    }

    toggleEpisodeDrawer() {
        if (this.isDrawerOpen) {
            this.closeEpisodeDrawer();
        } else {
            this.openEpisodeDrawer();
        }
    }

    async openEpisodeDrawer() {
        // Load episodes if not already loaded
        if (this.episodes.length === 0) {
            await this.loadEpisodes(this.player.currentContentId);
        }

        // Load episode progress for all episodes
        await this.loadAllEpisodesProgress();

        // Show drawer
        this.episodeDrawer.classList.remove('hidden');
        this.isDrawerOpen = true;

        // Update list with fresh data
        this.updateEpisodeList();

        // Animate drawer opening
        setTimeout(() => {
            this.episodeDrawer.classList.add('open');
        }, 10);

        // Scroll to current episode
        this.scrollToCurrentEpisode();
    }

    closeEpisodeDrawer() {
        this.episodeDrawer.classList.remove('open');
        this.isDrawerOpen = false;

        // Hide drawer after animation
        setTimeout(() => {
            this.episodeDrawer.classList.add('hidden');
        }, 300);
    }

    scrollToCurrentEpisode() {
        setTimeout(() => {
            const currentEpisodeItem = this.episodeList.querySelector('.episode-item.current');
            if (currentEpisodeItem) {
                currentEpisodeItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 100);
    }

    async loadAllEpisodesProgress() {
        try {
            const response = await this.apiUsage.loadAllEpisodesProgress(this.player.currentContentId, this.player.currentProfileId);
            if (response.ok) {
                const data = await response.json();
                this.player.episodeProgressCache = {};
                
                data.progress.forEach(prog => {
                    this.player.episodeProgressCache[prog.episodeId] = prog;
                });
            }
        } catch (error) {
            console.error('Failed to load episodes progress:', error);
        }
    }

    formatDuration(seconds) {
        if (!seconds) return '';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    // Get next/previous episodes
    getNextEpisode() {
        const currentIndex = this.episodes.findIndex(ep => ep.episodeId === this.player.currentEpisodeId);
        if (currentIndex !== -1 && currentIndex < this.episodes.length - 1) {
            return this.episodes[currentIndex + 1];
        }
        return null;
    }

    getPreviousEpisode() {
        const currentIndex = this.episodes.findIndex(ep => ep.episodeId === this.player.currentEpisodeId);
        if (currentIndex > 0) {
            return this.episodes[currentIndex - 1];
        }
        return null;
    }

    hasNextEpisode() {
        return this.getNextEpisode() !== null;
    }

    hasPreviousEpisode() {
        return this.getPreviousEpisode() !== null;
    }

    async playNextEpisode() {
        const nextEpisode = this.getNextEpisode();
        if (nextEpisode) {
            await this.playEpisode(nextEpisode.episodeId);
            return true;
        }
        return false;
    }

    async playPreviousEpisode() {
        const prevEpisode = this.getPreviousEpisode();
        if (prevEpisode) {
            await this.playEpisode(prevEpisode.episodeId);
            return true;
        }
        return false;
    }

    // Auto-play next episode countdown
    showNextEpisodeCountdown(seconds = 10) {
        const nextEpisode = this.getNextEpisode();
        if (!nextEpisode) return;

        const countdown = document.getElementById('nextEpisodeCountdown');
        const nextTitle = countdown.querySelector('.next-episode-title');
        const countdownTimer = countdown.querySelector('.countdown-timer');
        const cancelBtn = countdown.querySelector('.cancel-autoplay');
        const playBtn = countdown.querySelector('.play-next-now');

        nextTitle.textContent = `S${nextEpisode.seasonNumber || 1}:E${nextEpisode.episodeNumber} - ${nextEpisode.title}`;
        countdown.classList.remove('hidden');

        let timeLeft = seconds;
        countdownTimer.textContent = timeLeft;

        const timer = setInterval(() => {
            timeLeft--;
            countdownTimer.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.playNextEpisode();
                countdown.classList.add('hidden');
            }
        }, 1000);

        // Cancel autoplay
        cancelBtn.onclick = () => {
            clearInterval(timer);
            countdown.classList.add('hidden');
        };

        // Play immediately
        playBtn.onclick = () => {
            clearInterval(timer);
            countdown.classList.add('hidden');
            this.playNextEpisode();
        };

        // Auto-hide after countdown
        setTimeout(() => {
            clearInterval(timer);
            countdown.classList.add('hidden');
        }, seconds * 1000 + 500);
    }
}

// Export the class
export { EpisodeManager };