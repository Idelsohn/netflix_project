const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    profile_name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
