// Progress Synchronization Component
import { APIUsage } from '../APIUsage.js';

class ProgressSync {
    constructor(videoPlayer) {
        this.apiUsage = new APIUsage();
        this.player = videoPlayer;
        this.video = videoPlayer.video;
        
        this.syncInterval = null;
        this.lastSyncTime = 0;
        this.syncFrequency = 5000; // Sync every 5 seconds
        this.isActive = false;
        this.pendingUpdates = new Map();
        this.syncQueue = [];
        this.isProcessingQueue = false;
        
        this.setupProgressTracking();
    }

    setupProgressTracking() {
        // Track significant playback events
        this.video.addEventListener('play', () => this.onPlaybackStart());
        this.video.addEventListener('pause', () => this.onPlaybackPause());
        this.video.addEventListener('seeking', () => this.onSeekStart());
        this.video.addEventListener('seeked', () => this.onSeekEnd());
        this.video.addEventListener('ended', () => this.onPlaybackEnd());
        this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.syncProgressImmediate();
            }
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.syncProgressImmediate(true);
        });
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.startPeriodicSync();
        console.log('Progress sync started');
    }

    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.stopPeriodicSync();
        
        // Final sync before stopping
        this.syncProgressImmediate();
        console.log('Progress sync stopped');
    }

    startPeriodicSync() {
        this.stopPeriodicSync(); // Clear any existing interval
        
        this.syncInterval = setInterval(() => {
            if (this.shouldSync()) {
                this.syncProgress();
            }
        }, this.syncFrequency);
    }

    stopPeriodicSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    shouldSync() {
        // Don't sync if video is not loaded or user is seeking
        if (!this.video.duration || this.video.seeking) {
            return false;
        }

        // Don't sync too frequently
        const now = Date.now();
        if (now - this.lastSyncTime < this.syncFrequency) {
            return false;
        }

        // Only sync if video is playing or paused (not when ended)
        return !this.video.ended;
    }

    onPlaybackStart() {
        this.syncProgress();
    }

    onPlaybackPause() {
        this.syncProgressImmediate();
    }

    onSeekStart() {
        // Don't sync while seeking
        this.stopPeriodicSync();
    }

    onSeekEnd() {
        // Resume syncing and sync current position immediately
        this.startPeriodicSync();
        this.syncProgressImmediate();
    }

    onPlaybackEnd() {
        // Mark as completed
        this.markAsCompleted();
    }

    onTimeUpdate() {
        // Check for significant time jumps (manual seeks)
        const currentTime = this.video.currentTime;
        const timeDiff = Math.abs(currentTime - this.lastKnownTime);
        
        if (timeDiff > 5 && this.lastKnownTime > 0) {
            // User seeked manually, sync immediately
            this.syncProgressImmediate();
        }
        
        this.lastKnownTime = currentTime;
    }

    async syncProgress() {
        if (!this.isActive || this.video.seeking) return;

        const progressData = this.getProgressData();
        if (!progressData) return;

        // Add to queue
        this.addToSyncQueue(progressData);
        
        // Process queue
        this.processQueue();
        
        this.lastSyncTime = Date.now();
    }

    async syncProgressImmediate(isUnload = false) {
        if (this.video.seeking && !isUnload) return;

        const progressData = this.getProgressData();
        if (!progressData) return;

        try {
            if (isUnload) {
                // Use sendBeacon for reliable data sending on page unload
                this.sendBeacon(progressData);
            } else {
                await this.sendProgressUpdate(progressData);
            }
        } catch (error) {
            console.error('Failed to sync progress:', error);
            // Add to queue for retry
            this.addToSyncQueue(progressData);
        }
    }

    getProgressData() {
        if (!this.video.duration || this.video.duration === 0) return null;

        const currentTime = Math.round(this.video.currentTime);
        const duration = Math.round(this.video.duration);
        const completionPercentage = (currentTime / duration) * 100;

        return {
            contentId: this.player.currentContentId,
            episodeId: this.player.currentEpisodeId,
            profileId: this.player.currentProfileId,
            currentTime: currentTime,
            duration: duration,
            completionPercentage: Math.round(completionPercentage),
            isCompleted: completionPercentage >= 90, // Consider 90%+ as completed
            lastWatched: new Date().toISOString(),
            videoSource: this.player.videoSource?.sourceId || null
        };
    }

    async sendProgressUpdate(progressData) {
        const response = await this.apiUsage.sendProgressUpdate(progressData);
        if (!response.ok) {
            throw new Error(`Progress sync failed: ${response.status}`);
        }

        return await response.json();
    }

    sendBeacon(progressData) {
        // Use sendBeacon for reliable data transmission on page unload
        if ('sendBeacon' in navigator) {
            const data = JSON.stringify(progressData);
            const blob = new Blob([data], { type: 'application/json' });
            
            navigator.sendBeacon('/api/video/update-progress', blob);
        } else {
            // Fallback for older browsers
            this.sendProgressUpdate(progressData).catch(() => {
                // Ignore errors on page unload
            });
        }
    }

    addToSyncQueue(progressData) {
        // Remove any existing update for the same episode
        this.syncQueue = this.syncQueue.filter(item => 
            !(item.contentId === progressData.contentId && 
              item.episodeId === progressData.episodeId)
        );
        
        // Add new update
        this.syncQueue.push(progressData);
    }

    async processQueue() {
        if (this.isProcessingQueue || this.syncQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        try {
            // Process updates in batches
            while (this.syncQueue.length > 0) {
                const batch = this.syncQueue.splice(0, 5); // Process up to 5 at once
                
                await Promise.allSettled(
                    batch.map(update => this.sendProgressUpdate(update))
                );
                
                // Small delay between batches
                if (this.syncQueue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        } catch (error) {
            console.error('Error processing sync queue:', error);
        } finally {
            this.isProcessingQueue = false;
        }
    }

    async markAsCompleted() {
        const completionData = {
            contentId: this.player.currentContentId,
            episodeId: this.player.currentEpisodeId,
            profileId: this.player.currentProfileId,
            isCompleted: true,
            completionPercentage: 100,
            completedAt: new Date().toISOString()
        };

        try {
            await this.apiUsage.markAsCompleted(completionData);

            // Update local cache
            this.updateLocalProgress(completionData);
            
            console.log('Episode marked as completed');
        } catch (error) {
            console.error('Failed to mark episode as completed:', error);
        }
    }

    async loadSavedProgress() {
        try {
            const response = await this.apiUsage.loadSavedProgress(this.player.currentContentId, this.player.currentEpisodeId, this.player.currentProfileId);
            if (response.ok) {
                const data = await response.json();
                return data.progress;
            }
        } catch (error) {
            console.error('Failed to load saved progress:', error);
        }
        
        return null;
    }

    async loadAllProgress(contentId) {
        try {
            const response = await this.apiUsage.loadAllProgress(contentId, this.player.currentProfileId);
            if (response.ok) {
                const data = await response.json();
                
                // Cache all progress data
                this.updateProgressCache(data.progress);
                
                return data.progress;
            }
        } catch (error) {
            console.error('Failed to load all progress:', error);
        }
        
        return [];
    }

    updateProgressCache(progressList) {
        if (!this.player.episodeProgressCache) {
            this.player.episodeProgressCache = {};
        }

        progressList.forEach(progress => {
            this.player.episodeProgressCache[progress.episodeId] = progress;
        });
    }

    updateLocalProgress(progressData) {
        if (!this.player.episodeProgressCache) {
            this.player.episodeProgressCache = {};
        }

        this.player.episodeProgressCache[progressData.episodeId] = progressData;
    }

    // Cross-device synchronization
    async checkForRemoteUpdates() {
        try {
            const lastSyncTime = localStorage.getItem('lastProgressSync');
            const params = lastSyncTime ? `?since=${lastSyncTime}` : '';
            
            const response = await this.apiUsage.checkForRemoteUpdates(this.player.currentProfileId, params);
            if (response.ok) {
                const data = await response.json();
                
                if (data.updates && data.updates.length > 0) {
                    // Update cache with remote changes
                    this.updateProgressCache(data.updates);
                    
                    // Check if current episode was updated remotely
                    const currentEpisodeUpdate = data.updates.find(update => 
                        update.contentId === this.player.currentContentId && 
                        update.episodeId === this.player.currentEpisodeId
                    );

                    if (currentEpisodeUpdate && this.shouldApplyRemoteUpdate(currentEpisodeUpdate)) {
                        this.applyRemoteUpdate(currentEpisodeUpdate);
                    }
                }
                
                // Update last sync time
                localStorage.setItem('lastProgressSync', new Date().toISOString());
            }
        } catch (error) {
            console.error('Failed to check for remote updates:', error);
        }
    }

    shouldApplyRemoteUpdate(remoteProgress) {
        const currentTime = this.video.currentTime;
        const timeDifference = Math.abs(remoteProgress.currentTime - currentTime);
        
        // Only apply remote update if the difference is significant (more than 10 seconds)
        // and the remote progress is more recent
        return timeDifference > 10 && 
               new Date(remoteProgress.lastWatched) > new Date(Date.now() - 30000); // Within last 30 seconds
    }

    applyRemoteUpdate(remoteProgress) {
        // Show notification about cross-device sync
        this.showSyncNotification(remoteProgress);
        
        // Update video position
        this.video.currentTime = remoteProgress.currentTime;
    }

    showSyncNotification(remoteProgress) {
        const notification = document.getElementById('syncNotification');
        if (!notification) return;

        const message = notification.querySelector('.sync-message');
        const timeSpan = notification.querySelector('.sync-time');
        
        message.textContent = 'Synced from another device';
        timeSpan.textContent = `Resumed at ${this.player.formatTime(remoteProgress.currentTime)}`;
        
        notification.classList.remove('hidden');
        notification.classList.add('show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    // Statistics and analytics
    async updateViewingStats() {
        const statsData = {
            contentId: this.player.currentContentId,
            episodeId: this.player.currentEpisodeId,
            profileId: this.player.currentProfileId,
            sessionDuration: this.getSessionDuration(),
            quality: this.player.videoSource?.quality || null,
            device: this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        try {
            await this.apiUsage.updateViewingStats(statsData);
        } catch (error) {
            console.error('Failed to update viewing stats:', error);
        }
    }

    getSessionDuration() {
        return this.sessionStartTime ? Date.now() - this.sessionStartTime : 0;
    }

    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            platform: navigator.platform
        };
    }

    // Retry mechanism for failed syncs
    scheduleRetry(progressData, attempts = 0) {
        const maxAttempts = 3;
        const retryDelay = Math.min(1000 * Math.pow(2, attempts), 10000); // Exponential backoff

        if (attempts >= maxAttempts) {
            console.error('Max retry attempts reached for progress sync');
            return;
        }

        setTimeout(() => {
            this.sendProgressUpdate(progressData).catch(() => {
                this.scheduleRetry(progressData, attempts + 1);
            });
        }, retryDelay);
    }

    // Public API methods
    getCurrentProgress() {
        return this.getProgressData();
    }

    async forceSync() {
        await this.syncProgressImmediate();
    }

    getLastSyncTime() {
        return this.lastSyncTime;
    }

    isActive() {
        return this.isActive;
    }
}