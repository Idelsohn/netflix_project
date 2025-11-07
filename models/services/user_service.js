const User = require('../schemas/user_schema');

// Get all users
async function getAllUsers() {
    return await User.find();
}

// Get user
async function getUser(username) {
    return await User.findOne({ username });
}

async function getUserByEmail(email) {
    return await User.findOne({ email });
}

// Create a new user
async function createUser(data) {
    const user = new User(data);
    return await user.save();
}

// Update user
async function updateUser(username, data) {
    return await User.findOneAndUpdate({ username }, data, { new: true });
}

// Delete user
async function deleteUser(username) {
    return await User.findOneAndDelete({ username });
}

module.exports = { 
    getAllUsers,
    getUser,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser
};
