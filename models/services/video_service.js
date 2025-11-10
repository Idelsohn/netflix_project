const WatchProgress = require('../schemas/watch_progress_schema');
const VideoSources = require('../schemas/video_sources_schema');

// Get user's watch progress for specific content and episode
async function getWatchProgress(userId, profileId, contentId, episodeId = 1) {
    try {
        return await WatchProgress.findUserProgress(userId, profileId, contentId, episodeId);
    } catch (error) {
        throw new Error(`Failed to get watch progress: ${error.message}`);
    }
}

// Save or update user's watch progress
async function saveWatchProgress(progressData) {
    try {
        const { userId, profileId, contentId, episodeId, currentTime, duration, deviceInfo } = progressData;
        
        // Validate required fields
        if (!userId || !profileId || !contentId || currentTime === undefined || !duration) {
            throw new Error('Missing required fields for watch progress');
        }

        // Find existing progress or create new one
        let progress = await WatchProgress.findUserProgress(userId, profileId, contentId, episodeId);
        
        if (progress) {
            // Update existing progress
            progress.currentTime = currentTime;
            progress.duration = duration;
            if (deviceInfo) progress.deviceInfo = deviceInfo;
        } else {
            // Create new progress entry
            progress = new WatchProgress({
                userId,
                profileId,
                contentId,
                episodeId: episodeId || 1,
                currentTime,
                duration,
                deviceInfo: deviceInfo || 'unknown'
            });
        }

        // Calculate and save
        progress.calculateWatchPercentage();
        return await progress.save();
    } catch (error) {
        throw new Error(`Failed to save watch progress: ${error.message}`);
    }
}

// Mark content as completed
async function markAsCompleted(userId, profileId, contentId, episodeId = 1) {
    try {
        const progress = await WatchProgress.findUserProgress(userId, profileId, contentId, episodeId);
        
        if (progress) {
            progress.completed = true;
            progress.watchPercentage = 100;
            progress.lastWatched = new Date();
            return await progress.save();
        } else {
            throw new Error('Progress not found');
        }
    } catch (error) {
        throw new Error(`Failed to mark as completed: ${error.message}`);
    }
}

// Get user's recent watch history
async function getRecentWatchHistory(userId, profileId, limit = 10) {
    try {
        return await WatchProgress.getRecentHistory(userId, profileId, limit);
    } catch (error) {
        throw new Error(`Failed to get watch history: ${error.message}`);
    }
}

// Get all progress for a specific content (all episodes)
async function getContentProgress(userId, profileId, contentId) {
    try {
        return await WatchProgress.find({
            userId,
            profileId,
            contentId
        }).sort({ episodeId: 1 });
    } catch (error) {
        throw new Error(`Failed to get content progress: ${error.message}`);
    }
}

// Get video sources for specific content and episode
async function getVideoSources(contentId, episodeId = 1) {
    try {
        return await VideoSources.findActiveVideos(contentId, episodeId);
    } catch (error) {
        throw new Error(`Failed to get video sources: ${error.message}`);
    }
}

// Get best quality video source
async function getBestVideoSource(contentId, episodeId = 1) {
    try {
        const bestSource = await VideoSources.findBestQuality(contentId, episodeId);
        if (!bestSource) {
            // Fallback to any active source
            const sources = await VideoSources.findActiveVideos(contentId, episodeId);
            return sources.length > 0 ? sources[0] : null;
        }
        return bestSource;
    } catch (error) {
        throw new Error(`Failed to get best video source: ${error.message}`);
    }
}

// Add new video source
async function addVideoSource(sourceData) {
    try {
        const { contentId, episodeId, videoUrl, sourceType, quality, duration } = sourceData;
        
        // Validate required fields
        if (!contentId || !videoUrl || !sourceType || !duration) {
            throw new Error('Missing required fields for video source');
        }

        const videoSource = new VideoSources({
            contentId,
            episodeId: episodeId || 1,
            videoUrl,
            sourceType,
            quality: quality || '720p',
            duration,
            ...sourceData
        });

        return await videoSource.save();
    } catch (error) {
        throw new Error(`Failed to add video source: ${error.message}`);
    }
}

