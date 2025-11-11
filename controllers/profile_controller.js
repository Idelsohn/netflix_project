const userService = require('../models/services/user_service');
const sessionService = require('../models/services/session_service');
const profileService = require('../models/services/profile_service');

async function getAllProfiles(req, res) {
    try {
        const profiles = await profileService.getProfilesByUser(req.query.username);
        res.status(200).json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getProfile(req, res) {
    try {
        const profile = await profileService.getSpecificProfileOfUser(req.query.username, req.query.profile_name);
        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createProfile(req, res) {
    try {
        await profileService.createProfile(req.body);
        res.status(200).json({ success: true, message: 'Profile created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateProfile(req, res) {
    try {
        const { username, old_profile_name, ...profileData } = req.body;
        const updatedProfile = await profileService.updateProfile(username, old_profile_name, profileData);
        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile ' + old_profile_name + ' of username ' + username + ' not found' });
        }
        res.status(200).json(updatedProfile); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteProfile(req, res) {
    try {
        deletedProfile  = await profileService.deleteProfile(req.body.username, req.body.profile_name);
        if (!deletedProfile){
            return res.status(404).json({ message: 'Profile ' + req.body.profile_name + ' of username ' + req.body.username + ' not found' });
        }
        res.status(200).json({ message: 'Profile deleted' }); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAllProfiles,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile
};