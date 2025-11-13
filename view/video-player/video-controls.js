// Video Controls Component
import { APIUsage } from '../APIUsage.js';

class VideoControls {
    constructor(videoPlayer) {
        this.apiUsage = new APIUsage();
        this.player = videoPlayer;
        this.video = videoPlayer.video;
        this.isDraggingProgress = false;
        this.isDraggingVolume = false;
        
        this.initializeControls();
    }

    initializeControls() {
        // Get control elements
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.skipBackBtn = document.getElementById('skipBackBtn');
        this.skipForwardBtn = document.getElementById('skipForwardBtn');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.nextEpisodeBtn = document.getElementById('nextEpisodeBtn');
        this.episodeListBtn = document.getElementById('episodeListBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        
        this.progressBar = document.getElementById('progressBar');
        this.progressFilled = document.getElementById('progressFilled');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.durationDisplay = document.getElementById('durationDisplay');

        // Settings panel
        this.settingsPanel = document.getElementById('settingsPanel');
        this.qualitySelect = document.getElementById('qualitySelect');
        this.speedSelect = document.getElementById('speedSelect');
        this.subtitleSelect = document.getElementById('subtitleSelect');

        this.setupControlEvents();
        this.setupProgressBar();
        this.setupVolumeControl();
        this.setupSettingsPanel();
    }

    setupControlEvents() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => {
            this.player.togglePlayPause();
        });

        // Skip buttons
        this.skipBackBtn.addEventListener('click', () => {
            this.player.skipBackward();
            this.showSkipFeedback('backward');
        });

        this.skipForwardBtn.addEventListener('click', () => {
            this.player.skipForward();
            this.showSkipFeedback('forward');
        });

        // Volume button
        this.volumeBtn.addEventListener('click', () => {
            this.player.toggleMute();
        });

        // Fullscreen button
        this.fullscreenBtn.addEventListener('click', () => {
            this.player.toggleFullscreen();
        });

        // Next episode button
        this.nextEpisodeBtn.addEventListener('click', () => {
            this.player.playNextEpisode();
        });

        // Episode list button
        this.episodeListBtn.addEventListener('click', () => {
            this.player.episodeManager.toggleEpisodeDrawer();
        });