// Update video source
async function updateVideoSource(sourceId, updateData) {
    try {
        const source = await VideoSources.findById(sourceId);
        if (!source) {
            throw new Error('Video source not found');
        }

        Object.assign(source, updateData);
        return await source.save();
    } catch (error) {
        throw new Error(`Failed to update video source: ${error.message}`);
    }
}

// Deactivate video source
async function deactivateVideoSource(sourceId) {
    try {
        return await VideoSources.findByIdAndUpdate(
            sourceId,
            { isActive: false },
            { new: true }
        );
    } catch (error) {
        throw new Error(`Failed to deactivate video source: ${error.message}`);
    }
}

// Get all episodes for a content
async function getContentEpisodes(contentId) {
    try {
        const sources = await VideoSources.find({
            contentId,
            isActive: true
        }).sort({ episodeId: 1 });

        // Group by episode and return episode info
        const episodes = sources.reduce((acc, source) => {
            const existingEpisode = acc.find(ep => ep.episodeId === source.episodeId);
            
            if (existingEpisode) {
                existingEpisode.sources.push(source);
            } else {
                acc.push({
                    episodeId: source.episodeId,
                    title: source.metadata?.title || `Episode ${source.episodeId}`,
                    duration: source.duration,
                    thumbnailUrl: source.thumbnailUrl,
                    sources: [source]
                });
            }
            
            return acc;
        }, []);

        return episodes;
    } catch (error) {
        throw new Error(`Failed to get content episodes: ${error.message}`);
    }
}

// Import video from external API (YouTube, Vimeo, etc.)
async function importVideoFromAPI(importData) {
    try {
        const { url, contentId, episodeId, sourceType } = importData;
        
        if (!url || !contentId || !sourceType) {
            throw new Error('Missing required fields for video import');
        }

        // Create basic video source first
        const videoSource = new VideoSources({
            contentId,
            episodeId: episodeId || 1,
            videoUrl: url,
            sourceType,
            duration: 0, // Will be updated after API fetch
            isActive: false // Will be activated after successful import
        });

        // Extract video ID
        const videoId = videoSource.extractVideoId();
        if (!videoId) {
            throw new Error('Could not extract video ID from URL');
        }

        // Here you would normally fetch metadata from external APIs
        // For now, we'll create a placeholder that can be enhanced later
        videoSource.metadata = {
            title: `Imported ${sourceType} video`,
            description: `Imported from ${url}`,
            uploadDate: new Date()
        };

        // Activate after successful processing
        videoSource.isActive = true;
        videoSource.duration = 3600; // Default 1 hour, should be fetched from API

        return await videoSource.save();
    } catch (error) {
        throw new Error(`Failed to import video: ${error.message}`);
    }
}

// Get watch statistics for a user profile
async function getWatchStatistics(userId, profileId) {
    try {
        const stats = await WatchProgress.aggregate([
            { $match: { userId, profileId } },
            {
                $group: {
                    _id: null,
                    totalWatchTime: { $sum: '$currentTime' },
                    totalContent: { $addToSet: '$contentId' },
                    completedContent: { 
                        $sum: { $cond: ['$completed', 1, 0] } 
                    },
                    averageWatchPercentage: { $avg: '$watchPercentage' }
                }
            }
        ]);

        const result = stats[0] || {
            totalWatchTime: 0,
            totalContent: [],
            completedContent: 0,
            averageWatchPercentage: 0
        };

        return {
            totalWatchTimeHours: Math.round(result.totalWatchTime / 3600 * 100) / 100,
            totalContentCount: result.totalContent.length,
            completedContentCount: result.completedContent,
            averageWatchPercentage: Math.round(result.averageWatchPercentage * 100) / 100
        };
    } catch (error) {
        throw new Error(`Failed to get watch statistics: ${error.message}`);
    }
}

module.exports = {
    getWatchProgress,
    saveWatchProgress,
    markAsCompleted,
    getRecentWatchHistory,
    getContentProgress,
    getVideoSources,
    getBestVideoSource,
    addVideoSource,
    updateVideoSource,
    deactivateVideoSource,
    getContentEpisodes,
    importVideoFromAPI,
    getWatchStatistics
};