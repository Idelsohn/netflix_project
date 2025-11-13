const videoService = require('../models/services/video_service');
const sessionService = require('../models/services/session_service');

// Middleware to get current user from session
async function getCurrentUserFromSession(req) {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            throw new Error('No session found');
        }
        
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            throw new Error('Invalid session');
        }
        
        return session.user;
    } catch (error) {
        throw new Error('Authentication required');
    }
}

// Get watch progress for specific content and episode
async function getWatchProgress(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { contentId, episodeId } = req.params;
        const { profileId } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const progress = await videoService.getWatchProgress(
            username, 
            profileId, 
            parseInt(contentId), 
            parseInt(episodeId) || 1
        );

        if (!progress) {
            return res.status(200).json({ 
                progress: null, 
                message: 'No previous progress found' 
            });
        }

        res.status(200).json({ 
            progress: {
                currentTime: progress.currentTime,
                duration: progress.duration,
                watchPercentage: progress.watchPercentage,
                completed: progress.completed,
                lastWatched: progress.lastWatched
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Save watch progress
async function saveWatchProgress(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { contentId, episodeId, currentTime, duration, profileId, deviceInfo } = req.body;

        if (!contentId || !profileId || currentTime === undefined || !duration) {
            return res.status(400).json({ 
                error: 'Missing required fields: contentId, profileId, currentTime, duration' 
            });
        }

        const progressData = {
            username: username,
            profileId: profileId,
            contentId: parseInt(contentId),
            episodeId: parseInt(episodeId) || 1,
            currentTime: parseFloat(currentTime),
            duration: parseFloat(duration),
            deviceInfo: deviceInfo || req.headers['user-agent'] || 'unknown'
        };

        const savedProgress = await videoService.saveWatchProgress(progressData);

        res.status(200).json({ 
            success: true, 
            progress: {
                currentTime: savedProgress.currentTime,
                duration: savedProgress.duration,
                watchPercentage: savedProgress.watchPercentage,
                completed: savedProgress.completed
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Mark content as completed
async function markAsCompleted(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { contentId, episodeId, profileId } = req.body;

        if (!contentId || !profileId) {
            return res.status(400).json({ 
                error: 'Missing required fields: contentId, profileId' 
            });
        }

        const progress = await videoService.markAsCompleted(
            username,
            profileId,
            parseInt(contentId),
            parseInt(episodeId) || 1
        );

        res.status(200).json({ 
            success: true, 
            message: 'Content marked as completed',
            progress: {
                completed: progress.completed,
                watchPercentage: progress.watchPercentage
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get video sources for content and episode
async function getVideoSources(req, res) {
    try {
        await getCurrentUserFromSession(req); // Verify authentication
        
        const { contentId, episodeId } = req.params;
        
        const sources = await videoService.getVideoSources(
            parseInt(contentId), 
            parseInt(episodeId) || 1
        );

        if (!sources || sources.length === 0) {
            return res.status(404).json({ 
                error: 'No video sources found for this content' 
            });
        }

        // Transform sources for client consumption
        const transformedSources = sources.map(source => ({
            id: source._id,
            videoUrl: source.getEmbedUrl(),
            originalUrl: source.videoUrl,
            sourceType: source.sourceType,
            quality: source.quality,
            duration: source.duration,
            thumbnailUrl: source.thumbnailUrl,
            metadata: source.metadata
        }));

        res.status(200).json({ 
            sources: transformedSources,
            primarySource: transformedSources[0] // First source is usually the best quality
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get best quality video source
async function getBestVideoSource(req, res) {
    try {
        await getCurrentUserFromSession(req); // Verify authentication
        
        const { contentId, episodeId } = req.params;
        
        const source = await videoService.getBestVideoSource(
            parseInt(contentId), 
            parseInt(episodeId) || 1
        );

        if (!source) {
            return res.status(404).json({ 
                error: 'No video source found for this content' 
            });
        }

        res.status(200).json({ 
            source: {
                id: source._id,
                videoUrl: source.getEmbedUrl(),
                originalUrl: source.videoUrl,
                sourceType: source.sourceType,
                quality: source.quality,
                duration: source.duration,
                thumbnailUrl: source.thumbnailUrl,
                metadata: source.metadata
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get all episodes for a content
async function getContentEpisodes(req, res) {
    try {
        await getCurrentUserFromSession(req); // Verify authentication
        
        const { contentId } = req.params;
        const episodes = await videoService.getContentEpisodes(parseInt(contentId));

        res.status(200).json({ episodes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get user's recent watch history
async function getRecentWatchHistory(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { profileId, limit } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const history = await videoService.getRecentWatchHistory(
            username, 
            profileId, 
            parseInt(limit) || 10
        );

        res.status(200).json({ history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get all progress for a specific content
async function getContentProgress(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { contentId } = req.params;
        const { profileId } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const progress = await videoService.getContentProgress(
            username, 
            profileId, 
            parseInt(contentId)
        );

        res.status(200).json({ progress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Add new video source (admin function)
async function addVideoSource(req, res) {
    try {
        await getCurrentUserFromSession(req); // Verify authentication
        
        const sourceData = req.body;
        const newSource = await videoService.addVideoSource(sourceData);

        res.status(201).json({ 
            success: true, 
            message: 'Video source added successfully',
            source: newSource
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Import video from external API
async function importVideo(req, res) {
    try {
        await getCurrentUserFromSession(req); // Verify authentication
        
        const importData = req.body;
        const importedVideo = await videoService.importVideoFromAPI(importData);

        res.status(201).json({ 
            success: true, 
            message: 'Video imported successfully',
            video: importedVideo
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get watch statistics for user profile
async function getWatchStatistics(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { profileId } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const stats = await videoService.getWatchStatistics(
            username, 
            profileId
        );

        res.status(200).json({ statistics: stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Update video source
async function updateVideoSource(req, res) {
    try {
        await getCurrentUserFromSession(req); // Verify authentication
        
        const { sourceId } = req.params;
        const updateData = req.body;
        
        const updatedSource = await videoService.updateVideoSource(sourceId, updateData);

        res.status(200).json({ 
            success: true, 
            message: 'Video source updated successfully',
            source: updatedSource
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Deactivate video source
async function deactivateVideoSource(req, res) {
    try {
        await getCurrentUserFromSession(req); // Verify authentication
        
        const { sourceId } = req.params;
        
        await videoService.deactivateVideoSource(sourceId);

        res.status(200).json({ 
            success: true, 
            message: 'Video source deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getWatchProgress,
    saveWatchProgress,
    markAsCompleted,
    getVideoSources,
    getBestVideoSource,
    getContentEpisodes,
    getRecentWatchHistory,
    getContentProgress,
    addVideoSource,
    importVideo,
    getWatchStatistics,
    updateVideoSource,
    deactivateVideoSource
};