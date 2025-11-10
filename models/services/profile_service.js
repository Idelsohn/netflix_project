const Profile = require('../schemas/profile_schema');

// get profiles by username
async function getProfilesByUser(username) {
    if (!username) {
        throw new Error('username is required');
    }
    const profiles = await Profile.find({ username });
    return profiles;
}

async function getSpecificProfileOfUser(username, profile_name) {
    if (!username || !profile_name) {
        throw new Error('username is required');
    }
    const profile = await Profile.findOne({ username, profile_name });
    return profile;
}

// Create a new Profile
async function createProfile(data) {
    const profile = new Profile(data);
    return await profile.save();
}

// Update profile
async function  updateProfile(username, old_profile_name, updatedData){
    return await Profile.findOneAndUpdate(
        {username, profile_name: old_profile_name }, 
        { $set: updatedData }, 
        { new: true }
    );
}

// Delete profile
async function deleteProfile(username, profileName) {
    return await Profile.findOneAndDelete({ username, profile_name: profileName });
}


module.exports = {
    getProfilesByUser,
    getSpecificProfileOfUser,
    createProfile,
    updateProfile,
    deleteProfile,
};