        // Settings button
        this.settingsBtn.addEventListener('click', () => {
            this.toggleSettingsPanel();
        });
    }

    setupProgressBar() {
        const progressContainer = this.progressBar;
        
        // Click to seek
        progressContainer.addEventListener('click', (e) => {
            if (!this.isDraggingProgress) {
                const rect = progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                const time = pos * this.video.duration;
                this.player.setCurrentTime(time);
            }
        });

        // Drag to seek
        let isDragging = false;
        
        const startDrag = (e) => {
            isDragging = true;
            this.isDraggingProgress = true;
            this.updateProgressFromEvent(e);
            
            // Pause video while dragging
            this.wasPaused = this.video.paused;
            this.video.pause();
        };

        const dragProgress = (e) => {
            if (isDragging) {
                this.updateProgressFromEvent(e);
            }
        };

        const endDrag = (e) => {
            if (isDragging) {
                isDragging = false;
                this.isDraggingProgress = false;
                this.updateProgressFromEvent(e);
                
                // Resume playback if it was playing before
                if (!this.wasPaused) {
                    this.video.play();
                }
            }
        };

        progressContainer.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', dragProgress);
        document.addEventListener('mouseup', endDrag);

        // Touch events for mobile
        progressContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrag(e.touches[0]);
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                dragProgress(e.touches[0]);
            }
        });

        document.addEventListener('touchend', (e) => {
            if (isDragging) {
                e.preventDefault();
                endDrag(e.changedTouches[0]);
            }
        });

        // Hover preview (optional feature)
        this.setupProgressPreview();
    }

    setupProgressPreview() {
        const progressContainer = this.progressBar;
        const preview = document.getElementById('progressPreview');
        
        if (!preview) return;

        progressContainer.addEventListener('mousemove', (e) => {
            if (!this.isDraggingProgress && this.video.duration) {
                const rect = progressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                const time = pos * this.video.duration;
                
                preview.textContent = this.player.formatTime(time);
                preview.style.left = `${e.clientX - rect.left}px`;
                preview.classList.remove('hidden');
            }
        });

        progressContainer.addEventListener('mouseleave', () => {
            preview.classList.add('hidden');
        });
    }

    updateProgressFromEvent(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const time = pos * this.video.duration;
        
        this.player.setCurrentTime(time);
        this.updateProgressBar(pos);
        this.updateTimeDisplay(time);
    }

    updateProgress() {
        if (!this.isDraggingProgress && this.video.duration) {
            const progress = this.video.currentTime / this.video.duration;
            this.updateProgressBar(progress);
            this.updateTimeDisplay(this.video.currentTime);
        }
    }

    updateProgressBar(progress) {
        this.progressFilled.style.width = `${progress * 100}%`;
    }

    updateTimeDisplay(currentTime) {
        this.timeDisplay.textContent = this.player.formatTime(currentTime);
    }

    updateDuration() {
        if (this.video.duration) {
            this.durationDisplay.textContent = this.player.formatTime(this.video.duration);
        }
    }

    setupVolumeControl() {
        const volumeContainer = document.querySelector('.volume-control');
        
        // Volume slider
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.player.setVolume(volume);
            this.updateVolumeIcon(volume);
        });

        // Drag volume slider
        let isDraggingVolume = false;
        
        const startVolumeDrag = (e) => {
            isDraggingVolume = true;
            this.isDraggingVolume = true;
            this.updateVolumeFromEvent(e);
        };

        const dragVolume = (e) => {
            if (isDraggingVolume) {
                this.updateVolumeFromEvent(e);
            }
        };

        const endVolumeDrag = () => {
            isDraggingVolume = false;
            this.isDraggingVolume = false;
        };

        this.volumeSlider.addEventListener('mousedown', startVolumeDrag);
        document.addEventListener('mousemove', dragVolume);
        document.addEventListener('mouseup', endVolumeDrag);

        // Show/hide volume slider on hover
        volumeContainer.addEventListener('mouseenter', () => {
            volumeContainer.classList.add('expanded');
        });

        volumeContainer.addEventListener('mouseleave', () => {
            if (!this.isDraggingVolume) {
                volumeContainer.classList.remove('expanded');
            }
        });

        // Initialize volume
        this.updateVolumeSlider();
    }

    updateVolumeFromEvent(e) {
        const rect = this.volumeSlider.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        
        this.player.setVolume(pos);
        this.volumeSlider.value = pos;
        this.updateVolumeIcon(pos);
    }

    updateVolumeSlider() {
        this.volumeSlider.value = this.player.getVolume();
        this.updateVolumeIcon(this.player.getVolume());
    }

    updateVolumeIcon(volume) {
        const volumeIcon = this.volumeBtn.querySelector('svg use');
        
        if (this.player.isMuted() || volume === 0) {
            volumeIcon.setAttribute('href', '#volume-muted');
        } else if (volume < 0.5) {
            volumeIcon.setAttribute('href', '#volume-low');
        } else {
            volumeIcon.setAttribute('href', '#volume-high');
        }
    }

    updateMuteButton() {
        this.updateVolumeIcon(this.player.getVolume());
    }

    updateFullscreenButton() {
        const fullscreenIcon = this.fullscreenBtn.querySelector('svg use');
        
        if (this.player.isFullscreen) {
            fullscreenIcon.setAttribute('href', '#fullscreen-exit');
            this.fullscreenBtn.setAttribute('title', 'Exit Fullscreen (F)');
        } else {
            fullscreenIcon.setAttribute('href', '#fullscreen');
            this.fullscreenBtn.setAttribute('title', 'Fullscreen (F)');
        }
    }

    setupSettingsPanel() {
        // Quality settings
        this.qualitySelect.addEventListener('change', (e) => {
            const quality = e.target.value;
            this.changeVideoQuality(quality);
        });

        // Speed settings
        this.speedSelect.addEventListener('change', (e) => {
            const speed = parseFloat(e.target.value);
            this.player.setPlaybackSpeed(speed);
        });

        // Subtitle settings
        this.subtitleSelect.addEventListener('change', (e) => {
            const subtitleTrack = e.target.value;
            this.changeSubtitles(subtitleTrack);
        });

        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target) && !this.settingsBtn.contains(e.target)) {
                this.closeSettingsPanel();
            }
        });
    }

    toggleSettingsPanel() {
        this.settingsPanel.classList.toggle('hidden');
    }

    closeSettingsPanel() {
        this.settingsPanel.classList.add('hidden');
    }

    async changeVideoQuality(quality) {
        if (!this.player.videoSource) return;

        try {
            const currentTime = this.video.currentTime;
            const wasPaused = this.video.paused;
            
            // Get new quality source
            const response = await this.apiUsage.changeVideoQuality(this.player.currentContentId, this.player.currentEpisodeId, this.player.currentProfileId, quality);
            if (response.ok) {
                const data = await response.json();
                
                // Update video source
                this.video.src = data.source.videoUrl;
                this.video.load();
                
                // Restore position and play state
                this.video.addEventListener('loadedmetadata', () => {
                    this.video.currentTime = currentTime;
                    if (!wasPaused) {
                        this.video.play();
                    }
                }, { once: true });
                
                this.player.videoSource = data.source;
            }
        } catch (error) {
            console.error('Failed to change video quality:', error);
        }
    }

    changeSubtitles(trackId) {
        const tracks = this.video.textTracks;
        
        // Disable all tracks
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].mode = 'disabled';
        }
        
        // Enable selected track
        if (trackId !== 'none' && tracks[trackId]) {
            tracks[trackId].mode = 'showing';
        }
    }

    showSkipFeedback(direction) {
        const feedback = document.getElementById('skipFeedback');
        const icon = feedback.querySelector('.skip-icon');
        const text = feedback.querySelector('.skip-text');
        
        if (direction === 'forward') {
            icon.innerHTML = '⏭';
            text.textContent = '+10 seconds';
        } else {
            icon.innerHTML = '⏮';
            text.textContent = '-10 seconds';
        }
        
        feedback.classList.remove('hidden');
        feedback.classList.add('show');
        
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                feedback.classList.add('hidden');
            }, 300);
        }, 1000);
    }

    // Update next episode button visibility
    updateNextEpisodeButton() {
        const nextEpisode = this.player.episodes.find(
            ep => ep.episodeId === this.player.currentEpisodeId + 1
        );
        
        if (nextEpisode) {
            this.nextEpisodeBtn.classList.remove('hidden');
        } else {
            this.nextEpisodeBtn.classList.add('hidden');
        }
    }

    // Load available qualities for settings
    async loadAvailableQualities() {
        try {
            const response = await this.apiUsage.loadAvailableQualities(this.player.currentContentId, this.player.currentEpisodeId);
            if (response.ok) {
                const data = await response.json();
                this.populateQualitySelect(data.qualities);
            }
        } catch (error) {
            console.error('Failed to load qualities:', error);
        }
    }

    populateQualitySelect(qualities) {
        this.qualitySelect.innerHTML = '';
        
        qualities.forEach(quality => {
            const option = document.createElement('option');
            option.value = quality.quality;
            option.textContent = `${quality.quality}p`;
            
            if (quality.quality === this.player.videoSource?.quality) {
                option.selected = true;
            }
            
            this.qualitySelect.appendChild(option);
        });
    }

    // Mobile touch gestures
    setupTouchGestures() {
        let startX, startY, startTime;
        const minSwipeDistance = 50;
        const maxSwipeTime = 300;
        
        this.video.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
        });
        
        this.video.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            if (deltaTime <= maxSwipeTime) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (Math.abs(deltaX) > minSwipeDistance) {
                        if (deltaX > 0) {
                            this.player.skipForward();
                        } else {
                            this.player.skipBackward();
                        }
                    }
                }
            }
        });
    }
}