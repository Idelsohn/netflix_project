const SavedContent = require('../schemas/saved_content_schema');

// Add content to user's saved list
async function addToSavedContent(userId, profileId, contentId, type = 'liked', notes = '') {
    try {
        // Check if already saved using real MongoDB function: findOne
        const existingSave = await SavedContent.findOne({ userId, profileId, contentId, type });
        
        if (existingSave) {
            throw new Error('Content is already saved in this list');
        }

        const savedItem = new SavedContent({
            userId,
            profileId,
            contentId,
            type,
            notes,
            savedAt: new Date()
        });

        return await savedItem.save();
    } catch (error) {
        throw new Error(`Failed to add to saved content: ${error.message}`);
    }
}

// Remove content from user's saved list
async function removeFromSavedContent(userId, profileId, contentId, type = 'liked') {
    try {
        const result = await SavedContent.deleteOne({
            userId,
            profileId,
            contentId,
            type
        });

        if (result.deletedCount === 0) {
            throw new Error('Content was not found in saved list');
        }

        return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
        throw new Error(`Failed to remove from saved content: ${error.message}`);
    }
}

// Toggle saved content (add if not exists, remove if exists)
async function toggleSavedContent(userId, profileId, contentId, type = 'liked', notes = '') {
    try {
        // Use real MongoDB function: findOne to check if content exists
        const existingSave = await SavedContent.findOne({
            userId,
            profileId,
            contentId,
            type
        });
        
        if (existingSave) {
            // Use real MongoDB function: deleteOne to remove it
            await SavedContent.deleteOne({ _id: existingSave._id });
            return { action: 'removed', saved: false };
        } else {
            // Use real MongoDB functions: create new document and save
            const savedItem = new SavedContent({
                userId,
                profileId,
                contentId,
                type,
                notes,
                savedAt: new Date()
            });
            await savedItem.save();
            return { action: 'added', saved: true, data: savedItem };
        }
    } catch (error) {
        throw new Error(`Failed to toggle saved content: ${error.message}`);
    }
}

// Check if content is saved by user
async function isContentSaved(userId, profileId, contentId, type = 'liked') {
    try {
        // Use real MongoDB function: findOne
        const savedItem = await SavedContent.findOne({ userId, profileId, contentId, type });
        return !!savedItem;
    } catch (error) {
        throw new Error(`Failed to check saved status: ${error.message}`);
    }
}

// Get user's saved content by type
async function getUserSavedContent(userId, profileId, type = null, limit = null) {
    try {
        // Use real MongoDB function: find
        const query = { userId, profileId };
        if (type) {
            query.type = type;
        }
        
        let result = SavedContent.find(query).sort({ savedAt: -1 });
        
        if (limit) {
            result = result.limit(limit);
        }
        
        return await result;
    } catch (error) {
        throw new Error(`Failed to get saved content: ${error.message}`);
    }
}

// Get user's liked content
async function getUserLikedContent(userId, profileId, limit = null) {
    try {
        return await getUserSavedContent(userId, profileId, 'liked', limit);
    } catch (error) {
        throw new Error(`Failed to get liked content: ${error.message}`);
    }
}

// Get user's watchlist
async function getUserWatchlist(userId, profileId, limit = null) {
    try {
        return await getUserSavedContent(userId, profileId, 'watchlist', limit);
    } catch (error) {
        throw new Error(`Failed to get watchlist: ${error.message}`);
    }
}

// Get user's bookmarked content
async function getUserBookmarkedContent(userId, profileId, limit = null) {
    try {
        return await getUserSavedContent(userId, profileId, 'bookmarked', limit);
    } catch (error) {
        throw new Error(`Failed to get bookmarked content: ${error.message}`);
    }
}

// Get saved content with full content details (populated)
async function getUserSavedContentWithDetails(userId, profileId, type = null) {
    try {
        const savedItems = await getUserSavedContent(userId, profileId, type);
        
        // Note: Since we don't have a direct populate option, we'll need to manually fetch content details
        // This would require importing the Content model from the scripts or creating a proper content schema
        // For now, we return the saved items with contentId that can be used to fetch details separately
        
        return savedItems.map(item => ({
            contentId: item.contentId,
            type: item.type,
            savedAt: item.savedAt,
            notes: item.notes,
            _id: item._id
        }));
    } catch (error) {
        throw new Error(`Failed to get saved content with details: ${error.message}`);
    }
}

// Update saved content notes
async function updateSavedContentNotes(userId, profileId, contentId, type, notes) {
    try {
        // Use real MongoDB function: findOneAndUpdate
        const updatedItem = await SavedContent.findOneAndUpdate(
            { userId, profileId, contentId, type },
            { $set: { notes: notes } },
            { new: true }
        );

        if (!updatedItem) {
            throw new Error('Saved content not found');
        }

        return updatedItem;
    } catch (error) {
        throw new Error(`Failed to update saved content notes: ${error.message}`);
    }
}

// Get saved content statistics for user profile
async function getSavedContentStatistics(userId, profileId) {
    try {
        const stats = await SavedContent.aggregate([
            { $match: { userId, profileId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    latestSave: { $max: '$savedAt' }
                }
            }
        ]);

        const result = {
            liked: 0,
            watchlist: 0,
            bookmarked: 0,
            total: 0,
            latestActivity: null
        };

        let latestDate = null;

        stats.forEach(stat => {
            result[stat._id] = stat.count;
            result.total += stat.count;
            
            if (!latestDate || stat.latestSave > latestDate) {
                latestDate = stat.latestSave;
            }
        });

        result.latestActivity = latestDate;

        return result;
    } catch (error) {
        throw new Error(`Failed to get saved content statistics: ${error.message}`);
    }
}

// Remove all saved content for a user profile
async function clearUserSavedContent(userId, profileId, type = null) {
    try {
        const query = { userId, profileId };
        if (type) {
            query.type = type;
        }

        const result = await SavedContent.deleteMany(query);
        return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
        throw new Error(`Failed to clear saved content: ${error.message}`);
    }
}

module.exports = {
    addToSavedContent,
    removeFromSavedContent,
    toggleSavedContent,
    isContentSaved,
    getUserSavedContent,
    getUserLikedContent,
    getUserWatchlist,
    getUserBookmarkedContent,
    getUserSavedContentWithDetails,
    updateSavedContentNotes,
    getSavedContentStatistics,
    clearUserSavedContent
};