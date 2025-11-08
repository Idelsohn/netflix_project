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

// // GET /profile/:id/edit or GET /profile/edit
// async function editProfile(req, res) {
//     try {
//         const id = req.params.id || (req.user && req.user._id);
//         if (!id) return res.status(400).json({ error: 'Missing profile id' });

//         // only allow owner or admin to edit
//         if (!req.user) return res.status(401).json({ error: 'Authentication required' });
//         if (req.user._id.toString() !== id.toString() && !req.user.isAdmin) {
//             return res.status(403).json({ error: 'Forbidden' });
//         }

//         const user = await User.findById(id).select('-password');
//         if (!user) return res.status(404).json({ error: 'Profile not found' });

//         if (req.accepts('html')) return res.render('profile/edit', { user });
//         return res.json(user);
//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// }

// // PUT /profile or PUT /profile/:id
// async function updateProfile(req, res) {
//     try {
//         const id = req.params.id || (req.user && req.user._id);
//         if (!id) return res.status(400).json({ error: 'Missing profile id' });

//         if (!req.user) return res.status(401).json({ error: 'Authentication required' });
//         if (req.user._id.toString() !== id.toString() && !req.user.isAdmin) {
//             return res.status(403).json({ error: 'Forbidden' });
//         }

//         const allowed = ['name', 'email', 'bio']; // fields allowed to update
//         const updates = {};
//         for (const key of allowed) {
//             if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
//         }

//         // optional: handle password change separately with hashing
//         const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
//         if (!user) return res.status(404).json({ error: 'Profile not found' });

//         return res.json(user);
//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// }

module.exports = {
    getAllProfiles,
    // editProfile,
    // updateProfile
};