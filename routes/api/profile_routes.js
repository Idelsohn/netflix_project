const express = require('express');
const router = express.Router();  // create a router instance
const profileController = require('../../controllers/profile_controller');

router.get('/all', profileController.getAllProfiles); // Get all users' profiles
router.get('/my_profile', profileController.getProfile);
router.post('/create', profileController.createProfile); // Create a new user profile
router.put('/update', profileController.updateProfile); // Update profile name
router.delete('/delete', profileController.deleteProfile); // Delete a users' profile

module.exports = router;
