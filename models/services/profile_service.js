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

// async function createProfile(userId, attrs = {}) {
//     const { name, type = 'adult', avatar = null, language = 'en', isActive = false } = attrs;

//     if (!userId) throw new Error('userId is required');
//     if (!name || typeof name !== 'string') throw new Error('name is required and must be a string');
//     if (!VALID_TYPES.includes(type)) throw new Error(`type must be one of: ${VALID_TYPES.join(', ')}`);

//     // ensure user exists
//     const user = await User.findByPk(userId);
//     if (!user) throw new Error('user not found');

//     const profile = await Profile.create({
//         userId,
//         name,
//         type,
//         avatar,
//         language,
//         isActive: Boolean(isActive),
//     });

//     return profile;
// }

// async function updateProfile(profileId, userId, attrs = {}) {
//     if (!profileId) throw new Error('profileId is required');
//     if (!userId) throw new Error('userId is required');

//     const profile = await Profile.findOne({ where: { id: profileId, userId } });
//     if (!profile) throw new Error('profile not found or does not belong to the user');

//     const updatable = {};
//     if (attrs.name !== undefined) {
//         if (!attrs.name || typeof attrs.name !== 'string') throw new Error('name must be a non-empty string');
//         updatable.name = attrs.name;
//     }
//     if (attrs.type !== undefined) {
//         if (!VALID_TYPES.includes(attrs.type)) throw new Error(`type must be one of: ${VALID_TYPES.join(', ')}`);
//         updatable.type = attrs.type;
//     }
//     if (attrs.avatar !== undefined) updatable.avatar = attrs.avatar;
//     if (attrs.language !== undefined) updatable.language = attrs.language;
//     if (attrs.isActive !== undefined) updatable.isActive = Boolean(attrs.isActive);

//     await profile.update(updatable);
//     return profile;
// }

// async function deleteProfile(profileId, userId) {
//     if (!profileId) throw new Error('profileId is required');
//     if (!userId) throw new Error('userId is required');

//     const profile = await Profile.findOne({ where: { id: profileId, userId } });
//     if (!profile) throw new Error('profile not found or does not belong to the user');

//     await profile.destroy();
//     return true;
// }

module.exports = {
    getProfilesByUser,
    getSpecificProfileOfUser,
    // createProfile,
    // updateProfile,
    // deleteProfile,
};