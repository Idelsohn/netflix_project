// Video Player Main Controller
import { APIUsage } from '../APIUsage.js';
import { VideoControls } from './video-controls.js';
import { EpisodeManager } from './episode-manager.js';
import { ProgressSync } from './progress-sync.js';

class VideoPlayer {
    constructor() {
        this.apiUsage = new APIUsage();
        this.video = null;
        this.currentContentId = null;
        this.currentEpisodeId = 1;
        this.currentProfileId = null;
        this.isFullscreen = false;
        this.controlsTimeout = null;
        this.progressSyncInterval = null;
        this.lastSavedTime = 0;
        this.videoSource = null;
        this.episodes = [];
        this.isInitialized = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        try {
            // Get URL parameters
            this.parseUrlParameters();
            
            // Verify authentication
            await this.verifyAuthentication();
            
            // Initialize DOM elements
            this.initializeElements();
            
            // Load video content
            await this.loadVideoContent();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize components
            this.videoControls = new VideoControls(this);
            this.episodeManager = new EpisodeManager(this);
            this.progressSync = new ProgressSync(this);
            
            // Check for previous progress
            await this.checkPreviousProgress();
            
            this.isInitialized = true;
            this.hideLoadingScreen();
            
        } catch (error) {
            console.error('Failed to initialize video player:', error);
            this.showError('Failed to load video player', error.message);
        }
    }

    parseUrlParameters() {
        const params = new URLSearchParams(window.location.search);
        this.currentContentId = parseInt(params.get('contentId'));
        this.currentEpisodeId = parseInt(params.get('episodeId')) || 1;
        this.currentProfileId = params.get('profileId') || localStorage.getItem('selectedProfileId');

        if (!this.currentContentId || !this.currentProfileId) {
            throw new Error('Missing required parameters: contentId and profileId');
        }
    }

    async verifyAuthentication() {
        // Check if user is authenticated
        const hasActiveSession = await this.apiUsage.hasActiveSession();
        if (!hasActiveSession.success) {
            this.logout();
            return;
        }
    }

