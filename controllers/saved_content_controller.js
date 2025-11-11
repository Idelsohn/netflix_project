const savedContentService = require('../models/services/saved_content_service');
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

// Toggle saved content (like/unlike, add/remove from watchlist)
async function toggleSavedContent(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { contentId, profileId, type, notes } = req.body;

        if (!contentId || !profileId) {
            return res.status(400).json({ 
                error: 'Missing required fields: contentId, profileId' 
            });
        }

        const result = await savedContentService.toggleSavedContent(
            username,
            parseInt(profileId),
            parseInt(contentId),
            type || 'liked',
            notes || ''
        );

        res.status(200).json({
            success: true,
            action: result.action,
            saved: result.saved,
            message: `Content ${result.action} ${result.saved ? 'to' : 'from'} ${type || 'liked'} list`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Add content to saved list
async function addToSavedContent(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { contentId, profileId, type, notes } = req.body;

        if (!contentId || !profileId) {
            return res.status(400).json({ 
                error: 'Missing required fields: contentId, profileId' 
            });
        }

        const savedItem = await savedContentService.addToSavedContent(
            username,
            parseInt(profileId),
            parseInt(contentId),
            type || 'liked',
            notes || ''
        );

        res.status(201).json({
            success: true,
            message: `Content added to ${type || 'liked'} list`,
            data: savedItem
        });
    } catch (error) {
        if (error.message.includes('already saved')) {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

// Remove content from saved list
async function removeFromSavedContent(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { contentId, profileId, type } = req.body;

        if (!contentId || !profileId) {
            return res.status(400).json({ 
                error: 'Missing required fields: contentId, profileId' 
            });
        }

        const result = await savedContentService.removeFromSavedContent(
            username,
            parseInt(profileId),
            parseInt(contentId),
            type || 'liked'
        );

        res.status(200).json({
            success: true,
            message: `Content removed from ${type || 'liked'} list`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

// Check if content is saved by user
async function checkSavedStatus(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { contentId, profileId, type } = req.query;

        if (!contentId || !profileId) {
            return res.status(400).json({ 
                error: 'Missing required query parameters: contentId, profileId' 
            });
        }

        const isSaved = await savedContentService.isContentSaved(
            username,
            parseInt(profileId),
            parseInt(contentId),
            type || 'liked'
        );

        res.status(200).json({
            contentId: parseInt(contentId),
            profileId: parseInt(profileId),
            type: type || 'liked',
            saved: isSaved
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get user's saved content by type
async function getUserSavedContent(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { profileId, type, limit } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const savedContent = await savedContentService.getUserSavedContent(
            username,
            parseInt(profileId),
            type || null,
            limit ? parseInt(limit) : null
        );

        res.status(200).json({
            profileId: parseInt(profileId),
            type: type || 'all',
            count: savedContent.length,
            savedContent: savedContent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get user's liked content
async function getUserLikedContent(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { profileId, limit } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const likedContent = await savedContentService.getUserLikedContent(
            username,
            parseInt(profileId),
            limit ? parseInt(limit) : null
        );

        res.status(200).json({
            profileId: parseInt(profileId),
            type: 'liked',
            count: likedContent.length,
            likedContent: likedContent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get user's watchlist
async function getUserWatchlist(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { profileId, limit } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const watchlist = await savedContentService.getUserWatchlist(
            username,
            parseInt(profileId),
            limit ? parseInt(limit) : null
        );

        res.status(200).json({
            profileId: parseInt(profileId),
            type: 'watchlist',
            count: watchlist.length,
            watchlist: watchlist
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get user's bookmarked content
async function getUserBookmarkedContent(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { profileId, limit } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const bookmarkedContent = await savedContentService.getUserBookmarkedContent(
            username,
            parseInt(profileId),
            limit ? parseInt(limit) : null
        );

        res.status(200).json({
            profileId: parseInt(profileId),
            type: 'bookmarked',
            count: bookmarkedContent.length,
            bookmarkedContent: bookmarkedContent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Update saved content notes
async function updateSavedContentNotes(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { contentId, profileId, type, notes } = req.body;

        if (!contentId || !profileId || !notes) {
            return res.status(400).json({ 
                error: 'Missing required fields: contentId, profileId, notes' 
            });
        }

        const updatedItem = await savedContentService.updateSavedContentNotes(
            username,
            parseInt(profileId),
            parseInt(contentId),
            type || 'liked',
            notes
        );

        res.status(200).json({
            success: true,
            message: 'Notes updated successfully',
            data: updatedItem
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}

// Get saved content statistics
async function getSavedContentStatistics(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { profileId } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const stats = await savedContentService.getSavedContentStatistics(
            username,
            parseInt(profileId)
        );

        res.status(200).json({
            profileId: parseInt(profileId),
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Clear user's saved content
async function clearUserSavedContent(req, res) {
    try {
        const username = await getCurrentUserFromSession(req);
        const { profileId, type } = req.body;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const result = await savedContentService.clearUserSavedContent(
            username,
            parseInt(profileId),
            type || null
        );

        res.status(200).json({
            success: true,
            message: `${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'} saved content cleared`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    toggleSavedContent,
    addToSavedContent,
    removeFromSavedContent,
    checkSavedStatus,
    getUserSavedContent,
    getUserLikedContent,
    getUserWatchlist,
    getUserBookmarkedContent,
    updateSavedContentNotes,
    getSavedContentStatistics,
    clearUserSavedContent
};