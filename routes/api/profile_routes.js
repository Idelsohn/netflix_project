const express = require('express');
const router = express.Router();  // create a router instance
const profileController = require('../../controllers/profile_controller');

router.get('/all', profileController.getAllProfiles); // Get all user profiles
// router.post('/create', profileController.createProfile); // Create a new user profile
// router.put('/update', profileController.updateProfile); // Update profile name
// router.delete('/:profile-name', profileController.deleteProfile); // Delete a user profile

module.exports = router;