    initializeElements() {
        this.video = document.getElementById('mainVideo');
        this.videoOverlay = document.getElementById('videoOverlay');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.continueModal = document.getElementById('continueModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.bufferingIndicator = document.getElementById('bufferingIndicator');
        
        if (!this.video) {
            throw new Error('Video element not found');
        }
    }

    async loadVideoContent() {
        try {
            // Get video source
            const response = await this.apiUsage.loadVideoContent(this.currentContentId, this.currentEpisodeId, this.currentProfileId);
            if (!response.ok) {
                throw new Error('Video source not found');
            }

            const data = await response.json();
            this.videoSource = data.source;

            // Set video source - add relative path prefix for local files
            this.video.src = `../../${this.videoSource.videoUrl}`;
            this.video.preload = 'metadata';

            // Load episodes list
            await this.loadEpisodes();

        } catch (error) {
            console.error('Failed to load video content:', error);
            throw error;
        }
    }

    async loadEpisodes() {
        try {
            const response = await this.apiUsage.loadEpisodes(this.currentContentId);
            if (response.ok) {
                const data = await response.json();
                this.episodes = data.episodes || [];
            }
        } catch (error) {
            console.error('Failed to load episodes:', error);
            this.episodes = [];
        }
    }

    async checkPreviousProgress() {
        try {
            const response = this.apiUsage.checkPreviousProgress(this.currentContentId, this.currentEpisodeId, this.currentProfileId);
            if (response.ok) {
                const data = await response.json();
                const progress = data.progress;

                if (progress && progress.currentTime > 30) { // Show modal if watched more than 30 seconds
                    this.showContinueModal(progress.currentTime);
                } else {
                    this.startPlayback();
                }
            } else {
                this.startPlayback();
            }
        } catch (error) {
            console.error('Failed to check progress:', error);
            this.startPlayback();
        }
    }

    showContinueModal(currentTime) {
        const modal = this.continueModal;
        const timeElement = document.getElementById('continueTime');
        const continueBtn = document.getElementById('continueBtn');
        const restartBtn = document.getElementById('restartBtn');

        timeElement.textContent = this.formatTime(currentTime);
        modal.classList.remove('hidden');

        continueBtn.onclick = () => {
            this.video.currentTime = currentTime;
            this.startPlayback();
            modal.classList.add('hidden');
        };

        restartBtn.onclick = () => {
            this.video.currentTime = 0;
            this.startPlayback();
            modal.classList.add('hidden');
        };
    }

    startPlayback() {
        // Auto-play if user has interacted with the page
        if (document.hasFocus()) {
            this.video.play().catch(error => {
                console.log('Auto-play prevented:', error);
                // Show play button
                this.showCenterPlayButton();
            });
        } else {
            this.showCenterPlayButton();
        }

        // Start progress sync
        this.progressSync.start();
    }

    showCenterPlayButton() {
        const centerPlayBtn = document.getElementById('centerPlayBtn');
        centerPlayBtn.classList.remove('hidden');
    }

    hideCenterPlayButton() {
        const centerPlayBtn = document.getElementById('centerPlayBtn');
        centerPlayBtn.classList.add('hidden');
    }

    setupEventListeners() {
        // Video events
        this.video.addEventListener('loadstart', () => this.showBuffering());
        this.video.addEventListener('canplay', () => this.hideBuffering());
        this.video.addEventListener('waiting', () => this.showBuffering());
        this.video.addEventListener('playing', () => this.hideBuffering());
        
        this.video.addEventListener('play', () => {
            this.hideCenterPlayButton();
            this.updatePlayPauseButton(false);
        });
        
        this.video.addEventListener('pause', () => {
            this.updatePlayPauseButton(true);
        });

        this.video.addEventListener('ended', () => {
            this.onVideoEnded();
        });

        this.video.addEventListener('error', (e) => {
            this.showError('Video Error', 'Failed to load video. Please try again.');
        });

        this.video.addEventListener('timeupdate', () => {
            if (this.videoControls) {
                this.videoControls.updateProgress();
            }
        });

        this.video.addEventListener('loadedmetadata', () => {
            if (this.videoControls) {
                this.videoControls.updateDuration();
            }
        });

        // Center play button
        const centerPlayBtn = document.querySelector('.play-button-large');
        centerPlayBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        // Video overlay for controls
        this.setupControlsVisibility();

        // Back button
        const backButton = document.getElementById('backButton');
        backButton.addEventListener('click', () => {
            this.goBackToFeed();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Fullscreen change
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
    }

    setupControlsVisibility() {
        let mouseTimer;
        
        const showControls = () => {
            this.videoOverlay.classList.add('show');
            document.body.style.cursor = 'default';
            
            clearTimeout(mouseTimer);
            mouseTimer = setTimeout(() => {
                if (!this.video.paused) {
                    this.videoOverlay.classList.remove('show');
                    document.body.style.cursor = 'none';
                }
            }, 3000);
        };

        const hideControls = () => {
            if (!this.video.paused) {
                this.videoOverlay.classList.remove('show');
                document.body.style.cursor = 'none';
            }
        };

        // Show controls on mouse move
        document.addEventListener('mousemove', showControls);
        document.addEventListener('mouseenter', showControls);
        
        // Show controls when paused
        this.video.addEventListener('pause', showControls);
        this.video.addEventListener('play', () => {
            setTimeout(hideControls, 3000);
        });

        // Always show controls initially
        showControls();
    }

    handleKeyboardShortcuts(e) {
        if (!this.isInitialized) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.skipBackward();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.skipForward();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.adjustVolume(0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.adjustVolume(-0.1);
                break;
            case 'KeyF':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'KeyM':
                e.preventDefault();
                this.toggleMute();
                break;
            case 'Escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                break;
        }
    }

    togglePlayPause() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }

    skipBackward() {
        this.video.currentTime = Math.max(0, this.video.currentTime - 10);
    }

    skipForward() {
        this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
    }

    adjustVolume(delta) {
        this.video.volume = Math.max(0, Math.min(1, this.video.volume + delta));
        if (this.videoControls) {
            this.videoControls.updateVolumeSlider();
        }
    }

    toggleMute() {
        this.video.muted = !this.video.muted;
        if (this.videoControls) {
            this.videoControls.updateMuteButton();
        }
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const container = document.querySelector('.video-player-container');
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    onFullscreenChange() {
        this.isFullscreen = !!(document.fullscreenElement || 
                              document.mozFullScreenElement || 
                              document.webkitFullscreenElement);
        
        if (this.videoControls) {
            this.videoControls.updateFullscreenButton();
        }
    }

    async onVideoEnded() {
        // Mark as completed
        try {
            await this.apiUsage.markAsCompleted({
                contentId: this.currentContentId,
                episodeId: this.currentEpisodeId,
                profileId: this.currentProfileId
            });
        } catch (error) {
            console.error('Failed to mark as completed:', error);
        }

        // Auto-play next episode if available
        const nextEpisode = this.episodes.find(ep => ep.episodeId === this.currentEpisodeId + 1);
        if (nextEpisode) {
            // Show "Next Episode" countdown or immediate play
            setTimeout(() => {
                this.playNextEpisode();
            }, 3000);
        }
    }

    async playNextEpisode() {
        const nextEpisodeId = this.currentEpisodeId + 1;
        const nextEpisode = this.episodes.find(ep => ep.episodeId === nextEpisodeId);
        
        if (nextEpisode) {
            // Update URL and reload video
            const newUrl = `${window.location.pathname}?contentId=${this.currentContentId}&episodeId=${nextEpisodeId}&profileId=${this.currentProfileId}`;
            window.history.pushState({}, '', newUrl);
            
            this.currentEpisodeId = nextEpisodeId;
            await this.loadVideoContent();
            this.startPlayback();
        }
    }

    updatePlayPauseButton(isPaused) {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (isPaused) {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        } else {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        }
    }

    showBuffering() {
        this.bufferingIndicator.classList.remove('hidden');
    }

    hideBuffering() {
        this.bufferingIndicator.classList.add('hidden');
    }

    showLoadingScreen() {
        this.loadingScreen.classList.remove('hidden');
    }

    hideLoadingScreen() {
        this.loadingScreen.classList.add('hidden');
    }

    showError(title, message) {
        const errorTitle = this.errorMessage.querySelector('h3');
        const errorText = document.getElementById('errorText');
        const retryBtn = document.getElementById('retryBtn');
        const backBtn = document.getElementById('backToFeedBtn');

        errorTitle.textContent = title;
        errorText.textContent = message;

        retryBtn.onclick = () => {
            this.errorMessage.classList.add('hidden');
            this.init();
        };

        backBtn.onclick = () => {
            this.goBackToFeed();
        };

        this.errorMessage.classList.remove('hidden');
    }

    goBackToFeed() {
        // Stop progress sync
        if (this.progressSync) {
            this.progressSync.stop();
        }

        // Go back to feed
        window.location.href = '../feed/feed.html';
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // Getters for other components
    getCurrentTime() {
        return this.video.currentTime;
    }

    getDuration() {
        return this.video.duration || 0;
    }

    getVolume() {
        return this.video.volume;
    }

    isMuted() {
        return this.video.muted;
    }

    setCurrentTime(time) {
        this.video.currentTime = time;
    }

    setVolume(volume) {
        this.video.volume = Math.max(0, Math.min(1, volume));
    }

    setPlaybackSpeed(speed) {
        this.video.playbackRate = speed;
    }

    getPlaybackSpeed() {
        return this.video.playbackRate;
    }
}

// Initialize video player when script loads
window.videoPlayer = new VideoPlayer();