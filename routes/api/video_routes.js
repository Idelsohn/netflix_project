const express = require('express');
const router = express.Router();
const videoController = require('../../controllers/video_controller');

// Watch Progress Routes
router.get('/progress/:contentId/:episodeId', videoController.getWatchProgress);
router.post('/progress', videoController.saveWatchProgress);
router.post('/mark-completed', videoController.markAsCompleted);
router.get('/progress/content/:contentId', videoController.getContentProgress);

// Video Sources Routes
router.get('/sources/:contentId/:episodeId', videoController.getVideoSources);
router.get('/source/best/:contentId/:episodeId', videoController.getBestVideoSource);
router.post('/sources', videoController.addVideoSource);
router.put('/sources/:sourceId', videoController.updateVideoSource);
router.delete('/sources/:sourceId', videoController.deactivateVideoSource);

// Episodes and Content Routes
router.get('/episodes/:contentId', videoController.getContentEpisodes);

// User History and Statistics Routes
router.get('/history', videoController.getRecentWatchHistory);
router.get('/statistics', videoController.getWatchStatistics);

// Import Routes (Admin)
router.post('/import', videoController.importVideo);

module.exports = router;