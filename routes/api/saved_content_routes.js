const express = require('express');
const router = express.Router();
const savedContentController = require('../../controllers/saved_content_controller');

// Toggle saved content (like/unlike, add/remove from watchlist)
// POST /api/saved-content/toggle
router.post('/toggle', savedContentController.toggleSavedContent);

// Add content to saved list
// POST /api/saved-content/add
router.post('/add', savedContentController.addToSavedContent);

// Remove content from saved list
// POST /api/saved-content/remove
router.post('/remove', savedContentController.removeFromSavedContent);

// Check if content is saved by user
// GET /api/saved-content/check?contentId=1&profileId=1&type=liked
router.get('/check', savedContentController.checkSavedStatus);

// Get user's saved content by type
// GET /api/saved-content?profileId=1&type=liked&limit=10
router.get('/', savedContentController.getUserSavedContent);

// Get user's liked content
// GET /api/saved-content/liked?profileId=1&limit=10
router.get('/liked', savedContentController.getUserLikedContent);

// Get user's watchlist
// GET /api/saved-content/watchlist?profileId=1&limit=10
router.get('/watchlist', savedContentController.getUserWatchlist);

// Get user's bookmarked content
// GET /api/saved-content/bookmarked?profileId=1&limit=10
router.get('/bookmarked', savedContentController.getUserBookmarkedContent);

// Update saved content notes
// PUT /api/saved-content/notes
router.put('/notes', savedContentController.updateSavedContentNotes);

// Get saved content statistics
// GET /api/saved-content/statistics?profileId=1
router.get('/statistics', savedContentController.getSavedContentStatistics);

// Clear user's saved content
// DELETE /api/saved-content/clear
router.delete('/clear', savedContentController.clearUserSavedContent);

module.exports = router;